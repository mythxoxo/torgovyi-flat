export type Locale = "ru" | "en";

export const defaultLocale: Locale = "ru";

export const messages = {
  ru: {
    nav: { market: "Маркет", create: "Запуск", portfolio: "Портфель", referrals: "Рефералы", faq: "FAQ", rules: "Правила", risks: "Риски" },
    home: {
      badge: "Mainnet launchpad",
      title: "TONK.MEM",
      subtitle: "Запускай мем-токены на TON без дешёвого TMA вайба.",
      description: "Нормальный launchpad-интерфейс с реальным TON прайсом, понятным маркетом, mainnet wallet-flow и сильной подачей бренда.",
      ctaPrimary: "Запустить токен",
      ctaSecondary: "Открыть FAQ",
      statsA: "Telegram-native",
      statsB: "Bonding → STON.fi",
      statsC: "Mainnet only",
      search: "Поиск по имени или тикеру...",
      trending: "Тренд",
      newest: "Новые",
      almost: "Почти",
      graduated: "Вышли",
      volume: "Объём"
    },
    create: {
      eyebrow: "Create / Launch",
      title: "Создай мем-токен",
      subtitle: "Собери запуск без мусорной композиции: сильный арт, чистый тикер, понятные параметры и нормальный mainnet flow.",
      iconTitle: "Арт токена",
      iconHint: "Загрузи главный визуал — без текста поверх картинки.",
      infoTitle: "Информация о токене",
      name: "Название *",
      ticker: "Тикер *",
      description: "Описание",
      links: "Добавить ссылки",
      launch: "Запустить на TON",
      launching: "Запуск..."
    },
    faq: {
      title: "FAQ / Rules / Risks",
      subtitle: "Коротко и по делу: как работает launchpad, что происходит на mainnet и где реальные риски.",
      faqTitle: "FAQ",
      rulesTitle: "Правила",
      risksTitle: "Риски"
    },
    rules: [
      "Только TON mainnet. Тестовые кошельки и кривые сети не поддерживаются.",
      "Не выпускай токен под чужим брендом или от чужого имени.",
      "Ticker, арт и ссылки должны соответствовать тому, что ты реально запускаешь.",
      "Если токен доходит до graduation — дальше ликвидность и жизнь на STON.fi."
    ],
    risks: [
      "Мем-токены — это высокий риск, волатильность и возможность полной потери средств.",
      "Bonding price может резко меняться после нескольких сделок.",
      "Низкая ликвидность = высокий проскальзыватель и трудный выход.",
      "Никто не гарантирует рост цены, листинг или интерес рынка."
    ],
    faqItems: [
      { q: "Как запускается токен?", a: "Подключаешь TON mainnet wallet, загружаешь арт, задаёшь ticker и отправляешь создание через launch flow." },
      { q: "Когда появляется graduation?", a: "Когда bonding curve добирается до нужного состояния, токен помечается как graduated и переходит к логике STON.fi." },
      { q: "Почему нужен mainnet?", a: "Потому что это не тестовый макет, а боевой TMA flow. Неправильная сеть ломает транзакции." },
      { q: "Что дают referrals?", a: "Рефералка направляет часть комиссий с трафика и сделок тем, кто привёл пользователя." }
    ],
    misc: {
      live: "live",
      tonPrice: "TON",
      connect: "Подключить",
      menu: "Меню",
      language: "Язык",
      russian: "Русский",
      english: "English",
      marketEmpty: "Пока пусто",
      marketEmptyText: "Стань первым и закинь в маркет токен, который реально хочется открыть.",
      noResults: "Ничего не найдено",
      noResultsText: "Попробуй другой запрос.",
      noTokens: "Ваших токенов пока нет",
      noTokensText: "Подключи кошелёк или запусти первый токен.",
      referralsTitle: "Реферальная система",
      referralsText: "Делись ссылкой и собирай TON с приведённого оборота.",
      searchMiss: "Поиск",
      launchpad: "Launchpad"
    }
  },
  en: {
    nav: { market: "Market", create: "Create", portfolio: "Portfolio", referrals: "Referrals", faq: "FAQ", rules: "Rules", risks: "Risks" },
    home: {
      badge: "Mainnet launchpad",
      title: "TONK.MEM",
      subtitle: "Launch meme tokens on TON without the cheap TMA look.",
      description: "A cleaner launchpad interface with live TON price, better market clarity, real mainnet wallet flow and stronger brand presentation.",
      ctaPrimary: "Launch token",
      ctaSecondary: "Open FAQ",
      statsA: "Telegram-native",
      statsB: "Bonding → STON.fi",
      statsC: "Mainnet only",
      search: "Search by name or ticker...",
      trending: "Trending",
      newest: "New",
      almost: "Almost",
      graduated: "Graduated",
      volume: "Volume"
    },
    create: {
      eyebrow: "Create / Launch",
      title: "Create a meme token",
      subtitle: "Build a launch without garbage composition: strong art, clean ticker, clear parameters and proper mainnet flow.",
      iconTitle: "Token artwork",
      iconHint: "Upload the main visual — no copy pasted on top of the image.",
      infoTitle: "Token info",
      name: "Name *",
      ticker: "Ticker *",
      description: "Description",
      links: "Add links",
      launch: "Launch on TON",
      launching: "Launching..."
    },
    faq: {
      title: "FAQ / Rules / Risks",
      subtitle: "Short and useful: how the launchpad works, what happens on mainnet and where the real risks are.",
      faqTitle: "FAQ",
      rulesTitle: "Rules",
      risksTitle: "Risks"
    },
    rules: [
      "TON mainnet only. Broken networks and test wallets are not supported.",
      "Do not launch tokens under someone else's brand or identity.",
      "Ticker, artwork and links should match the actual token you are launching.",
      "Once the token reaches graduation, liquidity logic moves toward STON.fi."
    ],
    risks: [
      "Meme tokens are high-risk, highly volatile and may go to zero.",
      "Bonding price can move sharply after only a few trades.",
      "Low liquidity means higher slippage and harder exits.",
      "Nobody guarantees price growth, listings or market interest."
    ],
    faqItems: [
      { q: "How do I launch a token?", a: "Connect a TON mainnet wallet, upload art, set the ticker and submit the token through the launch flow." },
      { q: "When does graduation appear?", a: "When the bonding curve reaches the required state, the token is marked as graduated and moves into STON.fi-related logic." },
      { q: "Why mainnet only?", a: "Because this is intended as a real TMA flow, not a fake test screen. Wrong networks break transactions." },
      { q: "What do referrals do?", a: "Referral flow routes part of trading fees from referred activity back to the referrer." }
    ],
    misc: {
      live: "live",
      tonPrice: "TON",
      connect: "Connect",
      menu: "Menu",
      language: "Language",
      russian: "Русский",
      english: "English",
      marketEmpty: "Nothing here yet",
      marketEmptyText: "Be first and launch something worth opening.",
      noResults: "No results",
      noResultsText: "Try another query.",
      noTokens: "No tokens yet",
      noTokensText: "Connect wallet or launch your first token.",
      referralsTitle: "Referral system",
      referralsText: "Share your link and collect TON from referred volume.",
      searchMiss: "Search",
      launchpad: "Launchpad"
    }
  }
} as const;

export type Messages = (typeof messages)[Locale];
