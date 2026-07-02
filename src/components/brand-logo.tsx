export function BrandLogo({ compact = false }: { subtitle?: string; compact?: boolean }) {
  return (
    <div className={compact ? "pd-brand-logo pd-brand-logo--compact" : "pd-brand-logo"}>
      <svg className="pd-cart-logo" viewBox="0 0 120 72" fill="none" aria-hidden="true">
        <path d="M14 30H29L37 55H91L103 30H36" stroke="#FF55B8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M36 33H99L90 53H42L36 33Z" fill="rgba(8,12,18,0.82)" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
        <circle cx="45" cy="61" r="5" fill="#070A12" stroke="#C9F0FF" strokeWidth="3" />
        <circle cx="84" cy="61" r="5" fill="#070A12" stroke="#C9F0FF" strokeWidth="3" />

        <path d="M75 23L84 11L94 23L88 37H80L75 23Z" fill="#59C7FF" stroke="#E7FBFF" strokeWidth="2" strokeLinejoin="round" />
        <path d="M88 29L96 19L105 29L100 41H93L88 29Z" fill="#8B5CF6" stroke="#E7FBFF" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M84 11L88 23L80 37M96 19L100 29L93 41" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" strokeLinecap="round" />

        <path d="M38 22C37 8 48 2 61 8C75 2 87 9 86 24C85 43 75 54 62 54C48 54 39 43 38 22Z" fill="#C8C0B8" stroke="#111827" strokeWidth="4" strokeLinejoin="round" />
        <path d="M45 12L38 1L56 8" fill="#C8C0B8" stroke="#111827" strokeWidth="4" strokeLinejoin="round" />
        <path d="M76 10L90 2L86 22" fill="#C8C0B8" stroke="#111827" strokeWidth="4" strokeLinejoin="round" />
        <path d="M50 30C53 27 57 27 60 30" stroke="#111827" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M66 30C69 27 73 27 76 30" stroke="#111827" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M63 34L59 39H67L63 34Z" fill="#111827" />
        <path d="M55 46C60 41 68 41 73 46" stroke="#111827" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M42 36L29 32M42 42L30 44M82 36L96 32M82 42L94 44" stroke="#111827" strokeWidth="2" strokeLinecap="round" opacity="0.66" />
      </svg>

      <div className="pd-brand-copy">
        <div className="pd-brand-wordmark">
          <span>TONS</span>
          <span className="pd-brand-of">of</span>
          <span>GRAM</span>
        </div>
      </div>
    </div>
  );
}
