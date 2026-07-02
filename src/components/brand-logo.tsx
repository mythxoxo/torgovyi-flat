export function BrandLogo({ compact = false }: { subtitle?: string; compact?: boolean }) {
  return (
    <div className={compact ? "pd-brand-logo pd-brand-logo--compact" : "pd-brand-logo"} aria-label="TONS of GRAM">
      <span className="pd-brand-art" aria-hidden="true" />
    </div>
  );
}
