export type Locale = "ru" | "en";

export const defaultLocale: Locale = "ru";

export const messages = {
  ru: {
    nav: { market: "Токены", create: "Запуск", portfolio: "Портфель", referrals: "Рефералы", faq: "FAQ", rules: "Правила", risks: "Риски" },
    home: {
      badge: "Technical MVP",
      title: "Launch TON meme tokens. Graduate to DeDust.",
      subtitle: "Create meme tokens on TON, test the bonding flow safely, and prepare for DeDust liquidity without giving custody of your wallet.",
      description: "Честный public preview без fake live claims и без backend custody.",
      ctaPrimary: "Create token",
      ctaSecondary: "View status",
      statsA: "Sandbox verified",
      statsB: "Manual signing",
      statsC: "Mainnet pending",
      search: "Search by name or ticker...",
      trending: "Тренд",
      newest: "Новые",
      almost: "Почти",
      graduated: "Вышли",
      volume: "Объём"
    },
    create: {
      eyebrow: "Create / Launch",
      title: "Create a TON meme token",
      subtitle: "Prepare token metadata and generate manual TonConnect transactions. No backend custody, no mnemonic upload.",
      iconTitle: "Upload token icon",
      iconHint: "PNG, JPG or WEBP. Square image recommended.",
      infoTitle: "Token details",
      name: "Token name",
      ticker: "Ticker",
      description: "Description",
      links: "Links",
      launch: "Prepare launch transactions",
      launching: "Preparing launch transactions..."
    },
    faq: {
      title: "FAQ / Rules / Risks",
      subtitle: "Коротко и по делу: как работает launchpad, что уже проверено и что ещё требует live proof.",
      faqTitle: "FAQ",
      rulesTitle: "Правила",
      risksTitle: "Риски"
    },
    rules: [
      "Только TON mainnet. Тестовые кошельки и кривые сети не поддерживаются.",
      "Не выпускай токен под чужим брендом или от чужого имени.",
      "Ticker, арт и ссылки должны соответствовать тому, что ты реально запускаешь.",
      "После live proof можно двигаться к логике DeDust."
    ],
    risks: [
      "Мем-токены — это высокий риск и возможность полной потери средств.",
      "Mainnet proof ещё pending.",
      "Низкая ликвидность и ранний рынок означают риск сильного проскальзывания.",
      "Ни рост цены, ни листинг, ни рыночный интерес не гарантированы."
    ],
    faqItems: [
      { q: "Как запускается токен?", a: "Подключаешь TON кошелёк, заполняешь метаданные и готовишь manual TonConnect flow." },
      { q: "Почему сначала 5 TON?", a: "Это тестовый target для первого mainnet dust-test перед production режимом." },
      { q: "Когда будет DeDust?", a: "После live proof и ручной проверки mainnet-флоу." },
      { q: "Почему no-custody?", a: "Потому что проект не должен хранить сид-фразы и сам подписывать транзакции за пользователя." }
    ],
    misc: {
      live: "pending",
      tonPrice: "TON",
      connect: "Connect Wallet",
      menu: "Menu",
      language: "Язык",
      russian: "Русский",
      english: "English",
      marketEmpty: "No live tokens yet",
      marketEmptyText: "Mainnet proof is pending.",
      noResults: "Nothing found",
      noResultsText: "Try another query.",
      noTokens: "No tokens yet",
      noTokensText: "Connect wallet or prepare your first launch.",
      referralsTitle: "Referral system",
      referralsText: "Referral tracking is pending live deployment.",
      searchMiss: "Search",
      launchpad: "Launchpad"
    }
  },
  en: {
    nav: { market: "Tokens", create: "Launch", portfolio: "Portfolio", referrals: "Referrals", faq: "FAQ", rules: "Rules", risks: "Risks" },
    home: {
      badge: "Technical MVP",
      title: "Launch TON meme tokens. Graduate to DeDust.",
      subtitle: "Create meme tokens on TON, test the bonding flow safely, and prepare for DeDust liquidity without giving custody of your wallet.",
      description: "An honest public preview without fake live claims or backend custody.",
      ctaPrimary: "Create token",
      ctaSecondary: "View status",
      statsA: "Sandbox verified",
      statsB: "Manual signing",
      statsC: "Mainnet pending",
      search: "Search by name or ticker...",
      trending: "Trending",
      newest: "New",
      almost: "Almost",
      graduated: "Graduated",
      volume: "Volume"
    },
    create: {
      eyebrow: "Create / Launch",
      title: "Create a TON meme token",
      subtitle: "Prepare token metadata and generate manual TonConnect transactions. No backend custody, no mnemonic upload.",
      iconTitle: "Upload token icon",
      iconHint: "PNG, JPG or WEBP. Square image recommended.",
      infoTitle: "Token details",
      name: "Token name",
      ticker: "Ticker",
      description: "Description",
      links: "Links",
      launch: "Prepare launch transactions",
      launching: "Preparing launch transactions..."
    },
    faq: {
      title: "FAQ / Rules / Risks",
      subtitle: "Short and clear: how the launchpad works, what is verified now and what still needs live proof.",
      faqTitle: "FAQ",
      rulesTitle: "Rules",
      risksTitle: "Risks"
    },
    rules: [
      "TON mainnet only.",
      "Do not launch tokens under someone else's brand or identity.",
      "Ticker and artwork should match the actual token you are preparing.",
      "Move toward DeDust only after live proof is complete."
    ],
    risks: [
      "Meme tokens are high-risk and can go to zero.",
      "Mainnet proof is still pending.",
      "Low liquidity means slippage and hard exits.",
      "No listing, price growth or market attention is guaranteed."
    ],
    faqItems: [
      { q: "How do I launch a token?", a: "Connect your TON wallet, fill metadata and prepare the manual TonConnect flow." },
      { q: "Why start with 5 TON?", a: "It is the safer test target for the first manual mainnet dust-test." },
      { q: "When does DeDust happen?", a: "After live proof and manual mainnet verification." },
      { q: "Why no-custody?", a: "Because the product should not store seeds or sign transactions on behalf of users." }
    ],
    misc: {
      live: "pending",
      tonPrice: "TON",
      connect: "Connect Wallet",
      menu: "Menu",
      language: "Language",
      russian: "Русский",
      english: "English",
      marketEmpty: "No live tokens yet",
      marketEmptyText: "Mainnet proof is pending.",
      noResults: "Nothing found",
      noResultsText: "Try another query.",
      noTokens: "No tokens yet",
      noTokensText: "Connect wallet or prepare your first launch.",
      referralsTitle: "Referral system",
      referralsText: "Referral tracking is pending live deployment.",
      searchMiss: "Search",
      launchpad: "Launchpad"
    }
  }
} as const;

export type Messages = (typeof messages)[Locale];
