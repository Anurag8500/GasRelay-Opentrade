"use client";

import { useSearchParams } from "next/navigation";
import { MARKETPLACE_CATALOG } from "@/data/catalog";
import { motion } from "framer-motion";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const product = MARKETPLACE_CATALOG.find((p) => p.id === productId);

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
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-bold text-lg transition-colors">
          Confirm Payment
        </button>
      </motion.div>
    </div>
  );
}
