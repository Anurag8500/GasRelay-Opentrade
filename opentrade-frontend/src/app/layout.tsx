import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpenTrade",
  description: "Direct Global Procurement. Zero Gas Friction.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-50">
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
            <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition-colors">
              Connect Wallet
            </button>
          </div>
        </header>
        <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
