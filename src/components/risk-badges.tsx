import type { ExternalTokenRecord } from "../lib/external-tokens/types";

export function RiskBadges({ token }: { token: ExternalTokenRecord }) {
  const tone = token.riskLevel === "HIGH"
    ? "border-[#ff5c7a]/32 bg-[#ff5c7a]/10 text-[#ffb0bf]"
    : token.riskLevel === "MEDIUM"
      ? "border-[#ffd166]/32 bg-[#ffd166]/10 text-[#ffe0a3]"
      : "border-[#b7ff55]/32 bg-[#b7ff55]/10 text-[#e4ffba]";

  return (
    <div className="flex flex-wrap gap-2">
      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.04em] ${tone}`}>{token.riskLevel}</span>
      {token.verified ? <span className="rounded-full border border-[#2aabee]/30 bg-[#2aabee]/10 px-2.5 py-1 text-[11px] font-black text-[#c9f0ff]">Verified</span> : null}
      {token.warnings.slice(0, 2).map((warning) => (
        <span key={warning} className="rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1 text-[11px] font-semibold text-[#cbd5e1]">{warning}</span>
      ))}
    </div>
  );
}
