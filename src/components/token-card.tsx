import Link from "next/link";
import type { TokenRecord } from "../lib/shared";
import { spotPriceForSupply } from "../lib/shared";
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

function visiblePrice(token: TokenRecord) {
  const soldSupply = token.state.soldSupply || 0;
  const collectedTon = token.state.collectedTon ?? token.state.reserveTon ?? 0;
  if (token.state.currentPriceTon > 0) return token.state.currentPriceTon;
  if (token.status === "BONDING") return spotPriceForSupply(soldSupply);
  if (token.state.circulatingSupply > 0 && token.state.marketCapTon > 0) return token.state.marketCapTon / token.state.circulatingSupply;
  if (soldSupply > 0 && collectedTon > 0) return collectedTon / soldSupply;
  return 0;
}

function isOnChainReady(token: TokenRecord) {
  return Boolean(token.contractAddresses?.bondingCurve && token.contractAddresses?.jettonMaster && !token.id.startsWith("pending:"));
}

export function TokenCard({ token }: { token: TokenRecord }) {
  const { locale } = useUi();
  const status = statusMeta(token, locale);
  const progress = Math.round(token.state.progress * 100);
  const price = visiblePrice(token);
  const collected = token.state.collectedTon ?? token.state.reserveTon ?? token.state.marketCapTon ?? 0;
  const trusted = isOnChainReady(token);

  return (
    <Link href={`/token/${encodeURIComponent(token.id)}`} className="glass-card group block overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,24,39,0.9),rgba(9,15,26,0.98))] transition hover:border-[#2aabee]/30 hover:bg-[linear-gradient(180deg,rgba(18,28,45,0.96),rgba(10,16,28,0.98))]">
      <div className="relative aspect-[1.55] overflow-hidden bg-[#07111f]">
        <img src={token.image || "/brand/tons-of-gram-tonconnect.svg"} alt="" className="h-full w-full object-cover opacity-90 transition duration-300 group-hover:scale-[1.03]" loading="lazy" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,18,0.05),rgba(3,7,18,0.76))]" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.16em] text-[#b6dfff]">{timeAgo(token.createdAt, locale)}</div>
            <h3 className="mt-1 line-clamp-1 font-display text-2xl font-black tracking-[-0.04em] text-white">{token.name}</h3>
            <div className="mt-1 font-mono text-sm font-semibold text-[#5ac8fa]">{token.ticker}</div>
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          <span className={trusted ? "rounded-full bg-[#2aabee]/15 px-3 py-1 text-xs font-bold text-[#5ac8fa]" : "rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/70"}>{trusted ? (locale === "ru" ? "On-chain" : "On-chain") : (locale === "ru" ? "Ожидает сеть" : "Pending chain")}</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/70">No custody</span>
        </div>

        {token.description ? <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#c6d4ea]">{token.description}</p> : null}

        <div className="mt-5 rounded-2xl border border-white/8 bg-white/5 p-4">
          <div className="flex items-center justify-between text-xs text-[#8ba3c1]"><span>{locale === "ru" ? "Прогресс" : "Progress"}</span><span>{progress}%</span></div>
          <ProgressBar progress={progress} className="mt-2" />
          <div className="mt-3 flex items-center justify-between text-sm"><span className="text-[#8ba3c1]">{locale === "ru" ? "Цена" : "Price"}</span><span className="font-semibold text-white">{price > 0 ? `${price.toFixed(8)} GRAM` : "—"}</span></div>
          <div className="mt-2 flex items-center justify-between text-sm"><span className="text-[#8ba3c1]">{locale === "ru" ? "Собрано" : "Collected"}</span><span className="font-semibold text-white">💎 {collected.toFixed(2)} GRAM</span></div>
        </div>
      </div>
    </Link>
  );
}
