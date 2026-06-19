import Link from "next/link";
import type { TokenRecord } from "../lib/shared";
import { ProgressBar } from "./progress-bar";
import { useUi } from "./page-shell";

function statusMeta(token: TokenRecord, locale: "ru" | "en") {
  if (token.status === "LISTED") return { label: locale === "ru" ? "На рынке" : "Listed", className: "bg-white/10 text-white" };
  if (token.status === "GRADUATED_READY") return { label: locale === "ru" ? "Готов к ликвидности" : "Ready for liquidity", className: "bg-[#2aabee]/15 text-[#5ac8fa]" };
  const pct = token.state.progress * 100;
  if (pct >= 75) return { label: locale === "ru" ? "Почти готов" : "Almost ready", className: "bg-[#2aabee]/15 text-[#5ac8fa]" };
  if (pct >= 40) return { label: locale === "ru" ? "Запуск идёт" : "Launching", className: "bg-[#2aabee]/15 text-[#5ac8fa]" };
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
    <Link href={`/token/${token.id}`} className="glass-card block rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,24,39,0.9),rgba(9,15,26,0.98))] p-5 transition hover:border-[#2aabee]/30 hover:bg-[linear-gradient(180deg,rgba(18,28,45,0.96),rgba(10,16,28,0.98))]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.16em] text-[#8ba3c1]">{timeAgo(token.createdAt, locale)}</div>
          <h3 className="mt-2 font-display text-xl font-bold text-white">{token.name}</h3>
          <div className="mt-1 font-mono text-sm text-[#5ac8fa]">{token.ticker}</div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
      </div>

      {token.description ? <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#c6d4ea]">{token.description}</p> : null}

      <div className="mt-5 rounded-2xl border border-white/8 bg-white/5 p-4">
        <div className="flex items-center justify-between text-xs text-[#8ba3c1]"><span>{locale === "ru" ? "Прогресс" : "Progress"}</span><span>{progress}%</span></div>
        <ProgressBar progress={progress} className="mt-2" />
        <div className="mt-3 flex items-center justify-between text-sm"><span className="text-[#8ba3c1]">{locale === "ru" ? "Собрано" : "Collected"}</span><span className="font-semibold text-white">💎 {(token.state.collectedTon ?? token.state.marketCapTon).toFixed(2)} GRAM</span></div>
      </div>
    </Link>
  );
}
