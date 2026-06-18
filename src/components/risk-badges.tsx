import type { ExternalTokenRecord } from "../lib/external-tokens/types";

export function RiskBadges({ token }: { token: ExternalTokenRecord }) {
  const tone = token.riskLevel === "HIGH"
    ? "border-[#ff4757]/30 bg-[#ff4757]/10 text-[#ff8a95]"
    : token.riskLevel === "MEDIUM"
      ? "border-[#f5a623]/30 bg-[#f5a623]/10 text-[#ffd38a]"
      : "border-[#22c55e]/30 bg-[#22c55e]/10 text-[#86efac]";

  return (
    <div className="flex flex-wrap gap-2">
      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tone}`}>{token.riskLevel}</span>
      {token.verified ? <span className="rounded-full border border-[#2aabee]/30 bg-[#2aabee]/10 px-2.5 py-1 text-[11px] font-semibold text-[#5ac8fa]">Verified</span> : null}
      {token.warnings.slice(0, 2).map((warning) => (
        <span key={warning} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-[#c6d4ea]">{warning}</span>
      ))}
    </div>
  );
}
