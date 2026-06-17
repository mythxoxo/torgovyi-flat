export function ProgressBar({ progress, className = "" }: { progress: number; className?: string }) {
  const value = Math.max(0, Math.min(100, progress <= 1 ? progress * 100 : progress));

  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-[#232830] ${className}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#f1d999] via-[#c7a86b] to-[#8f6f36] shadow-[0_0_18px_rgba(199,168,107,0.24)] transition-all duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
