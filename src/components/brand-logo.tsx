export function BrandLogo({ subtitle, compact = false }: { subtitle?: string; compact?: boolean }) {
  return (
    <div className="pd-brand-logo flex min-w-0 items-center gap-3">
      <div className={compact ? "pd-gem-mark pd-gem-mark--compact" : "pd-gem-mark"} aria-hidden="true">
        <div className="pd-gem-core">
          <span className="pd-gem-facet pd-gem-facet-a" />
          <span className="pd-gem-facet pd-gem-facet-b" />
          <span className="pd-gem-facet pd-gem-facet-c" />
        </div>
      </div>
      <div className="min-w-0">
        <div className={compact ? "pd-brand-word text-[15px]" : "pd-brand-word text-[19px]"}>
          TONS OF GRAM
        </div>
        {subtitle ? <div className={compact ? "pd-brand-sub mt-1 text-[8.5px]" : "pd-brand-sub mt-1.5 text-[9.5px]"}>{subtitle}</div> : null}
      </div>
    </div>
  );
}
