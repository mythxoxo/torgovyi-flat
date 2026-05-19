const verified = [
  ["Contracts build", "Verified"],
  ["Contract verification", "Verified"],
  ["Sandbox buy/mint loop", "Verified"],
  ["Security check", "Verified"],
  ["Production build", "Verified"],
  ["TonConnect modal", "Verified"]
] as const;

const ready = [
  ["Factory deploy payload", "Ready"],
  ["Token-flow payload", "Ready"],
  ["ChangeOwner payload", "Ready"],
  ["RegisterPool payload", "Ready"],
  ["Buy payload", "Ready"]
] as const;

const pending = [
  ["Factory deployed on mainnet", "Pending live proof"],
  ["Live buy", "Pending live proof"],
  ["Buyer jetton balance", "Pending live proof"],
  ["STON.fi listing", "Pending live proof"],
  ["LP lock", "Pending live proof"],
  ["Indexer DB row", "Pending live proof"]
] as const;

function StatusSection({ title, text, items, tone }: { title: string; text: string; items: readonly (readonly [string, string])[]; tone: "green" | "amber" | "gray" }) {
  const toneClass = tone === "green" ? "border-[#3df6a2]/20 bg-[#3df6a2]/8 text-[#a5fbce]" : tone === "amber" ? "border-[#ffcc80]/20 bg-[#ffcc80]/8 text-[#ffd89b]" : "border-white/10 bg-white/5 text-[#d3dfef]";
  return (
    <section className="glass-card rounded-[28px] p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-[#7dd3fc]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#c6d4ea]">{text}</p>
      <div className="mt-5 space-y-3">
        {items.map(([label, value]) => (
          <div key={label} className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm ${toneClass}`}>
            <span>{label}</span>
            <span className="font-semibold">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function TechnicalStatusPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,24,39,0.94),rgba(7,13,24,0.98))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
        <p className="text-xs uppercase tracking-[0.22em] text-[#7dd3fc]">Technical status</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">Investor-facing system board</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#c6d4ea]">This page separates what is already verified, what is ready for manual mainnet testing, and what still needs live proof before any public launch claims.</p>
      </section>

      <div className="grid gap-4 xl:grid-cols-3">
        <StatusSection title="Verified locally / sandbox" text="These checks are already green in the current repo state." items={verified} tone="green" />
        <StatusSection title="Ready for manual mainnet test" text="Payload preparation is ready. Each transaction still needs manual wallet signing." items={ready} tone="gray" />
        <StatusSection title="Pending live proof" text="These items require real mainnet execution and evidence." items={pending} tone="amber" />
      </div>
    </div>
  );
}
