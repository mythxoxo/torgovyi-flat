export function BrandLogo({ compact = false }: { subtitle?: string; compact?: boolean }) {
  return (
    <div className={compact ? "pd-brand-logo pd-brand-logo--compact" : "pd-brand-logo"}>
      <svg className="pd-cart-logo" viewBox="0 0 88 64" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="cartLogoGem" x1="20" y1="9" x2="74" y2="58" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7EE7FF" />
            <stop offset="0.52" stopColor="#2AABEE" />
            <stop offset="1" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="cartLogoPink" x1="16" y1="18" x2="78" y2="54" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF63C3" />
            <stop offset="1" stopColor="#8B5CF6" />
          </linearGradient>
          <filter id="cartLogoGlow" x="-20" y="-20" width="128" height="104" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#FF55B8" floodOpacity="0.22" />
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#2AABEE" floodOpacity="0.16" />
          </filter>
        </defs>

        <g filter="url(#cartLogoGlow)">
          <path d="M15 23H25L31 47H69L76 28H27" stroke="url(#cartLogoPink)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M32 47H70" stroke="rgba(255,255,255,0.72)" strokeWidth="2" strokeLinecap="round" />
          <circle cx="38" cy="54" r="4" fill="#070A12" stroke="#C9F0FF" strokeWidth="2.4" />
          <circle cx="65" cy="54" r="4" fill="#070A12" stroke="#C9F0FF" strokeWidth="2.4" />

          <path d="M34 24L40 15L48 24L43 34H39L34 24Z" fill="url(#cartLogoGem)" stroke="#DFF8FF" strokeWidth="1.2" />
          <path d="M56 23L62 14L70 23L65 34H60L56 23Z" fill="url(#cartLogoGem)" stroke="#DFF8FF" strokeWidth="1.2" />
          <path d="M46 31L51 23L58 31L54 40H50L46 31Z" fill="url(#cartLogoGem)" stroke="#DFF8FF" strokeWidth="1.1" />
          <path d="M40 15L43 24L39 34M62 14L65 23L60 34M51 23L54 31L50 40" stroke="rgba(255,255,255,0.44)" strokeWidth="0.9" />

          <path d="M32 23C31 14 37 8 46 12L49 7L53 14C59 17 62 24 60 31C57 41 42 43 35 36C32 33 31 28 32 23Z" fill="#B7B0AA" stroke="#171A22" strokeWidth="2.2" />
          <path d="M38 13L34 6L45 11" fill="#B7B0AA" stroke="#171A22" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M53 14L60 8L59 20" fill="#B7B0AA" stroke="#171A22" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M40 27C42 25 45 25 47 27" stroke="#171A22" strokeWidth="2" strokeLinecap="round" />
          <path d="M51 28C53 26 55 26 57 28" stroke="#171A22" strokeWidth="2" strokeLinecap="round" />
          <path d="M48 31L46 34L50 34L48 31Z" fill="#171A22" />
          <path d="M43 38C46 35 51 35 54 38" stroke="#171A22" strokeWidth="2" strokeLinecap="round" />
          <path d="M35 31L27 28M35 34L27 35M58 32L67 29M58 35L67 36" stroke="#171A22" strokeWidth="1.3" strokeLinecap="round" opacity="0.72" />
        </g>
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
