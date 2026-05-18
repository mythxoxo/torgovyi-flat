const tg = window.Telegram?.WebApp;

const state = {
  initData: "",
  session: null,
  bootstrap: null,
  selectedVenues: new Set(),
  activeFilters: null
};

const ui = {
  assetSelect: document.getElementById("assetSelect"),
  fiatSelect: document.getElementById("fiatSelect"),
  minSpreadInput: document.getElementById("minSpreadInput"),
  venueList: document.getElementById("venueList"),
  spreadTableBody: document.getElementById("spreadTableBody"),
  statusBar: document.getElementById("statusBar"),
  tierList: document.getElementById("tierList"),
  feedModeBadge: document.getElementById("feedModeBadge"),
  planBadge: document.getElementById("planBadge"),
  visibleCount: document.getElementById("visibleCount"),
  bestSpread: document.getElementById("bestSpread"),
  refreshAt: document.getElementById("refreshAt"),
  feedHint: document.getElementById("feedHint"),
  writeAccessNotice: document.getElementById("writeAccessNotice"),
  reloadButton: document.getElementById("reloadButton"),
  saveSettingsButton: document.getElementById("saveSettingsButton"),
  writeAccessButton: document.getElementById("writeAccessButton")
};

boot().catch((error) => {
  setStatus(error.message || "Failed to boot app.");
});

async function boot() {
  initTelegramShell();
  await loadSession();
  await loadBootstrap();
  bindUi();
  startAutoRefresh();
}

function initTelegramShell() {
  if (!tg) {
    setStatus("Running in browser dev mode.");
    return;
  }

  tg.ready();
  tg.expand();
  tg.setHeaderColor?.("#08131b");
  tg.setBackgroundColor?.("#08131b");
  state.initData = tg.initData || "";

  tg.onEvent("invoiceClosed", async () => {
    await loadSession();
    await loadBootstrap();
  });

  tg.onEvent("writeAccessRequested", async (event) => {
    if (event.status === "allowed") {
      setStatus("DM access granted. Refreshing session...");
      await loadSession();
      await loadBootstrap();
      return;
    }

    setStatus("DM access was not granted.");
  });
}

async function loadSession() {
  const response = await fetchJson("/api/session", {
    method: "POST",
    body: JSON.stringify({ initData: state.initData })
  });

  state.session = response;
  if (!state.activeFilters) {
    state.activeFilters = userSettingsToFilters(response.user.settings);
    state.selectedVenues = new Set(response.user.settings.venues || []);
  }
  setStatus(
    response.devMode
      ? "Dev mode session loaded."
      : `Logged in as ${response.user.firstName || response.user.username || "trader"}.`
  );
}

async function loadBootstrap() {
  const filters = buildQuery(state.activeFilters || getActiveFilters());

  const response = await fetch(`/api/bootstrap?${filters}`, {
    headers: {
      "x-telegram-init-data": state.initData
    }
  });

  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "Failed to load feed.");
  }

  state.bootstrap = payload;

  renderControls();
  renderFeed();
  renderTiers();
  renderMeta();
}

function bindUi() {
  ui.reloadButton.addEventListener("click", async () => {
    setStatus("Refreshing feed...");
    await loadBootstrap();
    setStatus("Feed refreshed.");
  });

  ui.saveSettingsButton.addEventListener("click", saveSettings);
  ui.writeAccessButton.addEventListener("click", requestWriteAccess);
  ui.assetSelect.addEventListener("change", previewFilters);
  ui.fiatSelect.addEventListener("change", previewFilters);
  ui.minSpreadInput.addEventListener("change", previewFilters);
}

function renderControls() {
  const { marketMeta } = state.bootstrap;
  const currentFilters = state.activeFilters || userSettingsToFilters(state.bootstrap.user.settings);

  populateSelect(ui.assetSelect, ["ALL", ...marketMeta.assets], currentFilters.asset);
  populateSelect(ui.fiatSelect, ["ALL", ...marketMeta.fiats], currentFilters.fiat);
  ui.minSpreadInput.value = currentFilters.minSpread;

  ui.venueList.innerHTML = "";
  for (const venue of marketMeta.venues) {
    const chip = document.createElement("label");
    chip.className = "chip";
    chip.innerHTML = `
      <input type="checkbox" value="${venue.id}" ${state.selectedVenues.has(venue.id) ? "checked" : ""} />
      <span>${venue.label}</span>
    `;
    chip.querySelector("input").addEventListener("change", (event) => {
      if (event.target.checked) {
        state.selectedVenues.add(venue.id);
      } else {
        state.selectedVenues.delete(venue.id);
      }

      previewFilters().catch((error) => {
        setStatus(error.message || "Failed to preview filters.");
      });
    });
    ui.venueList.appendChild(chip);
  }
}

function renderFeed() {
  const feed = state.bootstrap.spreadFeed;
  const items = feed.items || [];

  ui.spreadTableBody.innerHTML = "";

  if (!items.length) {
    ui.spreadTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="muted">No routes match the current filters.</td>
      </tr>
    `;
    return;
  }

  for (const spread of items) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${spread.asset}/${spread.fiat}</td>
      <td>${spread.buyVenueLabel}<br /><span class="muted">${spread.buyRate}</span></td>
      <td>${spread.sellVenueLabel}<br /><span class="muted">${spread.sellRate}</span></td>
      <td><span class="spread-pill">${spread.spreadPct}%</span></td>
      <td>${spread.estimatedProfitPer1000}</td>
      <td>${spread.minOrder} - ${spread.maxOrder}</td>
    `;
    ui.spreadTableBody.appendChild(row);
  }
}

function renderTiers() {
  const isPro = state.bootstrap.user.plan === "pro";
  ui.tierList.innerHTML = "";

  for (const tier of state.bootstrap.tiers) {
    const card = document.createElement("article");
    card.className = "tier-card";
    card.innerHTML = `
      <h3>${tier.label}</h3>
      <p>${tier.description}</p>
      <span class="tier-price">${tier.stars} Stars</span>
      <button data-tier="${tier.id}" ${isPro ? "disabled" : ""}>
        ${isPro ? "Active plan" : "Unlock"}
      </button>
    `;

    card.querySelector("button").addEventListener("click", () => buyTier(tier.id));
    ui.tierList.appendChild(card);
  }
}

function renderMeta() {
  const { spreadFeed, user } = state.bootstrap;
  const items = spreadFeed.items || [];
  const best = items[0];

  ui.visibleCount.textContent = String(items.length);
  ui.bestSpread.textContent = best ? `${best.spreadPct}%` : "0%";
  ui.refreshAt.textContent = formatDate(
    spreadFeed.mode === "realtime"
      ? spreadFeed.lastFullRefreshAt
      : spreadFeed.lastPublicRefreshAt
  );

  ui.planBadge.textContent = user.plan === "pro" ? "Pro" : "Free";
  ui.feedModeBadge.textContent =
    spreadFeed.mode === "realtime" ? "Live 30s" : "Free 5m";
  ui.feedHint.textContent =
    spreadFeed.mode === "realtime"
      ? "Full feed with real-time updates."
      : "Free mode shows only the delayed top-3.";

  ui.writeAccessNotice.textContent = user.canReceiveMessages
    ? "DM alerts are enabled for this user."
    : "Grant write access so the bot can deliver alert messages in DM.";
}

async function saveSettings() {
  const payload = {
    initData: state.initData,
    ...getActiveFilters(),
    alertsEnabled: true
  };

  const response = await fetchJson("/api/settings", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  state.session.user = response.user;
  state.activeFilters = userSettingsToFilters(response.user.settings);
  state.selectedVenues = new Set(response.user.settings.venues || []);
  setStatus("Settings saved.");
  await loadBootstrap();
}

async function buyTier(tierId) {
  const response = await fetchJson("/api/payments/create-invoice", {
    method: "POST",
    body: JSON.stringify({
      initData: state.initData,
      tierId
    })
  });

  if (!tg?.openInvoice) {
    window.open(response.url, "_blank", "noopener,noreferrer");
    setStatus("Invoice link opened in browser.");
    return;
  }

  tg.openInvoice(response.url, async (status) => {
    setStatus(`Invoice status: ${status}`);
    if (status === "paid") {
      await loadSession();
      await loadBootstrap();
    }
  });
}

function requestWriteAccess() {
  if (!tg?.requestWriteAccess) {
    setStatus("Write access request is available only inside Telegram.");
    return;
  }

  tg.requestWriteAccess((allowed) => {
    setStatus(allowed ? "Write access granted." : "Write access denied.");
  });
}

function populateSelect(select, values, selectedValue) {
  select.innerHTML = values
    .map(
      (value) =>
        `<option value="${value}" ${value === selectedValue ? "selected" : ""}>${value}</option>`
    )
    .join("");
}

function buildQuery(params) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  return search.toString();
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "content-type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "Request failed.");
  }

  return payload;
}

function setStatus(message) {
  ui.statusBar.textContent = message;
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function startAutoRefresh() {
  setInterval(async () => {
    try {
      await loadBootstrap();
    } catch (error) {
      setStatus(error.message || "Auto refresh failed.");
    }
  }, 30000);
}

async function previewFilters() {
  state.activeFilters = getActiveFilters();
  await loadBootstrap();
  setStatus("Feed preview updated. Save to apply these filters to alerts.");
}

function getActiveFilters() {
  const hasControls = ui.assetSelect.options.length > 0;

  if (!hasControls) {
    return {
      asset: state.session?.user?.settings?.asset || "ALL",
      fiat: state.session?.user?.settings?.fiat || "ALL",
      minSpread: state.session?.user?.settings?.minSpread || 0,
      venues: (state.session?.user?.settings?.venues || []).join(",")
    };
  }

  return {
    asset: ui.assetSelect.value || "ALL",
    fiat: ui.fiatSelect.value || "ALL",
    minSpread: Number(ui.minSpreadInput.value || 0),
    venues: [...state.selectedVenues].join(",")
  };
}

function userSettingsToFilters(settings) {
  return {
    asset: settings?.asset || "ALL",
    fiat: settings?.fiat || "ALL",
    minSpread: Number(settings?.minSpread || 0),
    venues: (settings?.venues || []).join(",")
  };
}
