import type { Metadata } from "next";
import "./globals.css";

import { PageShell } from "../components/page-shell";
import { TelegramBoot } from "../components/telegram-boot";
import { Providers } from "../components/wallet-context";

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
      <body>
        <Providers>
          <TelegramBoot />
          <PageShell>{children}</PageShell>
        </Providers>
      </body>
    </html>
  );
}
