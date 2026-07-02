import Image from "next/image";

export function BrandLogo({ subtitle, compact = false }: { subtitle?: string; compact?: boolean }) {
  const iconSize = compact ? 30 : 34;
  const wordClass = compact ? "text-[16px]" : "text-[20px]";

  return (
    <div className="pd-brand-logo flex min-w-0 items-center gap-3">
      <div className={compact ? "pd-brand-mark h-9 w-9" : "pd-brand-mark h-10 w-10"}>
        <Image src="/brand/logo-icon.svg" alt="TONS of GRAM" width={iconSize} height={iconSize} className={compact ? "h-[30px] w-[30px] shrink-0" : "h-[34px] w-[34px] shrink-0"} />
      </div>
      <div className="min-w-0">
        <div className={`pd-brand-word whitespace-nowrap font-sans ${wordClass} font-black uppercase leading-none tracking-[0.045em] text-white`}>
          TONS OF GRAM
        </div>
        {subtitle ? (
          <div className={compact ? "pd-brand-sub mt-1 text-[9px]" : "pd-brand-sub mt-1.5 text-[10px]"}>
            {subtitle}
          </div>
        ) : null}
      </div>
    </div>
  );
}
