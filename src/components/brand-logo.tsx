export function BrandLogo({ compact = false }: { subtitle?: string; compact?: boolean }) {
  return (
    <div
      className={compact ? "pd-brand-logo pd-brand-logo--compact" : "pd-brand-logo"}
      aria-label="TONS of GRAM"
      style={{ display: "inline-flex", alignItems: "center", minWidth: compact ? 230 : 330 }}
    >
      <img
        src="/brand/tons-of-gram-header-logo.webp?v=visible-img-2"
        alt="TONS of GRAM"
        width={compact ? 230 : 330}
        height={compact ? 58 : 82}
        className="pd-brand-img"
        style={{ display: "block", width: compact ? 230 : 330, height: "auto", maxWidth: "100%", objectFit: "contain" }}
      />
    </div>
  );
}
