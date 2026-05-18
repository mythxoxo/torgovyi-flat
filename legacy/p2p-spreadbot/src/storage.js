function nowIso() {
  return new Date().toISOString();
}

function createDefaultUser(partial = {}) {
  return {
    telegramId: String(partial.telegramId || "0"),
    firstName: partial.firstName || "Trader",
    lastName: partial.lastName || "",
    username: partial.username || "",
    languageCode: partial.languageCode || "en",
    allowsWriteToPm: Boolean(partial.allowsWriteToPm),
    addedToAttachmentMenu: Boolean(partial.addedToAttachmentMenu),
    canReceiveMessages: Boolean(partial.canReceiveMessages),
    photoUrl: partial.photoUrl || "",
    isPremium: Boolean(partial.isPremium),
    plan: partial.plan || "free",
    subscriptionEndsAt: partial.subscriptionEndsAt || null,
    settings: {
      asset: partial.settings?.asset || "ALL",
      fiat: partial.settings?.fiat || "ALL",
      minSpread: Number(partial.settings?.minSpread ?? 1.5),
      venues: Array.isArray(partial.settings?.venues)
        ? partial.settings.venues
        : ["binance_p2p", "bybit_p2p", "bestchange", "spot"],
      alertsEnabled: partial.settings?.alertsEnabled ?? true
    },
    alertHistory: partial.alertHistory || {},
    createdAt: partial.createdAt || nowIso(),
    updatedAt: partial.updatedAt || nowIso()
  };
}

function createDefaultState() {
  return {
    meta: {
      createdAt: nowIso(),
      updatedAt: nowIso()
    },
    users: {},
    payments: [],
    spreads: {
      current: [],
      public: [],
      lastFullRefreshAt: null,
      lastPublicRefreshAt: null
    }
  };
}

function mergeUser(existing, next) {
  return createDefaultUser({
    ...existing,
    ...next,
    settings: {
      ...existing?.settings,
      ...next?.settings
    },
    alertHistory: {
      ...existing?.alertHistory,
      ...next?.alertHistory
    },
    updatedAt: nowIso()
  });
}

export class Storage {
  constructor(filePath, options = {}) {
    this.filePath = filePath;
    this.publicFeedIntervalMs = options.publicFeedIntervalMs ?? 300000;
    this.state = createDefaultState();
    this.saveTimer = null;
    this.flushPromise = null;
  }

  async init() {
    const { promises: fs } = await import("node:fs");
    const path = await import("node:path");
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });

    try {
      const raw = await fs.readFile(this.filePath, "utf8");
      const parsed = JSON.parse(raw);
      this.state = {
        ...createDefaultState(),
        ...parsed,
        users: parsed.users || {},
        payments: parsed.payments || [],
        spreads: {
          ...createDefaultState().spreads,
          ...(parsed.spreads || {})
        }
      };
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }

      await this.flush();
    }
  }

  markDirty() {
    this.state.meta.updatedAt = nowIso();

    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    this.saveTimer = setTimeout(() => {
      this.flush().catch((error) => {
        console.error("Failed to flush storage:", error);
      });
    }, 100);
  }

  async flush() {
    const { promises: fs } = await import("node:fs");

    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }

    if (this.flushPromise) {
      return this.flushPromise;
    }

    this.flushPromise = fs
      .writeFile(this.filePath, JSON.stringify(this.state, null, 2), "utf8")
      .finally(() => {
        this.flushPromise = null;
      });

    return this.flushPromise;
  }

  getUser(telegramId) {
    return this.state.users[String(telegramId)] || null;
  }

  ensureUser(userData) {
    const telegramId = String(userData.telegramId);
    const existing = this.getUser(telegramId);
    const merged = mergeUser(existing || createDefaultUser(userData), {
      ...userData,
      telegramId,
      canReceiveMessages:
        userData.canReceiveMessages ||
        userData.allowsWriteToPm ||
        existing?.canReceiveMessages ||
        existing?.allowsWriteToPm ||
        false
    });

    this.state.users[telegramId] = merged;
    this.markDirty();
    return merged;
  }

  createOrUpdateFromTelegramProfile(profile) {
    return this.ensureUser({
      telegramId: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      username: profile.username,
      languageCode: profile.language_code,
      allowsWriteToPm: profile.allows_write_to_pm,
      addedToAttachmentMenu: profile.added_to_attachment_menu,
      photoUrl: profile.photo_url,
      isPremium: profile.is_premium,
      canReceiveMessages: profile.allows_write_to_pm
    });
  }

  ensureDevUser() {
    return this.ensureUser({
      telegramId: "999000",
      firstName: "Dev",
      lastName: "Mode",
      username: "local_dev",
      canReceiveMessages: false
    });
  }

  listUsers() {
    return Object.values(this.state.users);
  }

  saveSettings(telegramId, settings) {
    const user = this.getUser(telegramId);
    if (!user) {
      return null;
    }

    user.settings = {
      ...user.settings,
      ...settings,
      minSpread: Number(settings.minSpread ?? user.settings.minSpread)
    };
    user.updatedAt = nowIso();
    this.markDirty();
    return user;
  }

  markWriteAccess(telegramId) {
    const user = this.getUser(telegramId);
    if (!user) {
      return null;
    }

    user.canReceiveMessages = true;
    user.allowsWriteToPm = true;
    user.updatedAt = nowIso();
    this.markDirty();
    return user;
  }

  activateSubscription({ telegramId, tierId, chargeId, totalAmount, paidAt, durationDays }) {
    const user = this.getUser(telegramId) || this.ensureUser({ telegramId });
    const paidDate = new Date(paidAt || Date.now());
    const currentEnd = user.subscriptionEndsAt ? new Date(user.subscriptionEndsAt) : null;
    const baseDate =
      currentEnd && currentEnd.getTime() > paidDate.getTime() ? currentEnd : paidDate;
    const nextEnd = new Date(baseDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    user.plan = "pro";
    user.subscriptionEndsAt = nextEnd.toISOString();
    user.updatedAt = nowIso();

    this.state.payments.push({
      telegramId: String(telegramId),
      tierId,
      chargeId,
      totalAmount,
      paidAt: paidDate.toISOString()
    });

    this.markDirty();
    return user;
  }

  isUserPro(user) {
    if (!user) {
      return false;
    }

    if (user.plan !== "pro" || !user.subscriptionEndsAt) {
      return false;
    }

    return new Date(user.subscriptionEndsAt).getTime() > Date.now();
  }

  setSpreads(spreads, refreshedAt = nowIso()) {
    this.state.spreads.current = spreads;
    this.state.spreads.lastFullRefreshAt = refreshedAt;

    const lastPublic = this.state.spreads.lastPublicRefreshAt
      ? new Date(this.state.spreads.lastPublicRefreshAt).getTime()
      : 0;

    if (
      !this.state.spreads.public.length ||
      Date.now() - lastPublic >= this.publicFeedIntervalMs
    ) {
      this.state.spreads.public = spreads;
      this.state.spreads.lastPublicRefreshAt = refreshedAt;
    }

    this.markDirty();
  }

  getSpreadSnapshot(user, filters = {}) {
    const isPro = this.isUserPro(user);
    const source = isPro ? this.state.spreads.current : this.state.spreads.public;
    const filtered = source.filter((spread) => matchesSpreadFilters(spread, filters));

    return {
      items: isPro ? filtered : filtered.slice(0, 3),
      mode: isPro ? "realtime" : "free_delayed",
      lastFullRefreshAt: this.state.spreads.lastFullRefreshAt,
      lastPublicRefreshAt: this.state.spreads.lastPublicRefreshAt,
      totalAvailable: source.length
    };
  }

  rememberAlert(telegramId, opportunityKey) {
    const user = this.getUser(telegramId);
    if (!user) {
      return;
    }

    user.alertHistory[opportunityKey] = nowIso();
    user.updatedAt = nowIso();
    this.markDirty();
  }

  getAlertTimestamp(telegramId, opportunityKey) {
    const user = this.getUser(telegramId);
    if (!user) {
      return null;
    }

    return user.alertHistory[opportunityKey] || null;
  }
}

export function matchesSpreadFilters(spread, filters = {}) {
  const asset = filters.asset || "ALL";
  const fiat = filters.fiat || "ALL";
  const minSpread = Number(filters.minSpread ?? 0);
  const venues = normalizeVenues(filters.venues);

  if (asset !== "ALL" && spread.asset !== asset) {
    return false;
  }

  if (fiat !== "ALL" && spread.fiat !== fiat) {
    return false;
  }

  if (Number.isFinite(minSpread) && spread.spreadPct < minSpread) {
    return false;
  }

  if (venues.length) {
    const matched = venues.includes(spread.buyVenueId) || venues.includes(spread.sellVenueId);
    if (!matched) {
      return false;
    }
  }

  return true;
}

export function normalizeVenues(input) {
  if (Array.isArray(input)) {
    return input.filter(Boolean);
  }

  if (typeof input === "string" && input.trim()) {
    return input
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }

  return [];
}

export function serializeUser(user, storage) {
  return {
    telegramId: user.telegramId,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    languageCode: user.languageCode,
    plan: storage.isUserPro(user) ? "pro" : "free",
    subscriptionEndsAt: storage.isUserPro(user) ? user.subscriptionEndsAt : null,
    settings: user.settings,
    canReceiveMessages: user.canReceiveMessages,
    isPremium: user.isPremium
  };
}
