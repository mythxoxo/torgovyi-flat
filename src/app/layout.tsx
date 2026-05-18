import type { Metadata } from "next";
import "./globals.css";
import { PageShell } from "../components/page-shell";
import { TelegramBoot } from "../components/telegram-boot";
import { Providers } from "../components/wallet-context";

export const metadata: Metadata = {
  metadataBase: new URL("https://torgovyi-flat.vercel.app"),
  title: "TONK.MEM",
  description: "Launch TON meme tokens. Graduate to STON.fi.",
  openGraph: {
    title: "TONK.MEM",
    description: "Launch TON meme tokens. Graduate to STON.fi.",
    images: ["/brand/img_02.jpg"]
  },
  twitter: {
    card: "summary_large_image",
    title: "TONK.MEM",
    description: "Launch TON meme tokens. Graduate to STON.fi.",
    images: ["/brand/img_02.jpg"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <Providers>
          <TelegramBoot />
          <PageShell>{children}</PageShell>
        </Providers>
      </body>
    </html>
  );
}
