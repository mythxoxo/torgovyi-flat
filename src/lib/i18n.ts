export type Locale = "ru" | "en";

export const defaultLocale: Locale = "ru";

export const messages = {
  ru: {
    nav: { home: "Главная", search: "Поиск", markets: "Рынки", profile: "Профиль" },
    home: {
      title: "Запускай TON-мемы без лишнего шума.",
      subtitle:
        "TONK.MEM — launchpad для токенов на TON: старт через кошелёк, тестовый режим на 5 TON и основная модель на 8888 TON.",
      ctaTokens: "Смотреть токены",
      launchTest: "Запуск 5 TON",
      launchMain: "Запуск 8888 TON",
      modeTest: "Тестовый запуск — 5 TON",
      modeMain: "Основной запуск — 8888 TON",
      note: "5 TON — для проверки механики. 8888 TON — основная модель запуска.",
      launchesTitle: "Последние запуски"
    },
    create: {
      title: "Создать токен",
      subtitle: "Выбери режим запуска и подготовь транзакции через свой кошелёк.",
      modeTitle: "Выбери режим запуска",
      modeTest: "5 TON — тестовый запуск",
      modeMain: "8888 TON — основная модель",
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
      mainnet: "TON mainnet",
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
      title: "Launch TON memes without the noise.",
      subtitle:
        "TONK.MEM is a TON launchpad for wallet-first token launches, test runs at 5 TON and the main launch model at 8888 TON.",
      ctaTokens: "Explore tokens",
      launchTest: "Launch 5 TON",
      launchMain: "Launch 8888 TON",
      modeTest: "Test launch — 5 TON",
      modeMain: "Main launch — 8888 TON",
      note: "5 TON is for testing mechanics. 8888 TON is the main launch model.",
      launchesTitle: "Latest launches"
    },
    create: {
      title: "Create token",
      subtitle: "Choose a launch mode and prepare transactions with your wallet.",
      modeTitle: "Choose launch mode",
      modeTest: "5 TON — test launch",
      modeMain: "8888 TON — main model",
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
      mainnet: "TON mainnet",
      noLaunches: "No launches yet. The first indexed token will appear here.",
      nothingFound: "Nothing found",
      tryAnother: "Try another query.",
      noTokensProfile: "No jettons found in this wallet yet.",
      loadingWallet: "Loading wallet assets..."
    }
  }
} as const;

export type Messages = (typeof messages)[Locale];
