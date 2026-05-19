"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { isConnected, isAllowed, setAllowed, getAddress, getNetwork } from "@stellar/freighter-api";

interface WalletContextType {
  publicKey: string | null;
  isWalletConnected: boolean;
  network: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [network, setNetwork] = useState<string | null>(null);

  const checkConnection = useCallback(async () => {
    try {
      const { isConnected: freighterConnected } = await isConnected();
      if (!freighterConnected) return;

      const { isAllowed: allowed } = await isAllowed();
      if (allowed) {
        const { address } = await getAddress();
        const { network: net } = await getNetwork();
        setPublicKey(address);
        setIsWalletConnected(true);
        setNetwork(net);
      }
    } catch (error) {
      console.error("Check connection failed:", error);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      const { isConnected: freighterConnected } = await isConnected();
      if (!freighterConnected) {
        throw new Error("Freighter extension not installed");
      }

      await setAllowed();
      const { address } = await getAddress();
      const { network: net } = await getNetwork();

      setPublicKey(address);
      setIsWalletConnected(true);
      setNetwork(net);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setPublicKey(null);
    setIsWalletConnected(false);
    setNetwork(null);
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return (
    <WalletContext.Provider
      value={{
        publicKey,
        isWalletConnected,
        network,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
