"use client";

import Link from "next/link";
import { useWallet } from "@/context/WalletContext";

export default function Navbar() {
  const { publicKey, isWalletConnected, connectWallet, disconnectWallet } =
    useWallet();

  const truncatePublicKey = (key: string) => {
    return `${key.slice(0, 5)}...${key.slice(-4)}`;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span>🛡️</span>
          <span>OpenTrade</span>
        </Link>
        <nav className="flex items-center gap-8">
          <Link
            href="/"
            className="text-slate-300 hover:text-white transition-colors font-medium"
          >
            Marketplace
          </Link>
          <Link
            href="/supplier"
            className="text-slate-300 hover:text-white transition-colors font-medium"
          >
            Supplier Portal
          </Link>
        </nav>
        {!isWalletConnected ? (
          <button
            onClick={connectWallet}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Connect Wallet
          </button>
        ) : (
          <button
            onClick={disconnectWallet}
            className="bg-slate-800 text-emerald-400 border border-slate-700 px-6 py-2 rounded-lg font-semibold transition-colors hover:bg-slate-700"
          >
            {publicKey && truncatePublicKey(publicKey)}
          </button>
        )}
      </div>
    </header>
  );
}
