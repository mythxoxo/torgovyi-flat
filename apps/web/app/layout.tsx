import type { Metadata } from "next";
import { Space_Mono, Syne } from "next/font/google";
import "./globals.css";

import { Navbar } from "../components/layout/navbar";
import { TopBar } from "../components/layout/top-bar";
import { TmaProvider } from "../components/providers/TmaProvider";
import { Providers } from "../components/wallet-context";

const syne = Syne({ subsets: ["latin"], variable: "--font-syne" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "TON Meme Launchpad MVP",
  description: "Telegram Mini App launchpad for meme tokens on TON.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${mono.variable} font-syne`}>
        <Providers>
          <TmaProvider>
            <TopBar />
            <div className="mx-auto min-h-screen w-full max-w-5xl px-4 pb-24 pt-4 sm:px-6">{children}</div>
            <Navbar />
          </TmaProvider>
        </Providers>
      </body>
    </html>
  );
}
