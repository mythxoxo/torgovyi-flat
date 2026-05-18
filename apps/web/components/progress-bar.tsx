export function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="mt-2 w-full rounded-full bg-white/10">
      <div
        className="h-2 rounded-full bg-gradient-to-r from-cyan-300 via-emerald-400 to-amber-300"
        style={{ width: `${Math.min(progress * 100, 100)}%` }}
      />
    </div>
  );
}
