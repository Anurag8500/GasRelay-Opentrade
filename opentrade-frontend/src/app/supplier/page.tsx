"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useWallet } from "@/context/WalletContext";
import {
  TransactionBuilder,
  Networks,
  Horizon,
  Operation,
  Asset,
} from "@stellar/stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";

const USDC_ISSUER = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const TREASURY_PUBLIC_KEY = "GCRGPKMKAFRLN7X7IXV63QUFNLFD7F7RPFIEKZKBGUWRGECM6PK7VMRV";
const usdcAsset = new Asset("USDC", USDC_ISSUER);
const server = new Horizon.Server("https://horizon-testnet.stellar.org");

export default function SupplierPage() {
  const { isWalletConnected, publicKey } = useWallet();

  const [claimableBalanceId, setClaimableBalanceId] = useState<string | null>(null);
  const [vaultAmount, setVaultAmount] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const scanForClaimableBalances = async () => {
      if (!isWalletConnected || !publicKey) return;

      try {
        const response = await server.claimableBalances().claimant(publicKey).call();
        if (response.records.length > 0) {
          const balance = response.records[0];
          setClaimableBalanceId(balance.id);
          setVaultAmount(balance.amount);
        }
      } catch (error) {
        console.error("Failed to scan for claimable balances:", error);
      }
    };

    scanForClaimableBalances();
  }, [isWalletConnected, publicKey]);

  const handleClaimPayout = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      if (!isWalletConnected || !publicKey || !claimableBalanceId || !vaultAmount) {
        throw new Error("Please connect your wallet first");
      }

      const treasuryAccount = await server.loadAccount(TREASURY_PUBLIC_KEY);

      const builder = new TransactionBuilder(treasuryAccount, {
        fee: "0",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.beginSponsoringFutureReserves({
            sponsoredId: publicKey,
          })
        )
        .addOperation(
          Operation.createAccount({
            destination: publicKey,
            startingBalance: "0",
          })
        )
        .addOperation(
          Operation.changeTrust({
            asset: usdcAsset,
            limit: "1000000",
            source: publicKey,
          })
        )
        .addOperation(
          Operation.claimClaimableBalance({
            balanceId: claimableBalanceId,
            source: publicKey,
          })
        )
        .addOperation(
          Operation.payment({
            destination: TREASURY_PUBLIC_KEY,
            asset: usdcAsset,
            amount: "0.50",
            source: publicKey,
          })
        )
        .addOperation(
          Operation.endSponsoringFutureReserves({
            source: publicKey,
          })
        )
        .setTimeout(180);

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

  const netAmount = vaultAmount ? (parseFloat(vaultAmount) - 0.5).toFixed(2) : "0";

  if (txHash) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Supplier Portal & Payout Engine</h1>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">✅</span>
            <h2 className="text-xl font-bold text-emerald-300">
              Payout Claimed Successfully!
            </h2>
          </div>
          <p className="text-emerald-200 mb-8">
            Your payout has been successfully processed and your account has been activated.
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
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Supplier Portal & Payout Engine</h1>
      </div>

      {!isWalletConnected ? (
        <div className="text-center py-20">
          <p className="text-2xl font-semibold text-slate-200">
            Please connect your wallet to scan for pending payouts.
          </p>
        </div>
      ) : !claimableBalanceId ? (
        <div className="text-center py-20">
          <p className="text-2xl font-semibold text-slate-200">
            No pending commercial invoices found.
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">📦</span>
            <h2 className="text-xl font-bold text-emerald-300">
              Commercial Invoice Paid!
            </h2>
          </div>
          <p className="text-emerald-200 mb-8">
            You have ${parseFloat(vaultAmount || "0").toFixed(2)} USDC waiting in a secure ledger vault.
          </p>
          <div className="bg-slate-900/50 rounded-lg p-6 mb-8 space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-800">
              <span className="text-slate-300">Gross Payout Reserved</span>
              <span className="text-slate-100 font-semibold">
                ${parseFloat(vaultAmount || "0").toFixed(2)} USDC
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800">
              <span className="text-slate-300">One-time Account Activation Setup Fee</span>
              <span className="text-red-400 font-semibold">-$0.50 USDC</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800">
              <span className="text-slate-300">Net Payout Allocated to Your Wallet</span>
              <span className="text-2xl font-bold text-emerald-400">
                ${netAmount} USDC
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-400">Network Storage Cost</span>
              <span className="text-emerald-400 font-semibold">
                Sponsored ($0.00 XLM)
              </span>
            </div>
          </div>
          {errorMessage && (
            <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4 mb-6">
              <p className="text-red-400">{errorMessage}</p>
            </div>
          )}
          <button
            onClick={handleClaimPayout}
            disabled={isProcessing}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-colors ${
              isProcessing
                ? "bg-slate-700 text-slate-400 opacity-50 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {isProcessing ? "Awaiting Signature & Relaying..." : "Claim Payout Gas-Free"}
          </button>
        </motion.div>
      )}
    </div>
  );
}
