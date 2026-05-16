export function ChartPlaceholder({ progress }: { progress: number }) {
  const columns = Array.from({ length: 18 }, (_, index) =>
    22 + Math.sin(index * 0.55) * 14 + progress * 34 + (index % 4) * 4
  );

  return (
    <div className="card-surface rounded-xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-mist">Price action</p>
          <h3 className="mt-1 text-lg font-semibold text-white">Curve snapshot</h3>
        </div>
        <span className="rounded-lg border border-emerald-400/30 px-3 py-1 text-xs text-emerald-300">
          Curve model
        </span>
      </div>
      <div className="flex h-32 items-end gap-2">
        {columns.map((height, index) => (
          <div
            key={index}
            className="flex-1 rounded-t bg-gradient-to-t from-cyan-500/35 to-cyan-200/85"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}
