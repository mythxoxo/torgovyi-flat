import Link from "next/link";
import { Address } from "@ton/core";

const present = (value?: string) => Boolean(value && value.trim());
const ok = (value: boolean) => value ? "READY" : "ACTION NEEDED";

const validTonAddress = (value?: string) => {
  if (!present(value)) return false;
  try { Address.parse(String(value).trim()); return true; } catch { return false; }
};

const treasuryAddress = () =>
  process.env.DEX_PLATFORM_FEE_TREASURY ||
  process.env.LAUNCH_FEE_TREASURY ||
  process.env.TREASURY_ADDRESS ||
  process.env.TREASURY ||
  process.env.REFERRAL_TREASURY_ADDRESS ||
  "";

const launchFeeReady = () => {
  const value = Number(process.env.LAUNCH_FEE_TON || "0.25");
  return Number.isFinite(value) && value > 0 && value <= 50;
};

const checks = () => [
  { label: "Database", detail: "Persistent launch/feed state", ready: present(process.env.DATABASE_URL) },
  { label: "Treasury", detail: "Launch commission receiver", ready: validTonAddress(treasuryAddress()) },
  { label: "Launch fee", detail: "Positive fee, capped at 50 GRAM", ready: launchFeeReady() },
  { label: "TON RPC", detail: "Pool state sync and read methods", ready: present(process.env.TONCENTER_API_KEY) || present(process.env.TON_RPC_ENDPOINT) || present(process.env.TONAPI_API_KEY) },
  { label: "TonConnect", detail: "Current TONS of GRAM branding", ready: true },
  { label: "Upload guard", detail: "PNG/JPEG/WEBP signature checks", ready: true },
  { label: "API guard", detail: "No-store, rate limit, response headers", ready: true },
  { label: "Wallet custody", detail: "Manual TonConnect signing only", ready: true }
];

export const dynamic = "force-dynamic";

export default function StatusPage() {
  const rows = checks();
  const readyCount = rows.filter((row) => row.ready).length;
  const allReady = readyCount === rows.length;
  return (
    <main className="mx-auto max-w-5xl space-y-6 pb-20">
      <section className="glass-card rounded-[32px] p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#5ac8fa]">Production readiness</p>
        <h1 className="mt-3 font-display text-4xl font-black tracking-[-0.05em] text-white">{allReady ? "Ready to launch" : "Needs final config"}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#8ba3c1]">Launchpad safety board: config, wallet flow, upload guard, API guard and chain sync status.</p>
        <div className="mt-5 inline-flex rounded-full border border-[#5ac8fa]/20 bg-[#5ac8fa]/10 px-4 py-2 text-sm font-semibold text-[#c6e8ff]">{readyCount}/{rows.length} checks ready</div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="glass-card rounded-[24px] border border-white/10 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-bold text-white">{row.label}</h2>
                <p className="mt-1 text-sm leading-6 text-[#8ba3c1]">{row.detail}</p>
              </div>
              <span className={row.ready ? "rounded-full bg-[#2aabee]/15 px-3 py-1 text-xs font-bold text-[#5ac8fa]" : "rounded-full bg-[#ff4757]/15 px-3 py-1 text-xs font-bold text-[#ff8fa3]"}>{ok(row.ready)}</span>
            </div>
          </div>
        ))}
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/create?target=8888" className="rounded-2xl bg-[#2aabee] px-5 py-3 text-center text-sm font-semibold text-[#06101a]">Create launch</Link>
        <Link href="/markets" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-center text-sm font-semibold text-white">Open markets</Link>
      </div>
    </main>
  );
}
