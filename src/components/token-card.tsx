import Link from "next/link";
import type { TokenRecord } from "../lib/shared";
import { spotPriceForSupply } from "../lib/shared";
import { ProgressBar } from "./progress-bar";
import { useUi } from "./page-shell";

function statusMeta(token: TokenRecord, locale: "ru" | "en") {
  if (token.status === "LISTED") return { label: locale === "ru" ? "На рынке" : "Listed", className: "pd-chip pd-chip-live" };
  if (token.status === "GRADUATED_READY") return { label: locale === "ru" ? "К листингу" : "Ready", className: "pd-chip pd-chip-blue" };
  const pct = token.state.progress * 100;
  if (pct >= 75) return { label: locale === "ru" ? "Горячий" : "Hot", className: "pd-chip pd-chip-hot" };
  if (pct >= 40) return { label: locale === "ru" ? "Live" : "Live", className: "pd-chip pd-chip-live" };
  return { label: locale === "ru" ? "Новый" : "New", className: "pd-chip pd-chip-blue" };
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
    <Link href={`/token/${encodeURIComponent(token.id)}`} className="group block overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,23,34,0.88),rgba(8,12,18,0.96))] shadow-[0_22px_80px_rgba(0,0,0,0.28)] transition duration-200 hover:-translate-y-0.5 hover:border-[#ff3d9a]/35 hover:shadow-[0_28px_95px_rgba(255,61,154,0.12)]">
      <div className="relative aspect-[1.34] overflow-hidden bg-[#070b12]">
        <img src={token.image || "/brand/tons-of-gram-tonconnect.svg"} alt="" className="h-full w-full object-cover opacity-95 transition duration-500 group-hover:scale-[1.045]" loading="lazy" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,11,0.04),rgba(5,7,11,0.88))]" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className={status.className}>{status.label}</span>
          <span className={trusted ? "pd-chip pd-chip-live" : "pd-chip"}>{trusted ? "On-chain" : "Indexing"}</span>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-xs font-black uppercase tracking-[0.16em] text-[#9cff2e]">{timeAgo(token.createdAt, locale)}</div>
          <div className="mt-2 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <h3 className="line-clamp-1 font-display text-2xl font-black tracking-[-0.045em] text-white">{token.name}</h3>
              <div className="mt-1 font-mono text-sm font-bold text-[#5ac8fa]">{token.ticker}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-right backdrop-blur-md"><div className="text-[10px] uppercase text-[#90a3b8]">Progress</div><div className="font-black text-[#9cff2e]">{progress}%</div></div>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        {token.description ? <p className="line-clamp-2 text-sm leading-6 text-[#cbd5e1]">{token.description}</p> : null}
        <div className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4">
          <div className="flex items-center justify-between text-xs text-[#90a3b8]"><span>{locale === "ru" ? "До листинга" : "To graduation"}</span><span className="font-black text-[#9cff2e]">{progress}%</span></div>
          <ProgressBar progress={progress} className="mt-2" />
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="min-w-0"><span className="block text-xs text-[#90a3b8]">{locale === "ru" ? "Цена" : "Price"}</span><span className="mt-1 block truncate font-black text-white">{price > 0 ? `${price.toFixed(8)} GRAM` : "—"}</span></div>
            <div className="min-w-0"><span className="block text-xs text-[#90a3b8]">{locale === "ru" ? "Собрано" : "Collected"}</span><span className="mt-1 block truncate font-black text-white">{collected.toFixed(2)} GRAM</span></div>
          </div>
        </div>
      </div>
    </Link>
  );
}
