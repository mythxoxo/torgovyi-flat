import { loadOptionalEnvFile, optionalString } from "@meme-launchpad/config";

loadOptionalEnvFile();

const token = optionalString(process.env.TELEGRAM_BOT_TOKEN);
const botUsername = optionalString(process.env.TELEGRAM_BOT_USERNAME, "your_bot");
const webAppUrl = optionalString(process.env.TELEGRAM_WEBAPP_URL, "http://localhost:3000");
const apiBase = optionalString(process.env.NEXT_PUBLIC_API_URL, "http://localhost:3001");

type TelegramUpdate = {
  update_id: number;
  message?: {
    chat: { id: number };
    text?: string;
    from?: { id: number; first_name?: string };
  };
};

const sendMessage = async (
  chatId: number,
  text: string,
  withMiniApp = false
) => {
  if (!token) {
    return;
  }

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      reply_markup: withMiniApp
        ? {
            inline_keyboard: [
              [
                {
                  text: "Open launchpad",
                  web_app: {
                    url: webAppUrl
                  }
                }
              ]
            ]
          }
        : undefined
    })
  });
};

const fetchTrending = async (): Promise<string> => {
  try {
    const response = await fetch(`${apiBase}/tokens?filter=trending`);
    const tokens = (await response.json()) as Array<{ name: string; ticker: string; state: { progress: number } }>;
    return tokens
      .slice(0, 3)
      .map((token, index) => `${index + 1}. ${token.name} ($${token.ticker}) - ${(token.state.progress * 100).toFixed(1)}%`)
      .join("\n");
  } catch {
    return "Trending feed is unavailable right now.";
  }
};

const handleCommand = async (update: TelegramUpdate) => {
  const message = update.message;
  if (!message?.text) {
    return;
  }

  const [command, startParam] = message.text.split(" ");
  const chatId = message.chat.id;

  if (command === "/start") {
    const referralContext = startParam?.startsWith("ref_") ? `Referral detected: ${startParam.slice(4)}.` : "No referral in this start.";
    await sendMessage(
      chatId,
      `TON Meme Launchpad is ready.\n${referralContext}\nUse /create, /trending, or /ref.`,
      true
    );
    return;
  }

  if (command === "/create") {
    await sendMessage(chatId, "Open the Mini App and jump straight into the Create screen.", true);
    return;
  }

  if (command === "/trending") {
    await sendMessage(chatId, `Trending right now:\n${await fetchTrending()}`, true);
    return;
  }

  if (command === "/ref") {
    const deepLink = `https://t.me/${botUsername}?startapp=ref_tg${chatId}`;
    await sendMessage(
      chatId,
      `Bot deep link:\n${deepLink}\n\nFor wallet-linked revenue sharing, open the Mini App and copy your live referral code from the Referrals page.`,
      true
    );
  }
};

const poll = async () => {
  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN is not set. Bot is idling.");
    setInterval(() => undefined, 60_000);
    return;
  }

  let offset = 0;
  console.log("Telegram bot polling started.");

  while (true) {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${token}/getUpdates?timeout=20&offset=${offset}`
      );
      const payload = (await response.json()) as {
        ok: boolean;
        result: TelegramUpdate[];
      };

      for (const update of payload.result) {
        offset = update.update_id + 1;
        await handleCommand(update);
      }
    } catch (error) {
      console.error("Polling error", error);
      await new Promise((resolve) => setTimeout(resolve, 3_000));
    }
  }
};

void poll();
