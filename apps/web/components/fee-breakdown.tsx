export function FeeBreakdown({
  baseFee,
  creatorTax,
  totalFee,
  note
}: {
  baseFee: string;
  creatorTax: string;
  totalFee: string;
  note: string;
}) {
  return (
    <div className="card-surface rounded-xl p-4 text-sm text-mist">
      <div className="flex items-center justify-between gap-4">
        <span>Base fee</span>
        <span className="text-right">{baseFee}</span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-4">
        <span>Creator tax</span>
        <span className="text-right">{creatorTax}</span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-4 text-white">
        <span>Total fee</span>
        <span className="text-right">{totalFee}</span>
      </div>
      <p className="mt-3 text-xs text-mist">{note}</p>
    </div>
  );
}
