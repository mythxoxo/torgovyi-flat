import Image from "next/image";
import Link from "next/link";
import type { TokenRecord } from "../lib/shared";
import { ProgressBar } from "./progress-bar";

function statusMeta(token: TokenRecord) {
  if (token.status === "GRADUATED") return { label: "✅ Выпустился", className: "bg-white/10 text-white" };
  const pct = token.state.progress * 100;
  if (pct >= 75) return { label: "💎 Почти", className: "bg-[#00c896]/20 text-[#00c896]" };
  if (pct >= 40) return { label: "🔥 Тренд", className: "bg-[#0088cc]/20 text-[#0088cc]" };
  return { label: "🆕 Новый", className: "bg-[#ff4757]/20 text-[#ff4757]" };
}

function timeAgo(value: string) {
  const mins = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
  if (mins < 1) return "только что";
  if (mins < 60) return `${mins} мин назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч назад`;
  return `${Math.floor(hours / 24)} дн назад`;
}

export function TokenCard({ token }: { token: TokenRecord }) {
  const status = statusMeta(token);
  const progress = Math.round(token.state.progress * 100);
  const creator = token.creatorTelegramId ? `@${token.creatorTelegramId}` : null;

  return (
    <Link href={`/token/${token.id}`} className="glass-card block overflow-hidden">
      <div className="relative aspect-square w-full overflow-hidden rounded-t-xl">
        <Image src={token.image || "/brand/img_04.jpg"} alt={token.name} fill className="object-cover" />
        <div className="absolute right-2 top-2">
          <span className={`badge ${status.className}`}>{status.label}</span>
        </div>
      </div>

      <div className="space-y-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-bold text-white">{token.name}</span>
          <span className="flex-shrink-0 font-mono text-xs text-[#8ba3c1]">${token.ticker}</span>
        </div>

        {token.description ? <p className="line-clamp-1 text-xs text-[#8ba3c1]">{token.description}</p> : null}

        <ProgressBar progress={progress} />

        <div className="flex justify-between text-xs text-[#8ba3c1]">
          <span>{progress}% до выхода</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-bold text-[#00c896]">💎 {token.state.marketCapTon.toFixed(2)} TON</span>
          <span className="text-[#8ba3c1]">👥 {token.holderCount}</span>
        </div>

        <div className="text-xs text-[#8ba3c1]">
          {timeAgo(token.createdAt)}
          {creator ? ` · ${creator}` : ""}
        </div>
      </div>
    </Link>
  );
}
