import Image from "next/image";
import Link from "next/link";
import type { TokenRecord } from "../lib/shared";
import { ProgressBar } from "./progress-bar";

function statusMeta(token: TokenRecord) {
  if (token.status === "GRADUATED") return { label: "Вышел", className: "bg-white/10 text-white" };
  const pct = token.state.progress * 100;
  if (pct >= 75) return { label: "~Grad", className: "bg-[color:var(--green-dim)] text-[color:var(--green)]" };
  if (pct >= 40) return { label: "Тренд", className: "bg-[color:var(--blue-dim)] text-[#31f2ff]" };
  return { label: "Новый", className: "bg-white/5 text-[color:var(--text-muted)]" };
}

function timeAgo(value: string) {
  const diff = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (diff < 60) return `${diff} мин назад`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `${hours} ч назад`;
  return `${Math.floor(hours / 24)} д назад`;
}

export function TokenCard({ token }: { token: TokenRecord }) {
  const status = statusMeta(token);
  const progress = Math.round(token.state.progress * 100);
  const creator = token.creatorTelegramId ? `@${token.creatorTelegramId}` : null;
  const progressTone = progress >= 75 ? "from-[#27f1a8] to-[#58ffe0]" : "from-[#2979ff] to-[#58a6ff]";

  return (
    <Link href={`/token/${token.id}`} className="card block overflow-hidden transition-all duration-150 hover:-translate-y-[1px] hover:border-[#31f2ff]/40 hover:shadow-[0_0_24px_rgba(49,242,255,0.14)] active:scale-[0.98] animate-floatcard">
      <div className="relative aspect-square overflow-hidden">
        <Image src={token.image || "/brand/img_04.jpg"} alt={token.name} fill className="object-cover" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#050816] to-transparent" />
        <div className="absolute left-2 top-2"><span className={`badge ${status.className}`}>{status.label}</span></div>
      </div>
      <div className="space-y-2 p-3">
        <div className="flex items-center justify-between gap-2"><span className="truncate text-sm font-bold text-[color:var(--text-primary)]">{token.name}</span><span className="font-mono text-xs text-[#31f2ff]">${token.ticker}</span></div>
        {token.description ? <p className="line-clamp-1 text-xs text-[color:var(--text-muted)]">{token.description}</p> : null}
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#12203f]"><div className={`h-full rounded-full bg-gradient-to-r ${progressTone} transition-all duration-500`} style={{ width: `${progress}%` }} /></div>
        <div className="flex justify-between text-[11px] text-[color:var(--text-muted)]"><span>{progress}% to grad</span><span className="font-mono">{token.state.marketCapTon.toFixed(1)} TON</span></div>
        <div className="text-xs text-[color:var(--text-muted)]">{timeAgo(token.createdAt)}{creator ? ` · ${creator}` : ""}</div>
      </div>
    </Link>
  );
}
