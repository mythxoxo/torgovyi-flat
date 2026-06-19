export type Locale = "ru" | "en";

export const defaultLocale: Locale = "ru";

export const messages = {
  ru: {
    nav: { home: "Главная", search: "Поиск", markets: "Рынки", profile: "Профиль" },
    home: {
      title: "Запусти токен. Пусть рынок решит.",
      subtitle:
        "Создай запуск, подпиши транзакции кошельком и следи за прогрессом в ленте. Публичный старт — 8888 GRAM.",
      ctaTokens: "Смотреть токены",
      launchTest: "Внутренний тест",
      launchMain: "Запуск 8888 GRAM",
      modeTest: "5 GRAM — внутренний тест",
      modeMain: "Основной запуск — 8888 GRAM",
      note: "5 GRAM — только для внутренней проверки. Публичный запуск — 8888 GRAM.",
      launchesTitle: "Последние запуски"
    },
    create: {
      title: "Создать токен",
      subtitle: "Подготовь запуск и подпиши транзакции через свой кошелёк.",
      modeTitle: "Режим запуска",
      modeTest: "5 GRAM — внутренний тест",
      modeMain: "8888 GRAM — публичный запуск",
      signed: "Транзакции подписываются только через твой кошелёк."
    },
    search: {
      title: "Поиск токенов",
      placeholder: "Название, тикер или адрес токена",
      empty: "Начни вводить название или тикер."
    },
    markets: {
      title: "Рынки",
      trending: "В тренде",
      volume: "Топ по объёму",
      gainers: "Лидеры роста",
      new: "Новые запуски",
      empty: "Рейтинги появятся после первых индексированных сделок."
    },
    profile: {
      title: "Профиль",
      subtitle: "Только активы подключённого кошелька.",
      connect: "Подключите кошелёк, чтобы увидеть профиль.",
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
      title: "Launch the token. Let the market decide.",
      subtitle:
        "Create the launch, sign with your wallet, and track progress in the live feed. Public launch starts at 8888 GRAM.",
      ctaTokens: "Explore tokens",
      launchTest: "Internal test",
      launchMain: "Launch 8888 GRAM",
      modeTest: "5 GRAM — internal test",
      modeMain: "Main launch — 8888 GRAM",
      note: "5 GRAM is only for internal checks. Public launch starts at 8888 GRAM.",
      launchesTitle: "Latest launches"
    },
    create: {
      title: "Create token",
      subtitle: "Prepare the launch and sign transactions with your wallet.",
      modeTitle: "Launch mode",
      modeTest: "5 GRAM — internal test",
      modeMain: "8888 GRAM — public launch",
      signed: "Transactions are signed only by your wallet."
    },
    search: {
      title: "Search tokens",
      placeholder: "Name, ticker or token address",
      empty: "Start typing a name or ticker."
    },
    markets: {
      title: "Markets",
      trending: "Trending",
      volume: "Top volume",
      gainers: "Gainers",
      new: "New launches",
      empty: "Market rankings will appear after indexed trades."
    },
    profile: {
      title: "Profile",
      subtitle: "Only the connected wallet assets are shown here.",
      connect: "Connect your wallet to open the profile.",
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
