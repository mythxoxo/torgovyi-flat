"use client";

import type { DexQuote, ExternalDex } from "../lib/dex/external/types";

type Props = {
  quotes: DexQuote[];
  selected: ExternalDex | null;
  onSelect: (dex: ExternalDex) => void;
};

const label: Record<ExternalDex, string> = {
  dedust: "DeDust",
  stonfi: "STON.fi"
};

export function DexPlatformSelector({ quotes, selected, onSelect }: Props) {
  if (!quotes.length) {
    return <div className="rounded-xl border border-[#1e3a5f] bg-[#111827] px-3 py-2 text-xs text-[#8ba3c1]">No external DEX route checked yet</div>;
  }

  return (
    <div className="space-y-2 rounded-xl border border-[#1e3a5f] bg-[#111827] p-2">
      <div className="text-xs text-[#8ba3c1]">Platform</div>
      <div className="grid grid-cols-2 gap-2">
        {quotes.map((quote) => {
          const active = selected === quote.dex;
          const available = quote.status === "quote_ready";
          return (
            <button
              key={quote.dex}
              type="button"
              disabled={!available}
              onClick={() => onSelect(quote.dex)}
              className={`rounded-lg border px-3 py-2 text-left text-xs ${active ? "border-[#2aabee] bg-[#172a44] text-white" : "border-[#1e3a5f] bg-[#1a2235] text-[#8ba3c1]"} ${available ? "hover:border-[#2aabee]" : "opacity-60"}`}
            >
              <div className="font-semibold">{label[quote.dex]}</div>
              <div className="mt-1 truncate">{quote.status}</div>
            </button>
          );
        })}
      </div>
      {selected ? (
        <div className="space-y-1 rounded-lg bg-[#1a2235] p-3 text-xs text-[#c6d4ea]">
          {quotes.filter((quote) => quote.dex === selected).map((quote) => (
            <div key={quote.dex} className="space-y-1">
              <div className="flex justify-between"><span>Expected receive</span><span>{quote.expectedReceive || "—"}</span></div>
              <div className="flex justify-between"><span>Minimum receive</span><span>{quote.minReceive || "—"}</span></div>
              <div className="flex justify-between"><span>DEX fee</span><span>{quote.dexFee || "—"}</span></div>
              <div className="flex justify-between"><span>Platform fee</span><span>{quote.platformFee}</span></div>
              <div className="flex justify-between"><span>Slippage</span><span>{quote.priceImpact || "—"}</span></div>
              <div className="flex justify-between"><span>Route status</span><span>{quote.status}</span></div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
