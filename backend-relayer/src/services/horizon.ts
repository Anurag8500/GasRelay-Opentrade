import * as StellarSdk from "@stellar/stellar-sdk";
import { HORIZON_URL } from "../config";

const server = new StellarSdk.Horizon.Server(HORIZON_URL);

export async function validatePreFlightShields(xdrString: string): Promise<boolean> {
  try {
    const transaction = StellarSdk.TransactionBuilder.fromXDR(xdrString, StellarSdk.Networks.TESTNET);

    if (!("source" in transaction)) {
      throw new Error("MALFORMED_XDR");
    }

    const buyerPublicKey = transaction.source;

    const account = await server.loadAccount(buyerPublicKey);

    const nativeBalance = account.balances.find((b) => b.asset_type === "native");
    if (!nativeBalance || parseFloat(nativeBalance.balance) < 1.5) {
      throw new Error("RESERVE_VIOLATION");
    }

    const usdcBalance = account.balances.find(
      (b) => b.asset_type === "credit_alphanum4" && b.asset_code === "USDC"
    );
    if (!usdcBalance || parseFloat(usdcBalance.balance) <= 0) {
      throw new Error("INSUFFICIENT_FUNDS");
    }

    return true;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "RESERVE_VIOLATION" || error.message === "INSUFFICIENT_FUNDS" || error.message === "MALFORMED_XDR") {
        throw error;
      }
      if (error.message.includes("NotFound")) {
        throw new Error("SENDER_ACCOUNT_NOT_FOUND");
      }
      throw new Error("MALFORMED_XDR");
    }
    throw error;
  }
}

export { server };
