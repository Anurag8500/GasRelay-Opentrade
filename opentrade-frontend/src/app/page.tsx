"use client";

import Link from "next/link";
import { MARKETPLACE_CATALOG } from "@/data/catalog";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold">
          Direct Global Procurement. Zero Gas Friction.
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Connect with verified suppliers worldwide and trade commodities seamlessly with GasRelay-powered gas abstraction.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MARKETPLACE_CATALOG.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-white">{product.name}</h3>
                <p className="text-slate-400 mt-1">{product.mass}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-slate-400">Price</span>
                  <span className="text-2xl font-bold text-blue-400">
                    ${product.netPriceUSDC.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Supplier</span>
                  <span className="text-slate-300">{product.supplierName}</span>
                </div>
              </div>
              <Link href={`/checkout?productId=${product.id}`}>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors">
                  Buy Commodity
                </button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
