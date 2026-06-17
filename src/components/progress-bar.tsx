export function ProgressBar({ progress, className = "" }: { progress: number; className?: string }) {
  const value = Math.max(0, Math.min(100, progress <= 1 ? progress * 100 : progress));

  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-[#10233c] ${className}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#20d8ff] via-[#0098ea] to-[#006bff] shadow-[0_0_20px_rgba(32,216,255,0.42)] transition-all duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
