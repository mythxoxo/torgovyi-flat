import Image from "next/image";
import Link from "next/link";
import type { TokenRecord } from "../lib/shared";
import { ProgressBar } from "./progress-bar";

function statusMeta(token: TokenRecord) {
  if (token.status === "GRADUATED") return { label: "Вышел", className: "bg-white/10 text-white" };
  const pct = token.state.progress * 100;
  if (pct >= 75) return { label: "~Grad", className: "bg-[color:var(--green-dim)] text-[color:var(--green)]" };
  if (pct >= 40) return { label: "Тренд", className: "bg-[color:var(--blue-dim)] text-[color:var(--accent)]" };
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

  return (
    <Link href={`/token/${token.id}`} className="card block overflow-hidden transition-all duration-150 hover:-translate-y-[1px] hover:border-[#2979ff]/35 hover:shadow-[0_0_0_1px_rgba(41,121,255,0.1),0_8px_24px_rgba(0,0,0,0.4)] active:scale-[0.98]">
      <div className="relative aspect-square">
        <Image src={token.image || "/brand/img_04.jpg"} alt={token.name} fill className="object-cover" />
        <div className="absolute top-2 right-2"><span className={`badge ${status.className}`}>{status.label}</span></div>
      </div>
      <div className="space-y-2 p-3">
        <div className="flex items-center justify-between gap-2"><span className="truncate text-sm font-bold text-[color:var(--text-primary)]">{token.name}</span><span className="font-mono text-xs text-[color:var(--text-muted)]">${token.ticker}</span></div>
        {token.description ? <p className="line-clamp-1 text-xs text-[color:var(--text-muted)]">{token.description}</p> : null}
        <ProgressBar progress={progress >= 75 ? progress : progress} />
        <div className="flex justify-between text-xs text-[color:var(--text-muted)]"><span>{progress}% to grad</span></div>
        <div className="flex items-center justify-between text-xs"><span className="font-mono font-bold text-[color:var(--green)]">{token.state.marketCapTon.toFixed(1)} TON</span><span className="text-[color:var(--text-muted)]">{token.holderCount} holders</span></div>
        <div className="text-xs text-[color:var(--text-muted)]">{timeAgo(token.createdAt)}{creator ? ` · ${creator}` : ""}</div>
      </div>
    </Link>
  );
}
