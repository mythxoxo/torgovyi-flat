export function ProgressBar({ progress, className = "" }: { progress: number; className?: string }) {
  const value = Math.max(0, Math.min(100, progress <= 1 ? progress * 100 : progress));

  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-[#1e3a5f] ${className}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#5ac8fa] via-[#2aabee] to-[#229ed9] transition-all duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
