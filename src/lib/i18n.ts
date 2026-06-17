export type Locale = "ru" | "en";

export const defaultLocale: Locale = "ru";

export const messages = {
  ru: {
    nav: { home: "Главная", search: "Поиск", markets: "Рынки", profile: "Профиль" },
    home: {
      title: "Запускай GRAM-мемы без шума.",
      subtitle:
        "TONS of GRAM — wallet-first launchpad для мем-токенов: тестовый запуск на 5 GRAM и основная модель на 8888 GRAM.",
      ctaTokens: "Смотреть токены",
      launchTest: "Запуск 5 GRAM",
      launchMain: "Запуск 8888 GRAM",
      modeTest: "Тестовый запуск",
      modeMain: "Основной запуск",
      note: "5 GRAM — быстрый публичный тест механики. 8888 GRAM — основная модель запуска.",
      launchesTitle: "Launchpad feed"
    },
    create: {
      title: "Создать токен",
      subtitle: "Выбери режим запуска и подготовь транзакции через свой кошелёк.",
      modeTitle: "Выбери режим запуска",
      modeTest: "5 GRAM — тестовый запуск",
      modeMain: "8888 GRAM — основная модель",
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
      title: "Launch GRAM memes without the noise.",
      subtitle:
        "TONS of GRAM is a wallet-first launchpad for meme tokens: test launches at 5 GRAM and the main launch model at 8888 GRAM.",
      ctaTokens: "Explore tokens",
      launchTest: "Launch 5 GRAM",
      launchMain: "Launch 8888 GRAM",
      modeTest: "Test launch",
      modeMain: "Main launch",
      note: "5 GRAM is a fast public mechanics test. 8888 GRAM is the main launch model.",
      launchesTitle: "Launchpad feed"
    },
    create: {
      title: "Create token",
      subtitle: "Choose a launch mode and prepare transactions with your wallet.",
      modeTitle: "Choose launch mode",
      modeTest: "5 GRAM — test launch",
      modeMain: "8888 GRAM — main model",
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
