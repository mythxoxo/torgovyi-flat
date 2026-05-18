import { config, getTierCatalog } from "./config.js";

function botApiUrl(method) {
  return `https://api.telegram.org/bot${config.telegram.botToken}/${method}`;
}

async function callTelegram(method, payload) {
  const response = await fetch(botApiUrl(method), {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) {
    const description = data.description || `Telegram API error calling ${method}`;
    throw new Error(description);
  }

  return data.result;
}

function parseInvoicePayload(payload) {
  const [kind, tierId, telegramId] = String(payload || "").split(":");
  return { kind, tierId, telegramId };
}

function buildInvoicePayload({ tierId, telegramId }) {
  return `subscription:${tierId}:${telegramId}`;
}

export function createTelegramClient(storage) {
  async function createInvoiceLink({ tierId, telegramId }) {
    const tier = config.tiers[tierId];
    if (!tier) {
      throw new Error("Unknown tariff.");
    }

    return callTelegram("createInvoiceLink", {
      title: `P2P SpreadBot ${tier.label}`,
      description: tier.description,
      payload: buildInvoicePayload({ tierId, telegramId }),
      provider_token: "",
      currency: "XTR",
      prices: [
        {
          label: tier.label,
          amount: tier.stars
        }
      ]
    });
  }

  async function answerPreCheckoutQuery(preCheckoutQueryId, ok, errorMessage = "") {
    return callTelegram("answerPreCheckoutQuery", {
      pre_checkout_query_id: preCheckoutQueryId,
      ok,
      error_message: ok ? undefined : errorMessage
    });
  }

  async function sendMessage(chatId, text) {
    return callTelegram("sendMessage", {
      chat_id: chatId,
      text,
      disable_web_page_preview: true
    });
  }

  async function processUpdate(update) {
    if (update.pre_checkout_query) {
      const { id, invoice_payload: invoicePayload, from } = update.pre_checkout_query;
      const parsed = parseInvoicePayload(invoicePayload);

      if (
        parsed.kind !== "subscription" ||
        !config.tiers[parsed.tierId] ||
        parsed.telegramId !== String(from.id)
      ) {
        await answerPreCheckoutQuery(
          id,
          false,
          "Subscription validation failed. Please reopen the app and try again."
        );
        return;
      }

      await answerPreCheckoutQuery(id, true);
      return;
    }

    const message = update.message;
    if (!message) {
      return;
    }

    if (message.write_access_allowed && message.from?.id) {
      storage.markWriteAccess(String(message.from.id));
      return;
    }

    if (message.successful_payment) {
      const {
        invoice_payload: invoicePayload,
        total_amount: totalAmount,
        telegram_payment_charge_id: chargeId
      } = message.successful_payment;

      const parsed = parseInvoicePayload(invoicePayload);
      const tier = config.tiers[parsed.tierId];
      if (!tier) {
        return;
      }

      const telegramId = String(message.from?.id || parsed.telegramId);
      const user = storage.activateSubscription({
        telegramId,
        tierId: tier.id,
        chargeId,
        totalAmount,
        durationDays: tier.durationDays,
        paidAt: new Date().toISOString()
      });

      const until = user.subscriptionEndsAt
        ? new Date(user.subscriptionEndsAt).toLocaleString("en-GB")
        : "active";

      await sendMessage(
        telegramId,
        `Pro unlocked.\n\nAccess active until: ${until}\nYou now receive the full feed and personal alerts.`
      );
    }
  }

  async function startPolling(onUpdate) {
    let offset = 0;

    async function loop() {
      if (!config.telegram.botToken) {
        return;
      }

      try {
        const updates = await callTelegram("getUpdates", {
          offset,
          timeout: 25,
          allowed_updates: ["message", "pre_checkout_query"]
        });

        for (const update of updates) {
          offset = update.update_id + 1;
          await onUpdate(update);
        }
      } catch (error) {
        console.error("Polling error:", error.message);
      }

      setImmediate(loop);
    }

    loop();
  }

  return {
    getTierCatalog,
    createInvoiceLink,
    processUpdate,
    sendMessage,
    startPolling,
    isConfigured() {
      return Boolean(config.telegram.botToken);
    }
  };
}
