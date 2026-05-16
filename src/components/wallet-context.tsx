"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import {
  CHAIN,
  TonConnectUIProvider,
  useIsConnectionRestored,
  useTonAddress,
  useTonConnectUI,
  useTonWallet
} from "@tonconnect/ui-react";

import type { TonTransactionDraft } from "../lib/ton";

type WalletSource = "tonconnect" | "demo" | "none";

const DEFAULT_DEMO_WALLET = "EQDEMO00000000000000000000000000000000000000000";
const allowDemoWallet = process.env.NEXT_PUBLIC_ALLOW_DEMO_WALLET === "true";
const REQUIRED_CHAIN = CHAIN.TESTNET;

const WalletContext = createContext<{
  wallet: string;
  walletSource: WalletSource;
  isConnected: boolean;
  isConnectionRestored: boolean;
  isTestnet: boolean;
  networkLabel: string;
  networkWarning: string;
  canUseDemoWallet: boolean;
  setDemoWallet: (wallet: string) => void;
  sendTransaction: (draft: TonTransactionDraft) => Promise<unknown>;
}>({
  wallet: "",
  walletSource: "none",
  isConnected: false,
  isConnectionRestored: false,
  isTestnet: false,
  networkLabel: "Testnet",
  networkWarning: "",
  canUseDemoWallet: allowDemoWallet,
  setDemoWallet: () => {},
  sendTransaction: async () => {
    throw new Error("TonConnect is not ready");
  }
});

function WalletBridge({ children }: { children: ReactNode }) {
  const [tonConnectUI] = useTonConnectUI();
  const tonWallet = useTonWallet();
  const tonAddress = useTonAddress();
  const isConnectionRestored = useIsConnectionRestored();
  const [demoWallet, setDemoWalletState] = useState(DEFAULT_DEMO_WALLET);

  useEffect(() => {
    tonConnectUI.setConnectionNetwork(REQUIRED_CHAIN);
  }, [tonConnectUI]);

  useEffect(() => {
    if (!allowDemoWallet || typeof window === "undefined") {
      return;
    }

    const storedWallet = window.localStorage.getItem("demo-wallet");
    if (storedWallet) {
      setDemoWalletState(storedWallet);
    } else {
      window.localStorage.setItem("demo-wallet", DEFAULT_DEMO_WALLET);
    }
  }, []);

  const value = useMemo(() => {
    const wallet = tonAddress || (allowDemoWallet ? demoWallet : "");
    const walletSource: WalletSource = tonAddress
      ? "tonconnect"
      : allowDemoWallet && demoWallet
        ? "demo"
        : "none";
    const walletChain = tonWallet?.account.chain;
    const isTestnet = walletSource !== "tonconnect" || walletChain === REQUIRED_CHAIN;
    const networkLabel =
      walletSource === "tonconnect"
        ? walletChain === REQUIRED_CHAIN
          ? "Testnet"
          : walletChain === CHAIN.MAINNET
            ? "Mainnet"
            : walletChain || "Unknown"
        : "Testnet";

    return {
      wallet,
      walletSource,
      isConnected: Boolean(tonWallet),
      isConnectionRestored,
      isTestnet,
      networkLabel,
      networkWarning:
        walletSource === "tonconnect" && !isTestnet
          ? "Switch wallet to TON testnet before sending launchpad transactions."
          : "",
      canUseDemoWallet: allowDemoWallet,
      setDemoWallet: (nextWallet: string) => {
        if (!allowDemoWallet) {
          return;
        }

        setDemoWalletState(nextWallet);
        if (typeof window !== "undefined") {
          window.localStorage.setItem("demo-wallet", nextWallet);
        }
      },
      sendTransaction: async (draft: TonTransactionDraft) => {
        if (!tonWallet) {
          throw new Error("Connect a TON wallet first");
        }

        if (tonWallet.account.chain !== REQUIRED_CHAIN) {
          throw new Error("Wrong network: switch your wallet to TON testnet");
        }

        return tonConnectUI.sendTransaction(draft);
      }
    };
  }, [demoWallet, isConnectionRestored, tonAddress, tonConnectUI, tonWallet]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function Providers({ children }: { children: ReactNode }) {
  const manifestUrl =
    process.env.NEXT_PUBLIC_TONCONNECT_MANIFEST_URL ||
    "http://localhost:3000/tonconnect-manifest.json";

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <WalletBridge>{children}</WalletBridge>
    </TonConnectUIProvider>
  );
}

export const useWallet = () => useContext(WalletContext);
