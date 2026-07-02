export type Locale = "ru" | "en";

export const defaultLocale: Locale = "ru";

export const messages = {
  ru: {
    nav: { home: "Главная", search: "Поиск", markets: "Рынки", profile: "Профиль" },
    home: {
      title: "Запускай идеи GRAM на TON.",
      subtitle:
        "Создавай, делись и отслеживай GRAM-based запуски с подписью в кошельке и прозрачным market status.",
      ctaTokens: "Смотреть рынки",
      launchTest: "Внутренний тест",
      launchMain: "Запустить токен",
      modeTest: "5 GRAM — внутренний тест",
      modeMain: "Основной запуск — 8888 GRAM",
      note: "5 GRAM — только для внутренней проверки. Публичный запуск — 8888 GRAM.",
      launchesTitle: "Последние запуски"
    },
    create: {
      title: "Запустить токен",
      subtitle: "Настрой GRAM-based запуск, подпиши шаги в кошельке и двигайся по понятному launch flow в TON Blockchain.",
      modeTitle: "Режим запуска",
      modeTest: "5 GRAM — внутренний тест",
      modeMain: "8888 GRAM — публичный запуск",
      signed: "Wallet-signed only. Без custody."
    },
    search: {
      title: "Поиск токенов",
      placeholder: "Название, тикер или адрес токена",
      empty: "Начни вводить название или тикер."
    },
    markets: {
      title: "GRAM рынки",
      trending: "В тренде",
      volume: "Топ по объёму",
      gainers: "Лидеры роста",
      new: "Новые запуски",
      empty: "Рейтинги появятся после первых индексированных сделок."
    },
    profile: {
      title: "Кошелёк",
      subtitle: "Следи за кошельком, запусками и GRAM-активностью.",
      connect: "Подключи кошелёк, чтобы увидеть балансы, запуски и referral state.",
      assetsFallback: "Не удалось загрузить активы кошелька. Проверь mainnet API ключи и повтори позже."
    },
    token: {
      chartEmpty: "График появится после первых индексированных покупок.",
      tradesEmpty: "Сделки появятся после первой покупки."
    },
    misc: {
      connect: "Подключить",
      disconnect: "Отключить",
      mainnet: "GRAM mainnet",
      noLaunches: "Пока нет запущенных токенов. Первый запуск появится здесь после индексации.",
      nothingFound: "Ничего не найдено",
      tryAnother: "Попробуй другой запрос.",
      noTokensProfile: "В этом кошельке пока нет jetton-активов.",
      loadingWallet: "Загружаю активы кошелька..."
    }
  },
  en: {
    nav: { home: "Home", search: "Search", markets: "Markets", profile: "Profile" },
    home: {
      title: "Launch GRAM ideas on TON.",
      subtitle:
        "Create, share, and track GRAM-based launches with wallet-signed steps and transparent market status.",
      ctaTokens: "Explore markets",
      launchTest: "Internal test",
      launchMain: "Launch token",
      modeTest: "5 GRAM — internal test",
      modeMain: "Main launch — 8888 GRAM",
      note: "5 GRAM is only for internal checks. Public launch starts at 8888 GRAM.",
      launchesTitle: "Latest launches"
    },
    create: {
      title: "Launch token",
      subtitle: "Set up a GRAM-based launch, sign with your wallet, and move through a clear launch flow on TON Blockchain.",
      modeTitle: "Launch mode",
      modeTest: "5 GRAM — internal test",
      modeMain: "8888 GRAM — public launch",
      signed: "Wallet-signed only. No custody."
    },
    search: {
      title: "Search tokens",
      placeholder: "Name, ticker or token address",
      empty: "Start typing a name or ticker."
    },
    markets: {
      title: "GRAM markets",
      trending: "Trending",
      volume: "Top volume",
      gainers: "Gainers",
      new: "New launches",
      empty: "Market rankings will appear after indexed trades."
    },
    profile: {
      title: "Wallet",
      subtitle: "Track your wallet, launches, and GRAM activity.",
      connect: "Connect wallet to view balances, launches, and referral state.",
      assetsFallback: "Wallet assets are not available yet. Check mainnet API keys and try again later."
    },
    token: {
      chartEmpty: "The chart will appear after the first indexed buys.",
      tradesEmpty: "Trades will appear after the first buy."
    },
    misc: {
      connect: "Connect",
      disconnect: "Disconnect",
      mainnet: "GRAM mainnet",
      noLaunches: "No launches yet. The first indexed token will appear here.",
      nothingFound: "Nothing found",
      tryAnother: "Try another query.",
      noTokensProfile: "No jettons found in this wallet yet.",
      loadingWallet: "Loading wallet assets..."
    }
  }
} as const;

export type Messages = (typeof messages)[Locale];
