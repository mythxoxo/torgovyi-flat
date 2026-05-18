export function ReferralPanel({
  referralCode,
  shareUrl,
  earnedTon,
  volumeTon
}: {
  referralCode: string;
  shareUrl: string;
  earnedTon: number;
  volumeTon: number;
}) {
  return (
    <div className="card-surface rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Referral lane</h3>
        <span className="rounded-lg border border-cyan-400/25 px-3 py-1 text-xs text-cyan-200">
          {referralCode}
        </span>
      </div>
      <p className="break-all rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-sm text-cyan-100">
        {shareUrl}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-mist">
        <div className="rounded-lg border border-white/10 p-3">
          <p>Referred volume</p>
          <p className="mt-1 text-lg text-white">{volumeTon.toFixed(2)} TON</p>
        </div>
        <div className="rounded-lg border border-white/10 p-3">
          <p>Earned</p>
          <p className="mt-1 text-lg text-white">{earnedTon.toFixed(2)} TON</p>
        </div>
      </div>
    </div>
  );
}
