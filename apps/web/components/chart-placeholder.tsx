export function ChartPlaceholder({ progress }: { progress: number }) {
  const columns = Array.from({ length: 18 }, (_, index) =>
    22 + Math.sin(index * 0.55) * 14 + progress * 34 + (index % 4) * 4
  );

  return (
    <div className="glass-card mx-4 rounded-xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#8ba3c1]">Price action</p>
          <h3 className="mt-1 text-lg font-semibold text-white">График цены</h3>
        </div>
      </div>
      <div className="flex h-32 items-end gap-2">
        {columns.map((height, index) => (
          <div
            key={index}
            className="flex-1 rounded-t bg-gradient-to-t from-[#0088cc]/35 to-[#00c896]/85"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}
