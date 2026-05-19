import * as StellarSdk from "@stellar/stellar-sdk";
import { GASRELAY_TREASURY_SECRET } from "../config";
import { validatePreFlightShields, server } from "./horizon";

export async function processAndRelayTransaction(intentXdr: string): Promise<string> {
  await validatePreFlightShields(intentXdr);

  const innerTransaction = StellarSdk.TransactionBuilder.fromXDR(
    intentXdr,
    StellarSdk.Networks.TESTNET
  ) as StellarSdk.Transaction;

  const treasuryKeypair = StellarSdk.Keypair.fromSecret(GASRELAY_TREASURY_SECRET);

  if (innerTransaction.source === treasuryKeypair.publicKey()) {
    innerTransaction.sign(treasuryKeypair);
  }

  const feeBumpTransaction = StellarSdk.TransactionBuilder.buildFeeBumpTransaction(
    treasuryKeypair,
    "100",
    innerTransaction,
    StellarSdk.Networks.TESTNET
  );

  feeBumpTransaction.sign(treasuryKeypair);

  const result = await server.submitTransaction(feeBumpTransaction);

  return result.hash;
}
