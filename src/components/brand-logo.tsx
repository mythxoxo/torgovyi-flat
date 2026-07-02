export function BrandLogo({ compact = false }: { subtitle?: string; compact?: boolean }) {
  return (
    <div className={compact ? "pd-brand-logo pd-brand-logo--compact" : "pd-brand-logo"} aria-label="TONS of GRAM">
      <img
        src="/brand/tons-of-gram-header-logo.webp"
        alt="TONS of GRAM"
        width={compact ? 230 : 330}
        height={compact ? 58 : 82}
        className="pd-brand-img"
      />
    </div>
  );
}
