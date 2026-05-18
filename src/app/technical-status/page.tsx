import { getLaunchpadTargetTon, isTestTargetMode } from "../../lib/launch-config";

export default function TechnicalStatusPage() {
  const targetTon = getLaunchpadTargetTon();
  const testMode = isTestTargetMode();
  const factory = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "pending";

  const items = [
    ["build", "green"],
    ["contracts", "green"],
    ["security check", "green"],
    ["sandbox buy/mint", "verified"],
    ["test target", testMode ? `${targetTon} TON` : "off"],
    ["production target", "8888 TON"],
    ["mainnet deploy", factory === "pending" ? "pending manual signing" : factory],
    ["STON.fi listing", "pending live pool"]
  ];

  return (
    <div className="px-4 py-6">
      <div className="glass-card rounded-[24px] p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-[#7dd3fc]">Technical status</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-white">System status</h1>
        <div className="mt-5 space-y-3">
          {items.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
              <span className="text-[#8ba3c1]">{k}</span>
              <span className="font-medium text-white">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
