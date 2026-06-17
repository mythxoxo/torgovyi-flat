import Link from "next/link";
import type { TokenRecord } from "../lib/shared";
import { ProgressBar } from "./progress-bar";
import { useUi } from "./page-shell";

function statusMeta(token: TokenRecord, locale: "ru" | "en") {
  if (token.status === "LISTED") return { label: locale === "ru" ? "На рынке" : "Listed", className: "bg-white/10 text-white" };
  if (token.status === "GRADUATED_READY") return { label: locale === "ru" ? "Готов к ликвидности" : "Ready for liquidity", className: "bg-[#c7a86b]/15 text-[#f1d999]" };
  const pct = token.state.progress * 100;
  if (pct >= 75) return { label: locale === "ru" ? "Почти готов" : "Almost ready", className: "bg-[#c7a86b]/15 text-[#f1d999]" };
  if (pct >= 40) return { label: locale === "ru" ? "Запуск идёт" : "Launching", className: "bg-[#6fc2a6]/15 text-[#a9ead6]" };
  return { label: locale === "ru" ? "Новый" : "New", className: "bg-white/10 text-white" };
}

function timeAgo(value: string, locale: "ru" | "en") {
  const mins = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
  if (mins < 1) return locale === "ru" ? "только что" : "just now";
  if (mins < 60) return locale === "ru" ? `${mins} мин назад` : `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return locale === "ru" ? `${hours} ч назад` : `${hours} h ago`;
  return locale === "ru" ? `${Math.floor(hours / 24)} д назад` : `${Math.floor(hours / 24)} d ago`;
}

export function TokenCard({ token }: { token: TokenRecord }) {
  const { locale } = useUi();
  const status = statusMeta(token, locale);
  const progress = Math.round(token.state.progress * 100);

  return (
    <Link href={`/token/${token.id}`} className="group glass-card block rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(29,33,38,0.92),rgba(10,11,13,0.98))] p-5 transition hover:-translate-y-0.5 hover:border-[#c7a86b]/30 hover:shadow-[0_28px_90px_rgba(0,0,0,0.36)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-[0.16em] text-[#8e929a]">{timeAgo(token.createdAt, locale)}</div>
          <h3 className="mt-2 truncate font-display text-2xl font-black text-white">{token.name}</h3>
          <div className="mt-1 font-mono text-sm font-bold text-[#f1d999]">{token.ticker}</div>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>{status.label}</span>
      </div>

      {token.description ? <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#9ea6b2]">{token.description}</p> : null}

      <div className="mt-5 rounded-[22px] border border-white/8 bg-white/[0.045] p-4">
        <div className="flex items-center justify-between text-xs text-[#8e929a]"><span>{locale === "ru" ? "Прогресс" : "Progress"}</span><span className="font-black text-[#f1d999]">{progress}%</span></div>
        <ProgressBar progress={progress} className="mt-2" />
        <div className="mt-3 flex items-center justify-between text-sm"><span className="text-[#8e929a]">{locale === "ru" ? "Собрано" : "Collected"}</span><span className="font-black text-white">{(token.state.collectedTon ?? token.state.marketCapTon).toFixed(2)} GRAM</span></div>
      </div>
    </Link>
  );
}
