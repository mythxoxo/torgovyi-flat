import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { PageShell } from "../components/page-shell";
import { TelegramBoot } from "../components/telegram-boot";
import { Providers } from "../components/wallet-context";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-syne" });
const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "TONK.MEM — TON Meme Launchpad",
  description: "Запускай мем-токены в TON Testnet. Bonding curve, instant listing, реферальная система.",
  icons: { icon: "/icon.svg", shortcut: "/icon.svg" },
  openGraph: {
    title: "TONK.MEM — TON Meme Launchpad",
    description: "Запускай мем-токены в TON Testnet. Bonding curve, instant listing, реферальная система.",
    type: "website",
    images: ["/brand/img_02.jpg"]
  },
  twitter: {
    card: "summary_large_image",
    title: "TONK.MEM — TON Meme Launchpad",
    description: "Запускай мем-токены в TON Testnet. Bonding curve, instant listing, реферальная система.",
    images: ["/brand/img_02.jpg"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className={`${spaceGrotesk.variable} ${jetBrainsMono.variable}`}>
        <Providers>
          <TelegramBoot />
          <PageShell>{children}</PageShell>
        </Providers>
      </body>
    </html>
  );
}
