import Image from "next/image";
import Link from "next/link";
import type { TokenRecord } from "../lib/shared";
import { ProgressBar } from "./progress-bar";

function statusMeta(token: TokenRecord) {
  if (token.status === "GRADUATED") {
    return { label: "✅ Graduated", className: "bg-white/10 text-white" };
  }

  const pct = token.state.progress * 100;
  if (pct >= 75) {
    return { label: "💎 Almost Grad", className: "bg-[#00c896]/20 text-[#00c896]" };
  }

  if (pct >= 40) {
    return { label: "🔥 Trending", className: "bg-[#0088cc]/20 text-[#0088cc]" };
  }

  return { label: "🆕 New", className: "bg-white/10 text-[#8ba3c1]" };
}

function timeAgo(value: string) {
  const diff = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (diff < 60) return `${diff} min ago`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.floor(hours / 24)} d ago`;
}

export function TokenCard({ token }: { token: TokenRecord }) {
  const status = statusMeta(token);
  const progress = Math.round(token.state.progress * 100);
  const creator = token.creatorTelegramId ? `@${token.creatorTelegramId}` : null;

  return (
    <Link
      href={`/token/${token.id}`}
      className="glass-card overflow-hidden transition-all duration-200 hover:border-[#0088cc]/40 hover:shadow-lg hover:shadow-[#0088cc]/10 active:scale-[0.98]"
    >
      <div className="relative aspect-square">
        <Image src={token.image || "/brand/img_04.jpg"} alt={token.name} fill className="object-cover" />
        <div className="absolute top-2 right-2">
          <span className={`rounded-full px-2 py-0.5 text-xs ${status.className}`}>{status.label}</span>
        </div>
        {progress >= 75 && token.status !== "GRADUATED" ? (
          <div className="pointer-events-none absolute inset-0 rounded-t-xl border-2 border-[#00c896]/50 animate-pulse" />
        ) : null}
      </div>

      <div className="space-y-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-bold text-white">{token.name}</span>
          <span className="font-mono text-xs text-[#8ba3c1]">${token.ticker}</span>
        </div>
        {token.description ? <p className="line-clamp-1 text-xs text-[#8ba3c1]">{token.description}</p> : null}
        <ProgressBar progress={progress} />
        <div className="flex justify-between text-xs text-[#8ba3c1]">
          <span>{progress}% to grad</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-bold text-[#00c896]">💎 {token.state.marketCapTon.toFixed(1)} TON</span>
          <span className="text-[#8ba3c1]">👥 {token.holderCount}</span>
        </div>
        <div className="text-xs text-[#8ba3c1]">
          {timeAgo(token.createdAt)}{creator ? ` · ${creator}` : ""}
        </div>
      </div>
    </Link>
  );
}
