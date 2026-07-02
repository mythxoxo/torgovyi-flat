import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Sora } from "next/font/google";
import "./globals.css";
import "./premium-degen.css";
import "./header-fix.css";
import { PageShell } from "../components/page-shell";
import { TelegramBoot } from "../components/telegram-boot";
import { Providers } from "../components/wallet-context";

const geist = Geist({
  subsets: ["latin", "cyrillic"],
  variable: "--font-geist",
  display: "swap"
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"]
});

const brandIcon = "/brand/tons-of-gram-tonconnect.svg";

export const metadata: Metadata = {
  metadataBase: new URL("https://torgovyi-flat.vercel.app"),
  title: "TONS of GRAM Launchpad",
  description: "Wallet-first TON launchpad for bonding token launches.",
  icons: {
    icon: brandIcon,
    shortcut: brandIcon,
    apple: brandIcon
  },
  openGraph: {
    title: "TONS of GRAM Launchpad",
    description: "Wallet-first TON launchpad for bonding token launches.",
    images: [brandIcon]
  },
  twitter: {
    card: "summary_large_image",
    title: "TONS of GRAM Launchpad",
    description: "Wallet-first TON launchpad for bonding token launches.",
    images: [brandIcon]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${geist.variable} ${sora.variable}`}>
      <body>
        <Providers>
          <TelegramBoot />
          <PageShell>{children}</PageShell>
        </Providers>
      </body>
    </html>
  );
}
