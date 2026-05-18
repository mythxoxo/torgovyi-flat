"use client";

import {
  createContext,
  useContext,
  useMemo,
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

type WalletSource = "tonconnect" | "none";
const REQUIRED_CHAIN = CHAIN.MAINNET;
const FALLBACK_MANIFEST = "https://tonk.mem/tonconnect-manifest.json";

const WalletContext = createContext<{
  wallet: string;
  walletSource: WalletSource;
  isConnected: boolean;
  isConnectionRestored: boolean;
  isMainnet: boolean;
  networkLabel: string;
  networkWarning: string;
  sendTransaction: (draft: TonTransactionDraft) => Promise<unknown>;
}>({
  wallet: "",
  walletSource: "none",
  isConnected: false,
  isConnectionRestored: false,
  isMainnet: false,
  networkLabel: "Mainnet",
  networkWarning: "",
  sendTransaction: async () => {
    throw new Error("TonConnect is not ready");
  }
});

function WalletBridge({ children }: { children: ReactNode }) {
  const [tonConnectUI] = useTonConnectUI();
  const tonWallet = useTonWallet();
  const tonAddress = useTonAddress();
  const isConnectionRestored = useIsConnectionRestored();

  const value = useMemo(() => {
    const wallet = tonAddress || "";
    const walletSource: WalletSource = tonAddress ? "tonconnect" : "none";
    const walletChain = tonWallet?.account.chain;
    const isMainnet = walletSource === "tonconnect" && walletChain === REQUIRED_CHAIN;
    const networkLabel =
      walletSource === "tonconnect"
        ? walletChain === REQUIRED_CHAIN
          ? "Mainnet"
          : walletChain === CHAIN.TESTNET
            ? "Testnet"
            : walletChain || "Unknown"
        : "Mainnet";

    return {
      wallet,
      walletSource,
      isConnected: Boolean(tonWallet),
      isConnectionRestored,
      isMainnet,
      networkLabel,
      networkWarning:
        walletSource === "tonconnect" && !isMainnet
          ? "Переключи кошелёк на TON mainnet, иначе транзакция не пройдёт."
          : "",
      sendTransaction: async (draft: TonTransactionDraft) => {
        if (!tonWallet) {
          throw new Error("Сначала подключи TON кошелёк");
        }

        if (tonWallet.account.chain !== REQUIRED_CHAIN) {
          throw new Error("Нужен TON mainnet");
        }

        return tonConnectUI.sendTransaction(draft);
      }
    };
  }, [isConnectionRestored, tonAddress, tonConnectUI, tonWallet]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <TonConnectUIProvider manifestUrl={FALLBACK_MANIFEST}>
      <WalletBridge>{children}</WalletBridge>
    </TonConnectUIProvider>
  );
}

export const useWallet = () => useContext(WalletContext);
