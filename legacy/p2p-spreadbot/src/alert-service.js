import { matchesSpreadFilters } from "./storage.js";

function formatAlertMessage(spread, appUrl) {
  const lines = [
    `New spread found: ${spread.asset}/${spread.fiat}`,
    ``,
    `Buy: ${spread.buyVenueLabel} at ${spread.buyRate}`,
    `Sell: ${spread.sellVenueLabel} at ${spread.sellRate}`,
    `Spread: ${spread.spreadPct}%`,
    `Est. profit per 1000 units: ${spread.estimatedProfitPer1000}`
  ];

  if (appUrl) {
    lines.push("", `Open app: ${appUrl}`);
  }

  return lines.join("\n");
}

export async function dispatchAlerts({
  storage,
  telegram,
  appUrl,
  cooldownMs,
  spreads
}) {
  if (!telegram.isConfigured()) {
    return;
  }

  const users = storage.listUsers();
  for (const user of users) {
    if (!storage.isUserPro(user)) {
      continue;
    }

    if (!user.settings.alertsEnabled || !user.canReceiveMessages) {
      continue;
    }

    const candidates = spreads.filter((spread) =>
      matchesSpreadFilters(spread, {
        asset: user.settings.asset,
        fiat: user.settings.fiat,
        minSpread: user.settings.minSpread,
        venues: user.settings.venues
      })
    );

    if (!candidates.length) {
      continue;
    }

    const top = candidates[0];
    const alertKey = `${top.id}:${top.spreadPct}`;
    const lastSent = storage.getAlertTimestamp(user.telegramId, alertKey);

    if (lastSent && Date.now() - new Date(lastSent).getTime() < cooldownMs) {
      continue;
    }

    try {
      await telegram.sendMessage(
        user.telegramId,
        formatAlertMessage(top, appUrl)
      );
      storage.rememberAlert(user.telegramId, alertKey);
    } catch (error) {
      console.error(`Failed to send alert to ${user.telegramId}:`, error.message);
    }
  }
}
