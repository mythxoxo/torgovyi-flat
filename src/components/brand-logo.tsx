import Image from "next/image";

export function BrandLogo({ subtitle, compact = false }: { subtitle?: string; compact?: boolean }) {
  const iconSize = compact ? 32 : 36;
  const wordClass = compact ? "text-[18px]" : "text-[23px]";

  return (
    <div className="flex min-w-0 items-center gap-3">
      <Image src="/brand/logo-icon.svg" alt="TONK.MEM" width={iconSize} height={iconSize} className={compact ? "h-8 w-8 shrink-0" : "h-9 w-9 shrink-0"} />
      <div className="min-w-0">
        <div className={`whitespace-nowrap font-sans ${wordClass} font-extrabold uppercase leading-none tracking-[0.05em] text-[var(--gram-text)]`}>
          TONK.MEM
        </div>
        {subtitle ? (
          <div className={compact ? "mt-1 text-[10px] tracking-[0.18em] text-[var(--gram-muted)]" : "mt-1.5 text-[11px] tracking-[0.2em] text-[var(--gram-muted)]"}>
            {subtitle}
          </div>
        ) : null}
      </div>
    </div>
  );
}
