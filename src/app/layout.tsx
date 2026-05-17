import type { Metadata } from "next";
import { Bebas_Neue, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { PageShell } from "../components/page-shell";
import { TelegramBoot } from "../components/telegram-boot";
import { Providers } from "../components/wallet-context";

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-syne" });
const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "TONK.MEM — TON Meme Launchpad",
  description: "Запускай мем-токены в TON Testnet. Bonding curve, мгновенный листинг, реферальная система.",
  icons: { icon: "/icon.svg", shortcut: "/icon.svg" },
  openGraph: {
    title: "TONK.MEM — TON Meme Launchpad",
    description: "Запускай мем-токены в TON Testnet. Bonding curve, мгновенный листинг, реферальная система.",
    images: [{ url: "/brand/img_02.jpg", width: 1200, height: 630 }],
    type: "website",
    siteName: "TONK.MEM"
  },
  twitter: {
    card: "summary_large_image",
    title: "TONK.MEM — TON Meme Launchpad",
    description: "Запускай мем-токены в TON Testnet."
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className={`${bebas.variable} ${jetBrainsMono.variable}`}>
        <Providers>
          <TelegramBoot />
          <PageShell>{children}</PageShell>
        </Providers>
      </body>
    </html>
  );
}
