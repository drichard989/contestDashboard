(() => {
  "use strict";

  const CFG = window.CIRCA_CONFIG || {};
  const STORAGE_KEY = "circa-picks-dashboard:v1";
  const FONT_SCALE_KEY = "circa-picks-dashboard:font-scale";
  const FONT_SCALE_LEVELS = [0.92, 1, 1.08, 1.16, 1.24, 1.32];
  const DEFAULT_FONT_SCALE = typeof window.matchMedia === "function" && window.matchMedia("(min-width: 761px)").matches ? 1.08 : 1;
  const DEFAULT_SEASON_TYPE = 2;
  const FALLBACK_PLAYERS = [
    { id: "michael-daniel", name: "Michael-Daniel" },
    { id: "rob", name: "Rob" },
    { id: "ken", name: "Ken" },
    { id: "ryan", name: "Ryan" }
  ];
  const PLAYER_DEFINITIONS = (Array.isArray(CFG.players) && CFG.players.length ? CFG.players : FALLBACK_PLAYERS)
    .map((player, index) => ({
      id: String(player?.id || `player-${index + 1}`).trim(),
      name: String(player?.name || `Player ${index + 1}`).trim()
    }))
    .filter((player, index, players) => player.id && player.name && players.findIndex(item => item.id === player.id) === index);

  // ESPN abbreviations plus the common names people tend to paste into a card.
  const TEAMS = [
    ["ARI", "Arizona Cardinals", ["cardinals", "arizona"]],
    ["ATL", "Atlanta Falcons", ["falcons", "atlanta"]],
    ["BAL", "Baltimore Ravens", ["ravens", "baltimore"]],
    ["BUF", "Buffalo Bills", ["bills", "buffalo"]],
    ["CAR", "Carolina Panthers", ["panthers", "carolina"]],
    ["CHI", "Chicago Bears", ["bears", "chicago"]],
    ["CIN", "Cincinnati Bengals", ["bengals", "cincinnati"]],
    ["CLE", "Cleveland Browns", ["browns", "cleveland"]],
    ["DAL", "Dallas Cowboys", ["cowboys", "dallas"]],
    ["DEN", "Denver Broncos", ["broncos", "denver"]],
    ["DET", "Detroit Lions", ["lions", "detroit"]],
    ["GB", "Green Bay Packers", ["packers", "green bay", "g.b."]],
    ["HOU", "Houston Texans", ["texans", "houston"]],
    ["IND", "Indianapolis Colts", ["colts", "indianapolis"]],
    ["JAX", "Jacksonville Jaguars", ["jaguars", "jacksonville", "jags", "jac"]],
    ["KC", "Kansas City Chiefs", ["chiefs", "kansas city"]],
    ["LV", "Las Vegas Raiders", ["raiders", "las vegas", "oakland", "oak"]],
    ["LAC", "Los Angeles Chargers", ["chargers", "la chargers"]],
    ["LAR", "Los Angeles Rams", ["rams", "la rams"]],
    ["MIA", "Miami Dolphins", ["dolphins", "miami"]],
    ["MIN", "Minnesota Vikings", ["vikings", "minnesota"]],
    ["NE", "New England Patriots", ["patriots", "new england", "pats", "nwe"]],
    ["NO", "New Orleans Saints", ["saints", "new orleans"]],
    ["NYG", "New York Giants", ["giants", "ny giants"]],
    ["NYJ", "New York Jets", ["jets", "ny jets"]],
    ["PHI", "Philadelphia Eagles", ["eagles", "philadelphia", "philly"]],
    ["PIT", "Pittsburgh Steelers", ["steelers", "pittsburgh"]],
    ["SEA", "Seattle Seahawks", ["seahawks", "seattle"]],
    ["SF", "San Francisco 49ers", ["49ers", "niners", "san francisco", "sfo"]],
    ["TB", "Tampa Bay Buccaneers", ["buccaneers", "bucs", "tampa bay", "tampa", "tam"]],
    ["TEN", "Tennessee Titans", ["titans", "tennessee"]],
    ["WSH", "Washington Commanders", ["commanders", "washington", "wsh", "was"]]
  ];

  const aliasMap = new Map();
  for (const [abbr, full, aliases] of TEAMS) {
    [abbr, full, ...aliases].forEach(alias => {
      aliasMap.set(normalize(alias), { abbr, full });
    });
  }

  const els = {
    entryEditors: document.getElementById("entryEditors"),
    playerTabs: document.getElementById("playerTabs"),
    viewTabs: document.getElementById("viewTabs"),
    entriesView: document.getElementById("entriesView"),
    picksView: document.getElementById("picksView"),
    activePlayerLabel: document.getElementById("activePlayerLabel"),
    activePlayerName: document.getElementById("activePlayerName"),
    picksPlayerName: document.getElementById("picksPlayerName"),
    entryCards: document.getElementById("entryCards"),
    picksBody: document.getElementById("picksBody"),
    entryRecords: document.getElementById("entryRecords"),
    allPicksPresetBtn: document.getElementById("allPicksPresetBtn"),
    decreaseFontBtn: document.getElementById("decreaseFontBtn"),
    increaseFontBtn: document.getElementById("increaseFontBtn"),
    fontSizeValue: document.getElementById("fontSizeValue"),
    lastUpdated: document.getElementById("lastUpdated"),
    refreshBtn: document.getElementById("refreshBtn"),
    saveBtn: document.getElementById("saveBtn"),
    saveStatus: document.getElementById("saveStatus"),
    addEntryBtn: document.getElementById("addEntryBtn"),
    clearFiltersBtn: document.getElementById("clearFiltersBtn"),
    statusBanner: document.getElementById("statusBanner"),
    seasonInput: document.getElementById("seasonInput"),
    seasonTypeInput: document.getElementById("seasonTypeInput"),
    weekInput: document.getElementById("weekInput")
  };

  let state = loadState();
  let scoreboard = null;
  let lastSuccessfulUpdate = null;
  let refreshTimer = null;
  let refreshInFlight = false;
  let fontScale = loadFontScale();

  function loadFontScale() {
    try {
      const stored = Number(window.localStorage.getItem(FONT_SCALE_KEY));
      return FONT_SCALE_LEVELS.includes(stored) ? stored : DEFAULT_FONT_SCALE;
    } catch (_) {
      return DEFAULT_FONT_SCALE;
    }
  }

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[’']/g, "")
      .replace(/[.\-_]/g, " ")
      .replace(/\s+/g, " ");
  }

  function defaultState() {
    const starterEntries = Array.isArray(CFG.starterEntries) ? CFG.starterEntries : [];
    return {
      players: PLAYER_DEFINITIONS.map((player, index) => ({
        ...player,
        entries: index === 0 && starterEntries.length
          ? starterEntries.map(normalizeEntry)
          : [{ name: "Entry 1", picks: [] }]
      })),
      activePlayerId: PLAYER_DEFINITIONS[0]?.id || "michael-daniel",
      activeView: "entries",
      season: validSeason(CFG.defaultSeason),
      seasonType: validSeasonType(CFG.defaultSeasonType),
      week: validWeek(CFG.defaultWeek)
    };
  }

  function normalizeEntry(entry, index) {
    const picks = Array.isArray(entry?.picks)
      ? entry.picks.map(value => String(value ?? "").trim()).filter(Boolean)
      : [];
    return {
      name: String(entry?.name || `Entry ${index + 1}`).trim() || `Entry ${index + 1}`,
      picks
    };
  }

  function normalizeEntries(entries) {
    const normalized = Array.isArray(entries) ? entries.map(normalizeEntry) : [];
    return normalized.length ? normalized : [{ name: "Entry 1", picks: [] }];
  }

  function allPicksPreset() {
    return Array.isArray(CFG.allPicksPreset)
      ? CFG.allPicksPreset.map(normalizeEntry)
      : [];
  }

  function playerForDeepLink(value) {
    const requested = normalize(value);
    if (!requested) return null;
    return state.players.find(player => (
      player.id === value ||
      normalize(player.id) === requested ||
      normalize(player.name) === requested
    )) || null;
  }

  function applyDeepLink() {
    const params = new URLSearchParams(window.location.search);
    const presetRequested = ["all-picks", "all-games"].includes(params.get("preset"));
    const linkedPlayer = playerForDeepLink(params.get("player"));
    if (!presetRequested && !linkedPlayer) {
      return { playerSelected: false, presetLoaded: false };
    }

    const player = linkedPlayer || state.players[0];
    if (!player) return { playerSelected: false, presetLoaded: false };
    state.activePlayerId = player.id;

    if (!presetRequested) {
      saveState();
      return { playerSelected: true, presetLoaded: false };
    }

    const preset = allPicksPreset();
    if (!preset.length) return { playerSelected: true, presetLoaded: false };

    player.entries = preset.map((entry, index) => normalizeEntry(entry, index));
    state.activeView = "picks";
    saveState();
    return { playerSelected: true, presetLoaded: true };
  }

  function validSeason(value) {
    if (value === "" || value == null) return "";
    const number = Number(value);
    return Number.isInteger(number) && number >= 2020 && number <= 2100 ? number : "";
  }

  function validWeek(value) {
    if (value === "" || value == null) return "";
    const number = Number(value);
    return Number.isInteger(number) && number >= 1 && number <= 22 ? number : "";
  }

  function validSeasonType(value) {
    const number = Number(value);
    return [1, 2, 3].includes(number) ? number : DEFAULT_SEASON_TYPE;
  }

  function normalizeState(value) {
    const fallback = defaultState();
    if (!value || typeof value !== "object") return fallback;

    const storedPlayers = Array.isArray(value.players) ? value.players : [];
    const legacyEntries = Array.isArray(value.entries) ? value.entries : null;
    const players = PLAYER_DEFINITIONS.map((definition, index) => {
      const stored = storedPlayers.find(player => (
        String(player?.id || "") === definition.id || normalize(player?.name) === normalize(definition.name)
      ));
      const entries = stored?.entries ?? (!storedPlayers.length && index === 0 ? legacyEntries : null);
      return { ...definition, entries: normalizeEntries(entries) };
    });
    const activePlayerId = players.some(player => player.id === value.activePlayerId)
      ? value.activePlayerId
      : players[0]?.id;
    const activeView = ["entries", "picks"].includes(value.activeView)
      ? value.activeView
      : "entries";

    return {
      players,
      activePlayerId,
      activeView,
      season: validSeason(value.season),
      seasonType: validSeasonType(value.seasonType),
      week: validWeek(value.week)
    };
  }

  function loadState() {
    try {
      const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
      if (stored) return normalizeState(stored);
    } catch (_) {
      // Private browsing and blocked storage should not stop the dashboard.
    }
    return defaultState();
  }

  function saveState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  function activePlayer() {
    return state.players.find(player => player.id === state.activePlayerId) || state.players[0];
  }

  function parsePick(line) {
    const raw = String(line || "").trim();
    if (!raw) return null;

    const pickEm = raw.match(/^(.*?)\s+(?:pk|pick(?:['’]?em)?)\s*$/i);
    if (pickEm) {
      const teamText = pickEm[1].trim();
      const team = aliasMap.get(normalize(teamText));
      return team
        ? { raw, team, spread: 0 }
        : { raw, error: `Unknown team: ${teamText}` };
    }

    // Accept -3, +3, -3.5, +½, -3½, and their pick-card equivalents.
    const spreadMatch = raw.match(/^(.*?)\s*([+-])\s*(\d+(?:\.5|½)?|\.5|½)\s*$/);
    if (!spreadMatch) {
      return { raw, error: "Use format like Bears -3 or Texans +0.5" };
    }

    const teamText = spreadMatch[1].trim();
    const token = spreadMatch[3];
    const sign = spreadMatch[2] === "-" ? -1 : 1;
    const magnitude = token === "½" || token === ".5"
      ? 0.5
      : token.endsWith("½")
        ? Number(token.slice(0, -1)) + 0.5
        : Number(token);
    const team = aliasMap.get(normalize(teamText));

    if (!team) return { raw, error: `Unknown team: ${teamText}` };
    if (!Number.isFinite(magnitude)) return { raw, error: "Spread must be a whole number or half point" };
    return { raw, team, spread: sign * magnitude };
  }

  function formatSpread(value) {
    const number = Object.is(value, -0) ? 0 : Number(value);
    if (number === 0) return "PK";
    return `${number > 0 ? "+" : ""}${Number.isInteger(number) ? number : number.toFixed(1)}`;
  }

  function formatMargin(value) {
    if (value == null) return "—";
    if (value === 0) return "0";
    return `${value > 0 ? "+" : ""}${Number.isInteger(value) ? value : value.toFixed(1)}`;
  }

  function shortTeamName(value) {
    const fullName = typeof value === "string" ? value : value?.full || value?.name || "";
    const words = String(fullName).trim().split(/\s+/).filter(Boolean);
    return words[words.length - 1] || String(fullName).trim();
  }

  function pickLabel(pick) {
    return pick.error ? pick.raw : `${shortTeamName(pick.team)} ${formatSpread(pick.spread)}`;
  }

  function pickIdentity(pick) {
    return pick.error ? `error:${pick.raw}` : `${pick.team.abbr}:${pick.spread}`;
  }

  function syncStateFromEditors() {
    const entries = [...els.entryEditors.querySelectorAll(".entry-editor")].map((wrap, index) => ({
      name: wrap.querySelector(".entry-name")?.value.trim() || `Entry ${index + 1}`,
      picks: (wrap.querySelector(".entry-picks")?.value || "")
        .split("\n")
        .map(value => value.trim())
        .filter(Boolean)
    }));

    const player = activePlayer();
    if (player) player.entries = normalizeEntries(entries);
    state.season = validSeason(els.seasonInput.value);
    state.seasonType = validSeasonType(els.seasonTypeInput.value);
    state.week = validWeek(els.weekInput.value);
  }

  function updateActivePlayerLabels() {
    const player = activePlayer();
    const name = player?.name || "Player";
    els.activePlayerLabel.textContent = name;
    els.activePlayerName.textContent = name;
    els.picksPlayerName.textContent = name;
  }

  function renderPlayerTabs() {
    els.playerTabs.innerHTML = state.players.map(player => `
      <button
        id="player-tab-${escapeHtml(player.id)}"
        class="player-tab${player.id === state.activePlayerId ? " active" : ""}"
        type="button"
        role="tab"
        data-player="${escapeHtml(player.id)}"
        aria-selected="${player.id === state.activePlayerId}"
        aria-controls="dashboardContent"
        tabindex="${player.id === state.activePlayerId ? "0" : "-1"}">
        ${escapeHtml(player.name)}
      </button>
    `).join("");
    updateActivePlayerLabels();
  }

  function renderViewTabs() {
    const views = [
      ["entries", "Entries"],
      ["picks", "All picks"]
    ];
    els.viewTabs.innerHTML = views.map(([id, label]) => `
      <button
        class="view-tab${state.activeView === id ? " active" : ""}"
        type="button"
        role="tab"
        data-view="${id}"
        aria-selected="${state.activeView === id}"
        aria-controls="${id}View"
        tabindex="${state.activeView === id ? "0" : "-1"}">
        ${label}
      </button>
    `).join("");
    els.entriesView.classList.toggle("hidden", state.activeView !== "entries");
    els.picksView.classList.toggle("hidden", state.activeView !== "picks");
  }

  function renderEditors() {
    els.entryEditors.innerHTML = "";
    const player = activePlayer();
    const entries = player?.entries || [{ name: "Entry 1", picks: [] }];

    entries.forEach((entry, index) => {
      const wrap = document.createElement("div");
      wrap.className = "entry-editor";
      wrap.innerHTML = `
        <div class="editor-head">
          <label class="editor-name-label" for="entry-name-${index}">Entry name</label>
          <button class="danger remove-entry" data-entry="${index}" type="button" ${entries.length === 1 ? "disabled" : ""}>Remove</button>
        </div>
        <input id="entry-name-${index}" class="entry-name" data-entry="${index}" value="${escapeHtml(entry.name)}" aria-label="Entry ${index + 1} name">
        <label class="editor-picks-label" for="entry-picks-${index}">Picks</label>
        <textarea id="entry-picks-${index}" data-entry="${index}" class="entry-picks" spellcheck="false" aria-label="Picks for ${escapeHtml(entry.name)}" placeholder="Bears -3\nBroncos +3">${escapeHtml(entry.picks.join("\n"))}</textarea>
        <p class="editor-hint">Team + line, e.g. Bears -3.5 or Bears -3½</p>
      `;
      els.entryEditors.appendChild(wrap);
    });

    els.seasonInput.value = state.season === "" ? "" : String(state.season);
    els.seasonTypeInput.value = String(state.seasonType);
    els.weekInput.value = state.week === "" ? "" : String(state.week);
  }

  function buildScoreboardUrl() {
    const base = CFG.espnScoreboardBase || "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard";
    const url = new URL(base, window.location.href);
    const hasSeason = state.season !== "";
    const hasWeek = state.week !== "";
    const hasSeasonTypeOverride = state.seasonType !== DEFAULT_SEASON_TYPE;

    // ESPN uses `dates=YYYY` for a season-wide scoreboard query.
    if (hasSeason) url.searchParams.set("dates", String(state.season));
    if (hasWeek) url.searchParams.set("week", String(state.week));
    if (hasSeason || hasWeek || hasSeasonTypeOverride) {
      url.searchParams.set("seasontype", String(state.seasonType));
    }
    return url.toString();
  }

  function provider() {
    const providers = window.CIRCA_PROVIDERS || {};
    return providers[CFG.scoreProvider || "espn"];
  }

  async function refreshScores() {
    if (refreshInFlight) return;
    refreshInFlight = true;
    syncStateFromEditors();
    els.refreshBtn.disabled = true;
    els.refreshBtn.textContent = "Refreshing…";
    setBanner("Refreshing live scores…", "info");

    const controller = new AbortController();
    const timeoutMs = Number(CFG.requestTimeoutMs) > 0 ? Number(CFG.requestTimeoutMs) : 12000;
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const scoreProvider = provider();
      if (!scoreProvider?.getScoreboard) throw new Error("Score provider is not available");

      const result = await scoreProvider.getScoreboard({
        url: buildScoreboardUrl(),
        signal: controller.signal
      });
      if (!result || !Array.isArray(result.games)) {
        throw new Error("Score provider returned an invalid games list");
      }
      scoreboard = result;
      lastSuccessfulUpdate = new Date();
      updateLastUpdated();

      if (!result.games.length) {
        setBanner("Scores updated, but no games were returned for the selected filters.", "info");
      } else if (result.skippedEvents) {
        setBanner(`Scores updated. ${result.skippedEvents} game could not be read.`, "info");
      } else {
        setBanner("", null);
      }
      safeRender();
    } catch (error) {
      console.error(error);
      const detail = error?.name === "AbortError"
        ? "The request timed out."
        : error?.message || "The score service was unavailable.";
      setBanner(`Could not refresh live scores. Your saved picks are safe. ${detail}`, "error");
      safeRender();
    } finally {
      window.clearTimeout(timeout);
      refreshInFlight = false;
      els.refreshBtn.disabled = false;
      els.refreshBtn.textContent = "Refresh scores";
    }
  }

  function updateLastUpdated() {
    els.lastUpdated.textContent = lastSuccessfulUpdate
      ? `Last successful update ${lastSuccessfulUpdate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })}`
      : "Waiting for first update";
  }

  function setBanner(text, kind) {
    els.statusBanner.textContent = text || "";
    els.statusBanner.classList.toggle("hidden", !text);
    els.statusBanner.classList.toggle("info", Boolean(text) && kind === "info");
    els.statusBanner.classList.toggle("error", Boolean(text) && kind === "error");
  }

  function setSaveStatus(text, kind) {
    els.saveStatus.textContent = text || "";
    els.saveStatus.className = `save-status${kind ? ` ${kind}` : ""}`;
  }

  function applyFontScale() {
    document.documentElement.style.setProperty("--font-scale", `${Math.round(fontScale * 100)}%`);
    const levelIndex = FONT_SCALE_LEVELS.indexOf(fontScale);
    els.decreaseFontBtn.disabled = levelIndex <= 0;
    els.increaseFontBtn.disabled = levelIndex >= FONT_SCALE_LEVELS.length - 1;
    els.fontSizeValue.textContent = `Text size ${Math.round(fontScale * 100)}%`;
  }

  function adjustFontScale(direction) {
    const currentIndex = FONT_SCALE_LEVELS.indexOf(fontScale);
    const nextIndex = Math.max(0, Math.min(FONT_SCALE_LEVELS.length - 1, currentIndex + direction));
    if (nextIndex === currentIndex) return;

    fontScale = FONT_SCALE_LEVELS[nextIndex];
    try {
      window.localStorage.setItem(FONT_SCALE_KEY, String(fontScale));
    } catch (_) {
      // The visual adjustment still works when browser storage is unavailable.
    }
    applyFontScale();
  }

  function getGames() {
    return Array.isArray(scoreboard?.games) ? scoreboard.games : [];
  }

  function createGradeContext() {
    const gamesByTeam = new Map();
    for (const game of getGames()) {
      [game.home, game.away].forEach(team => {
        if (team?.abbr && !gamesByTeam.has(team.abbr)) gamesByTeam.set(team.abbr, game);
      });
    }

    const grades = new Map();
    return {
      grade(pick) {
        const key = pick.error ? `error:${pick.raw}` : `${pick.team.abbr}:${pick.spread}`;
        if (!grades.has(key)) grades.set(key, gradePick(pick, gamesByTeam));
        return grades.get(key);
      }
    };
  }

  function gradePick(pick, gamesByTeam) {
    if (pick.error) {
      return { status: "pending", label: "INPUT ERROR", detail: pick.error, margin: null };
    }

    if (!scoreboard) {
      return {
        status: "pending",
        label: "WAITING",
        detail: "Waiting for the first score update",
        margin: null
      };
    }

    const sourceGame = gamesByTeam.get(pick.team.abbr);
    if (!sourceGame) {
      return {
        status: "pending",
        label: "NOT FOUND",
        detail: "No matching game on the loaded scoreboard",
        margin: null
      };
    }

    const selected = sourceGame.home.abbr === pick.team.abbr ? sourceGame.home : sourceGame.away;
    const opponent = selected === sourceGame.home ? sourceGame.away : sourceGame.home;
    const game = {
      ...sourceGame,
      selectedAbbr: selected.abbr,
      selectedName: selected.name,
      selectedScore: selected.score,
      opponentAbbr: opponent.abbr,
      opponentName: opponent.name,
      opponentScore: opponent.score
    };

    if (game.isCanceled) {
      return { status: "pending", label: "CANCELED", detail: game.statusText, margin: null, game };
    }
    if (game.isPostponed) {
      return { status: "pending", label: "POSTPONED", detail: game.statusText, margin: null, game };
    }
    if (game.state === "pre") {
      return { status: "pending", label: "PENDING", detail: kickoffText(game), margin: null, game };
    }

    const margin = (game.selectedScore + pick.spread) - game.opponentScore;
    const status = margin > 0 ? "cover" : margin < 0 ? "lose" : "push";
    const label = game.state === "post"
      ? status === "cover" ? "WIN" : status === "lose" ? "LOSS" : "PUSH"
      : status === "cover" ? "COVERING" : status === "lose" ? "LOSING" : "PUSH";

    return { status, label, detail: gameStatusText(game), margin, game };
  }

  function kickoffText(game) {
    const date = game?.startTime ? new Date(game.startTime) : null;
    if (!date || Number.isNaN(date.getTime())) return game?.statusText || "Scheduled";
    return new Intl.DateTimeFormat([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }).format(date);
  }

  function pendingTimeText(game) {
    if (!game) return "";
    if (game.isCanceled || game.isPostponed) return game.statusText || "Unavailable";

    const startTime = game.startTime ? new Date(game.startTime).getTime() : NaN;
    if (!Number.isFinite(startTime)) return "";

    const remainingMinutes = Math.ceil((startTime - Date.now()) / 60000);
    if (remainingMinutes <= 0) return "starting soon";
    if (remainingMinutes < 60) return `starts in ${remainingMinutes}m`;

    const hours = Math.floor(remainingMinutes / 60);
    const minutes = remainingMinutes % 60;
    if (hours < 24) return `starts in ${hours}h${minutes ? ` ${minutes}m` : ""}`;

    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `starts in ${days}d${remainingHours ? ` ${remainingHours}h` : ""}`;
  }

  function liveTimeText(game) {
    if (!game || game.state !== "in") return "";

    const status = String(game.statusText || "");
    if (/half|intermission|delay/i.test(status)) return status;
    if (game.clock) {
      const period = game.period > 4 ? "OT" : game.period ? `Q${game.period}` : "";
      return `${period ? `${period} ` : ""}${game.clock} left`;
    }
    return status || "In progress";
  }

  function livePickDetail(pick, game) {
    const time = liveTimeText(game);
    return time ? `${pickLabel(pick)} · ${time}` : pickLabel(pick);
  }

  function gameStatusText(game) {
    if (game?.state === "post") return "Final";
    if (game?.period) {
      const period = game.period > 4 ? "OT" : `Q${game.period}`;
      return `${period}${game.clock ? ` ${game.clock}` : ""}`;
    }
    return game?.statusText || "In progress";
  }

  function scoreText(grade) {
    const game = grade.game;
    if (!game?.selectedAbbr) return grade.detail || "—";

    const matchup = `${game.selectedAbbr} vs ${game.opponentAbbr}`;
    if (game.isCanceled || game.isPostponed) return `${matchup} · ${game.statusText}`;
    if (game.state === "pre") return `${matchup} · ${kickoffText(game)}`;
    return `${game.selectedAbbr} ${game.selectedScore} – ${game.opponentScore} ${game.opponentAbbr} · ${gameStatusText(game)}`;
  }

  function renderEntryRecords(entryRows) {
    if (!entryRows.length) {
      els.entryRecords.innerHTML = `<p class="empty-records">Add a pick to see its current record.</p>`;
      return;
    }

    els.entryRecords.innerHTML = entryRows.map(({ name, grades }) => {
        const record = { wins: 0, losses: 0, ties: 0, pending: 0 };
        const finishedWinningTeams = [];
        const finishedLosingTeams = [];
        const finishedTiedTeams = [];
        const pendingPicks = [];
        const liveWinningPicks = [];
        const liveLosingPicks = [];
        const liveTiedPicks = [];
        grades.forEach(({ pick, grade }) => {
          if (grade.status === "cover") {
            if (grade.game?.state === "post") {
              record.wins += 1;
              finishedWinningTeams.push(shortTeamName(pick.team));
            }
            else liveWinningPicks.push(livePickDetail(pick, grade.game));
          }
          else if (grade.status === "lose") {
            if (grade.game?.state === "post") {
              record.losses += 1;
              finishedLosingTeams.push(shortTeamName(pick.team));
            }
            else liveLosingPicks.push(livePickDetail(pick, grade.game));
          }
          else if (grade.status === "push") {
            if (grade.game?.state === "post") {
              record.ties += 1;
              finishedTiedTeams.push(shortTeamName(pick.team));
            }
            else liveTiedPicks.push(livePickDetail(pick, grade.game));
          }
          else {
            record.pending += 1;
            pendingPicks.push({ pick, grade });
          }
        });
        const total = grades.length;
        const liveDetail = picks => picks.length
          ? ` <span class="entry-record-detail">(${escapeHtml(picks.join(", "))})</span>`
          : "";
        const solidDetail = teams => teams.length
          ? ` <span class="entry-record-solid-detail">— ${escapeHtml(teams.join(", "))}</span>`
          : "";
        const pendingDetails = pendingPicks.map(({ pick, grade }) => {
          const team = pick.team ? shortTeamName(pick.team) : pick.raw;
          const time = pendingTimeText(grade.game);
          return time ? `${team} · ${time}` : team;
        });
        return `
          <article class="entry-record" role="listitem">
            <strong class="entry-record-name">${escapeHtml(name)}</strong>
            <div class="entry-record-breakdown">
              <span class="entry-record-status won"><strong>Won games ${record.wins}</strong>${solidDetail(finishedWinningTeams)}${liveDetail(liveWinningPicks)}</span>
              <span class="entry-record-status lost"><strong>Lost games ${record.losses}</strong>${solidDetail(finishedLosingTeams)}${liveDetail(liveLosingPicks)}</span>
              <span class="entry-record-status tied"><strong>Tied games ${record.ties}</strong>${solidDetail(finishedTiedTeams)}${liveDetail(liveTiedPicks)}</span>
              <span class="entry-record-status pending"><strong>Pending ${record.pending}</strong>${solidDetail(pendingDetails)}</span>
            </div>
            <span class="entry-record-meta">${total} ${total === 1 ? "pick" : "picks"}</span>
          </article>`;
      })
      .join("");
  }

  function renderDashboard() {
    const context = createGradeContext();
    const player = activePlayer();
    updateActivePlayerLabels();
    const entries = (player?.entries || []).map(entry => ({
      name: entry.name,
      picks: entry.picks.map(parsePick).filter(Boolean)
    }));
    const uniquePicks = new Map();
    const entryRows = [];

    els.entryCards.innerHTML = "";
    for (const entry of entries) {
      const grades = entry.picks.map(pick => ({ pick, grade: context.grade(pick) }));
      const counts = { cover: 0, lose: 0, push: 0, pending: 0 };
      grades.forEach(({ grade }) => counts[grade.status]++);
      grades.forEach(({ pick, grade }) => {
        const key = pickIdentity(pick);
        if (!uniquePicks.has(key)) uniquePicks.set(key, { pick, grade, entryNames: [] });
        const row = uniquePicks.get(key);
        if (!row.entryNames.includes(entry.name)) row.entryNames.push(entry.name);
      });
      entryRows.push({ name: entry.name, grades });

      const card = document.createElement("article");
      card.className = "entry-card";
      card.innerHTML = `
        <div class="entry-card-header">
          <div>
            <p class="eyebrow">Contest entry</p>
            <h3>${escapeHtml(entry.name)}</h3>
          </div>
          <span class="pick-total">${entry.picks.length} ${entry.picks.length === 1 ? "pick" : "picks"}</span>
        </div>
        <div class="entry-summary" aria-label="${counts.cover} covering or winning, ${counts.lose} losing or lost, ${counts.push} pushes, ${counts.pending} pending">
          <span class="count cover">${counts.cover} cover/win</span>
          <span class="count lose">${counts.lose} lose/loss</span>
          <span class="count push">${counts.push} push${counts.push === 1 ? "" : "es"}</span>
          <span class="count pending">${counts.pending} pending</span>
        </div>
        ${grades.length ? `
          <ul class="pick-list">
            ${grades.map(({ pick, grade }) => `
              <li class="pick-row">
                <div class="pick-copy">
                  <div class="pick-main">${escapeHtml(pickLabel(pick))}</div>
                  <div class="pick-sub">${escapeHtml(scoreText(grade))}</div>
                  ${grade.margin != null ? `<div class="pick-margin">ATS margin <strong>${escapeHtml(formatMargin(grade.margin))}</strong></div>` : ""}
                </div>
                <span class="badge ${grade.status}" aria-label="${escapeHtml(grade.label)}">${escapeHtml(grade.label)}</span>
              </li>`).join("")}
          </ul>` : `<p class="empty-entry">No picks yet. Add one pick per line above.</p>`}
      `;
      els.entryCards.appendChild(card);
    }

    renderEntryRecords(entryRows);

    const rows = [...uniquePicks.values()];
    if (!rows.length) {
      els.picksBody.innerHTML = `<tr><td colspan="6" class="empty-table">Add a pick above to see its live status here.</td></tr>`;
      return;
    }

    els.picksBody.innerHTML = rows.map(({ entryNames, pick, grade }) => {
      if (pick.error) {
        return `
          <tr>
            <td>${escapeHtml(entryNames.join(", "))}</td>
            <td><strong>${escapeHtml(pick.raw)}</strong></td>
            <td>—</td>
            <td>${escapeHtml(pick.error)}</td>
            <td><span class="badge pending">INPUT ERROR</span></td>
            <td>—</td>
          </tr>`;
      }

      const game = grade.game;
      const gameText = game?.selectedName
        ? `${shortTeamName(game.selectedName)} vs ${shortTeamName(game.opponentName)}`
        : "Not found";
      return `
        <tr>
          <td>${escapeHtml(entryNames.join(", "))}</td>
          <td><strong>${escapeHtml(pickLabel(pick))}</strong></td>
          <td>${escapeHtml(gameText)}</td>
          <td>${escapeHtml(scoreText(grade))}</td>
          <td><span class="badge ${grade.status}">${escapeHtml(grade.label)}</span></td>
          <td>${escapeHtml(formatMargin(grade.margin))}</td>
        </tr>`;
    }).join("");
  }

  function safeRender() {
    try {
      renderDashboard();
    } catch (error) {
      console.error(error);
      setBanner("The dashboard could not render this score response. Your saved picks are safe.", "error");
    }
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]);
  }

  function selectPlayer(playerId, shouldFocus = false) {
    const player = state.players.find(item => item.id === playerId);
    if (!player) return;

    if (player.id === state.activePlayerId) {
      if (shouldFocus) document.getElementById(`player-tab-${player.id}`)?.focus();
      return;
    }

    // Preserve any in-progress edits before moving to another player's tab.
    syncStateFromEditors();
    state.activePlayerId = player.id;
    const saved = saveState();
    renderPlayerTabs();
    renderEditors();
    safeRender();
    setSaveStatus(saved ? `Viewing ${player.name}` : "Could not save", saved ? "success" : "error");
    if (shouldFocus) document.getElementById(`player-tab-${player.id}`)?.focus();
  }

  function selectView(viewId, shouldFocus = false) {
    if (!["entries", "picks"].includes(viewId)) return;
    if (viewId === state.activeView) {
      if (shouldFocus) document.querySelector(`[data-view="${viewId}"]`)?.focus();
      return;
    }

    syncStateFromEditors();
    state.activeView = viewId;
    const saved = saveState();
    renderViewTabs();
    safeRender();
    setSaveStatus(saved ? (viewId === "picks" ? "Showing all picks" : "Showing entries") : "Could not save", saved ? "success" : "error");
    if (shouldFocus) document.querySelector(`[data-view="${viewId}"]`)?.focus();
  }

  els.playerTabs.addEventListener("click", event => {
    const button = event.target.closest("[role=tab]");
    if (button) selectPlayer(button.dataset.player);
  });

  els.playerTabs.addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const buttons = [...els.playerTabs.querySelectorAll("[role=tab]")];
    const currentIndex = buttons.findIndex(button => button.dataset.player === state.activePlayerId);
    if (currentIndex < 0) return;

    let nextIndex = currentIndex;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % buttons.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = buttons.length - 1;
    event.preventDefault();
    selectPlayer(buttons[nextIndex].dataset.player, true);
  });

  els.viewTabs.addEventListener("click", event => {
    const button = event.target.closest("[role=tab]");
    if (button) selectView(button.dataset.view);
  });

  els.viewTabs.addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const buttons = [...els.viewTabs.querySelectorAll("[role=tab]")];
    const currentIndex = buttons.findIndex(button => button.dataset.view === state.activeView);
    if (currentIndex < 0) return;

    let nextIndex = currentIndex;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % buttons.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = buttons.length - 1;
    event.preventDefault();
    selectView(buttons[nextIndex].dataset.view, true);
  });

  els.addEntryBtn.addEventListener("click", () => {
    syncStateFromEditors();
    const player = activePlayer();
    player.entries.push({ name: `Entry ${player.entries.length + 1}`, picks: [] });
    renderEditors();
    safeRender();
    setSaveStatus("Unsaved changes", "pending");
  });

  els.entryEditors.addEventListener("click", event => {
    const button = event.target.closest(".remove-entry");
    if (!button || button.disabled) return;
    syncStateFromEditors();
    activePlayer().entries.splice(Number(button.dataset.entry), 1);
    renderEditors();
    safeRender();
    setSaveStatus("Unsaved changes", "pending");
  });

  els.entryEditors.addEventListener("input", () => setSaveStatus("Unsaved changes", "pending"));
  [els.seasonInput, els.seasonTypeInput, els.weekInput].forEach(input => {
    input.addEventListener("change", () => setSaveStatus("Unsaved changes", "pending"));
  });

  els.saveBtn.addEventListener("click", async () => {
    syncStateFromEditors();
    const saved = saveState();
    if (!saved) {
      setSaveStatus("Could not save", "error");
      setBanner("Your browser blocked local storage, so these changes may not survive a reload.", "error");
      safeRender();
      return;
    }
    setSaveStatus("Saved locally", "success");
    safeRender();
    await refreshScores();
  });

  els.clearFiltersBtn.addEventListener("click", async () => {
    syncStateFromEditors();
    state.season = "";
    state.seasonType = DEFAULT_SEASON_TYPE;
    state.week = "";
    renderEditors();
    const saved = saveState();
    setSaveStatus(saved ? "Using current scoreboard" : "Could not save", saved ? "success" : "error");
    await refreshScores();
  });

  els.refreshBtn.addEventListener("click", refreshScores);

  els.decreaseFontBtn.addEventListener("click", () => adjustFontScale(-1));
  els.increaseFontBtn.addEventListener("click", () => adjustFontScale(1));

  els.allPicksPresetBtn.addEventListener("click", async () => {
    const preset = allPicksPreset();
    if (!preset.length) {
      setSaveStatus("Preset unavailable", "error");
      setBanner("No all-picks preset is configured yet.", "error");
      return;
    }

    syncStateFromEditors();
    const player = activePlayer();
    player.entries = preset;
    renderEditors();
    const saved = saveState();
    safeRender();
    setSaveStatus(saved ? "All-picks preset loaded" : "Preset loaded for this session", saved ? "success" : "error");
    await refreshScores();
  });

  applyFontScale();
  const deepLinkState = applyDeepLink();
  renderPlayerTabs();
  renderViewTabs();
  renderEditors();
  updateLastUpdated();
  safeRender();
  if (deepLinkState.presetLoaded) setSaveStatus("All-picks preset loaded from link", "success");
  else if (deepLinkState.playerSelected) setSaveStatus(`Viewing ${activePlayer().name}`, "success");
  refreshScores();

  const refreshMs = Number(CFG.refreshMs) > 0 ? Number(CFG.refreshMs) : 10000;
  clearInterval(refreshTimer);
  refreshTimer = window.setInterval(refreshScores, refreshMs);

  window.addEventListener("unhandledrejection", event => {
    console.error(event.reason);
    setBanner("Something unexpected happened. Your saved picks are safe.", "error");
  });
})();
