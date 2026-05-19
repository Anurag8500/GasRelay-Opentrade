"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MARKETPLACE_CATALOG } from "@/data/catalog";
import { motion } from "framer-motion";
import { useWallet } from "@/context/WalletContext";
import {
  TransactionBuilder,
  Networks,
  Horizon,
  Operation,
  Asset,
  Claimant,
} from "@stellar/stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";

const USDC_ISSUER = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const TREASURY_PUBLIC_KEY = "GCRGPKMKAFRLN7X7IXV63QUFNLFD7F7RPFIEKZKBGUWRGECM6PK7VMRV";
const usdcAsset = new Asset("USDC", USDC_ISSUER);
const server = new Horizon.Server("https://horizon-testnet.stellar.org");

function CheckoutContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const product = MARKETPLACE_CATALOG.find((p) => p.id === productId);
  const { isWalletConnected, publicKey } = useWallet();

  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePayment = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      if (!isWalletConnected || !publicKey) {
        throw new Error("Please connect your wallet first");
      }

      const account = await server.loadAccount(publicKey);
      const gasRelayFee = Math.max(0.01, product!.netPriceUSDC * 0.001);

      let isGhost = false;
      try {
        const supplierAcc = await server.loadAccount(product!.supplierPublicKey);
        const hasTrustline = supplierAcc.balances.some(
          (b) => b.asset_type === "credit_alphanum4" && b.asset_code === "USDC" && b.asset_issuer === USDC_ISSUER
        );
        if (!hasTrustline) isGhost = true;
      } catch (e) {
        isGhost = true;
      }

      const builder = new TransactionBuilder(account, {
        fee: "0",
        networkPassphrase: Networks.TESTNET,
      });

      if (isGhost) {
        builder.addOperation(
          Operation.createClaimableBalance({
            asset: usdcAsset,
            amount: product!.netPriceUSDC.toString(),
            claimants: [
              new Claimant(
                product!.supplierPublicKey,
                Claimant.predicateUnconditional()
              ),
            ],
          })
        );
      } else {
        builder.addOperation(
          Operation.payment({
            destination: product!.supplierPublicKey,
            asset: usdcAsset,
            amount: product!.netPriceUSDC.toString(),
          })
        );
      }

      builder.addOperation(
        Operation.payment({
          destination: TREASURY_PUBLIC_KEY,
          asset: usdcAsset,
          amount: gasRelayFee.toString(),
        })
      ).setTimeout(180);

      const transaction = builder.build();
      const unsignedXdr = transaction.toXDR();

      const { signedTxXdr } = await signTransaction(unsignedXdr, {
        networkPassphrase: Networks.TESTNET,
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/relay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ intentXdr: signedTxXdr }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Transaction failed");
      }

      if (data.success) {
        setTxHash(data.hash);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-200">No active invoice found</h2>
        <p className="text-slate-400 mt-2">Please return to the marketplace to select a product.</p>
      </div>
    );
  }

  const gasRelayFee = Math.max(0.01, product.netPriceUSDC * 0.001);
  const totalBilled = product.netPriceUSDC + gasRelayFee;

  if (txHash) {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">✅</span>
            <h2 className="text-2xl font-bold text-emerald-300">
              Transaction Settled Gas-Free!
            </h2>
          </div>
          <p className="text-emerald-200 mb-8">
            Your commodity order has been successfully processed and paid for.
          </p>
          <Link
            href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-lg font-bold text-lg transition-colors text-center"
          >
            View Transaction on Stellar Expert
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-8">Invoice Summary</h2>
        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center py-3 border-b border-slate-800">
            <span className="text-slate-300">Commodity Principal Cost</span>
            <span className="text-slate-100 font-semibold">
              ${product.netPriceUSDC.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-slate-800">
            <span className="text-slate-300">Gasless Processing Fee (0.1%)</span>
            <span className="text-slate-100 font-semibold">
              ${gasRelayFee.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-slate-800">
            <span className="text-slate-300">Final Total Billed</span>
            <span className="text-2xl font-bold text-blue-400">
              ${totalBilled.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC
            </span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-slate-400">Network Gas Fee</span>
            <span className="text-emerald-400 font-semibold">
              0.0000 XLM (Sponsored by GasRelay)
            </span>
          </div>
        </div>
        {errorMessage && (
          <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4 mb-6">
            <p className="text-red-400">{errorMessage}</p>
          </div>
        )}
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className={`w-full py-4 rounded-lg font-bold text-lg transition-colors ${
            isProcessing
              ? "bg-slate-700 text-slate-400 opacity-50 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isProcessing ? "Awaiting Signature & Relaying..." : "Confirm Payment"}
        </button>
      </motion.div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
