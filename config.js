/*
  Weekly maintenance lives in this one object. Replace it each week with:
  - the new key, which makes the prior week's local state obsolete;
  - the Circa lines from the weekly picture; and
  - each player's entries and picks for that week.

  Keep picks in the format "Team + line". Player keys use the IDs below.
*/
const CURRENT_WEEK = {
  key: "2026-week-5",
  label: "Week 5",
  season: 2026,
  seasonType: 2,
  week: 5,
  circaMatchups: [
    ["DAL", "TB"],
    ["JAX", "PHI"],
    ["GB", "CHI"],
    ["TEN", "HOU"],
    ["MIA", "CIN"],
    ["NE", "LV"],
    ["NO", "MIN"],
    ["NYJ", "CLE"],
    ["PIT", "IND"],
    ["WSH", "NYG"],
    ["LAC", "DEN"],
    ["ARI", "DET"],
    ["SEA", "SF"],
    ["ATL", "BAL"],
    ["LAR", "BUF"]
  ],
  circaLines: {
    Bucs: 8,
    Cowboys: -8,
    Eagles: 7.5,
    Jaguars: -7.5,
    Colts: 2.5,
    Steelers: -2.5,
    Vikings: -2,
    Saints: 2,
    Browns: 1.5,
    Jets: -1.5,
    Bengals: -7,
    Dolphins: 7,
    Raiders: 3.5,
    Patriots: -3.5,
    Giants: 4,
    Commanders: -4,
    Texans: -7.5,
    Titans: 7.5,
    Broncos: -3.5,
    Chargers: 3.5,
    "49ers": 3,
    Seahawks: -3,
    Lions: -5.5,
    Cardinals: 5.5,
    Bears: -1.5,
    Packers: 1.5,
    Ravens: 3.5,
    Falcons: -3.5,
    Bills: 3,
    Rams: -3
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
