"use client";

import { motion } from "framer-motion";

export default function SupplierPage() {
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
          <span className="text-2xl">📦</span>
          <h2 className="text-xl font-bold text-emerald-300">Commercial Invoice Paid!</h2>
        </div>
        <p className="text-emerald-200 mb-8">
          You have $5,000.00 USDC waiting in a secure ledger vault from the European Coffee Shop purchase.
        </p>
        <div className="bg-slate-900/50 rounded-lg p-6 mb-8 space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-slate-800">
            <span className="text-slate-300">Gross Payout Reserved</span>
            <span className="text-slate-100 font-semibold">$5,000.00 USDC</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-800">
            <span className="text-slate-300">One-time Account Activation Setup Fee</span>
            <span className="text-red-400 font-semibold">-$0.50 USDC</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-800">
            <span className="text-slate-300">Net Payout Allocated to Your Wallet</span>
            <span className="text-2xl font-bold text-emerald-400">$4,999.50 USDC</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-slate-400">Network Storage Cost</span>
            <span className="text-emerald-400 font-semibold">Sponsored ($0.00 XLM)</span>
          </div>
        </div>
        <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-lg font-bold text-lg transition-colors">
          Claim Payout Gas-Free
        </button>
      </motion.div>
    </div>
  );
}
