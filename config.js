/*
  Weekly maintenance lives in this one object. Replace it each week with:
  - the new key, which makes the prior week's local state obsolete;
  - the Circa lines from the weekly picture; and
  - each player's entries and picks for that week.

  Keep picks in the format "Team + line". Player keys use the IDs below.
*/
const CURRENT_WEEK = {
  key: "2026-week-6",
  label: "Week 6",
  season: 2026,
  seasonType: 2,
  week: 6,
  circaMatchups: [
    ["ATL", "CHI"],
    ["CLE", "BAL"],
    ["IND", "TEN"],
    ["NE", "NYJ"],
    ["NYG", "NO"],
    ["PHI", "CAR"],
    ["TB", "PIT"],
    ["JAX", "HOU"],
    ["LAR", "ARI"],
    ["KC", "LAC"],
    ["LV", "BUF"],
    ["GB", "DAL"],
    ["DEN", "SEA"],
    ["SF", "WSH"]
  ],
  circaLines: {
    Seahawks: -2.5,
    Broncos: 2.5,
    Texans: 2.5,
    Jaguars: -2.5,
    Jets: 7,
    Patriots: -7,
    Steelers: -2.5,
    Bucs: 2.5,
    Ravens: -5.5,
    Browns: 5.5,
    Bears: 0,
    Falcons: 0,
    Titans: 7,
    Colts: -7,
    Panthers: -1,
    Eagles: 1,
    Saints: -1,
    Giants: 1,
    Cardinals: 12.5,
    Rams: -12.5,
    Bills: -4.5,
    Raiders: 4.5,
    Chargers: 8,
    Chiefs: -8,
    Cowboys: 1,
    Packers: -1,
    Commanders: 7.5,
    "49ers": -7.5
  },
  playerEntries: {}
};

const ALL_PICKS_PRESET = CURRENT_WEEK.playerEntries["michael-daniel"] || [];
const PLAYER_PRESETS = Object.fromEntries(
  Object.entries(CURRENT_WEEK.playerEntries)
    .filter(([playerId]) => playerId !== "michael-daniel")
);

window.CIRCA_CONFIG = {
  // Change CURRENT_WEEK.key when replacing the weekly entries.
  weekKey: CURRENT_WEEK.key,
  weeklyLabel: CURRENT_WEEK.label,
  defaultSeason: CURRENT_WEEK.season,
  defaultSeasonType: CURRENT_WEEK.seasonType,
  defaultWeek: CURRENT_WEEK.week,
  circaMatchups: CURRENT_WEEK.circaMatchups,
  circaLines: CURRENT_WEEK.circaLines,

  // Refresh live scores every 10 seconds.
  refreshMs: 10000,

  // Keep provider-specific fetch and JSON normalization outside the dashboard UI.
  scoreProvider: "espn",

  // Avoid leaving the refresh button waiting forever if the endpoint is unavailable.
  requestTimeoutMs: 12000,

  // Player tabs. Each player's entries and picks are configured independently.
  players: [
    { id: "michael-daniel", name: "Michael-Daniel" },
    { id: "rob", name: "Rob" },
    { id: "ken", name: "Ken" },
    { id: "ryan", name: "Ryan" },
    { id: "andy", name: "Andy" }
  ],

  // Unofficial / unsupported ESPN endpoint. No API key is currently required.
  // See README.md and CODEX_HANDOFF.md for caveats and fallback strategy.
  espnScoreboardBase:
    "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard",

  // These are derived from CURRENT_WEEK above.
  allPicksPreset: ALL_PICKS_PRESET,
  playerPresets: PLAYER_PRESETS,
  starterEntries: ALL_PICKS_PRESET
};
