export function BrandLogo({ compact = false }: { subtitle?: string; compact?: boolean }) {
  const width = compact ? 190 : 250;
  const height = compact ? 48 : 62;

  return (
    <div className={compact ? "pd-brand-logo pd-brand-logo--compact" : "pd-brand-logo"} aria-label="TONS of GRAM">
      <img
        src="/brand/tons-of-gram-header-logo.webp?v=integrated-brand-1"
        alt="TONS of GRAM"
        width={width}
        height={height}
        className="pd-brand-img"
      />
    </div>
  );
}
