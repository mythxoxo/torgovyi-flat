import type { Metadata } from "next";
import { Syne, Space_Mono } from "next/font/google";
import "./globals.css";
import { PageShell } from "../components/page-shell";
import { TelegramBoot } from "../components/telegram-boot";
import { Providers } from "../components/wallet-context";

const syne = Syne({ subsets: ["latin"], variable: "--font-syne" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "TONK.MEM",
  description: "Launch meme tokens on TON",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg"
  },
  openGraph: {
    title: "TONK.MEM",
    description: "Launch. Meme. Earn.",
    images: ["/brand/img_02.jpg"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${mono.variable}`}>
        <Providers>
          <TelegramBoot />
          <PageShell>{children}</PageShell>
        </Providers>
      </body>
    </html>
  );
}
