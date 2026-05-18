import type { Metadata } from "next";
import { Space_Mono, Syne } from "next/font/google";
import "./globals.css";
import { PageShell } from "../components/page-shell";
import { TelegramBoot } from "../components/telegram-boot";
import { Providers } from "../components/wallet-context";

const syne = Syne({ subsets: ["latin"], variable: "--font-syne" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://torgovyi-flat.vercel.app"),
  title: "TONK.MEM Mainnet",
  description: "TONK.MEM Mainnet",
  openGraph: {
    title: "TONK.MEM Mainnet",
    description: "TONK.MEM Mainnet",
    images: ["/brand/img_02.jpg"]
  },
  twitter: {
    card: "summary_large_image",
    title: "TONK.MEM Mainnet",
    description: "TONK.MEM Mainnet",
    images: ["/brand/img_02.jpg"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className={`${syne.variable} ${mono.variable}`}>
        <Providers>
          <TelegramBoot />
          <PageShell>{children}</PageShell>
        </Providers>
      </body>
    </html>
  );
}
