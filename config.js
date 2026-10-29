/*
  Weekly maintenance lives in this one object. Replace it each week with:
  - the new key, which makes the prior week's local state obsolete;
  - the Circa lines from the weekly picture; and
  - each player's entries and picks for that week.

  Keep picks in the format "Team + line". Player keys use the IDs below.
*/
const CURRENT_WEEK = {
  key: "2026-week-8",
  label: "Week 8",
  season: 2026,
  seasonType: 2,
  week: 8,
  circaMatchups: [
    ["GB", "CAR"],
    ["BUF", "BAL"],
    ["CIN", "TEN"],
    ["DAL", "ARI"],
    ["DET", "MIN"],
    ["NYJ", "LV"],
    ["PIT", "CLE"],
    ["TB", "ATL"],
    ["JAX", "IND"],
    ["LAR", "LAC"],
    ["DEN", "KC"],
    ["MIA", "NE"],
    ["WSH", "PHI"],
    ["SEA", "CHI"]
  ],
  circaLines: {
    Panthers: 3.5,
    Packers: -3.5,
    Vikings: 3.5,
    Lions: -3.5,
    Raiders: 1.5,
    Jets: -1.5,
    Cardinals: 7,
    Cowboys: -7,
    Falcons: 2.5,
    Bucs: -2.5,
    Ravens: 3,
    Bills: -3,
    Colts: 10,
    Jaguars: -10,
    Titans: 12.5,
    Bengals: -12.5,
    Browns: 3,
    Steelers: -3,
    Chargers: 6.5,
    Rams: -6.5,
    Chiefs: -1.5,
    Broncos: 1.5,
    Patriots: -7,
    Dolphins: 7,
    Eagles: 6,
    Commanders: -6,
    Bears: 3,
    Seahawks: -3
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
