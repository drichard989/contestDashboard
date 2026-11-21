/*
  Weekly maintenance lives in this one object. Replace it each week with:
  - the new key, which makes the prior week's local state obsolete;
  - the Circa lines from the weekly picture; and
  - each player's entries and picks for that week.

  Keep picks in the format "Team + line". Player keys use the IDs below.
*/
const CURRENT_WEEK = {
  key: "2026-week-11",
  label: "Week 11",
  season: 2026,
  seasonType: 2,
  week: 11,
  circaMatchups: [
    ["HOU", "IND"],
    ["BUF", "MIA"],
    ["CHI", "NO"],
    ["DAL", "TEN"],
    ["DET", "TB"],
    ["KC", "ARI"],
    ["PHI", "PIT"],
    ["CAR", "BAL"],
    ["LAC", "NYJ"],
    ["DEN", "LV"],
    ["NYG", "JAX"],
    ["SF", "MIN"],
    ["WSH", "CIN"]
  ],
  circaLines: {
    Colts: 12.5,
    Texans: -12.5,
    Ravens: 3,
    Panthers: -3,
    Bucs: 6.5,
    Lions: -6.5,
    Jaguars: -5.5,
    Giants: 5.5,
    Saints: 11.5,
    Bears: -11.5,
    Cardinals: 16,
    Chiefs: -16,
    Titans: 8,
    Cowboys: -8,
    Dolphins: 16.5,
    Bills: -16.5,
    Jets: 3,
    Chargers: -3,
    Raiders: 10,
    Broncos: -10,
    Steelers: -4.5,
    Eagles: 4.5,
    Vikings: 3,
    "49ers": -3,
    Bengals: -6.5,
    Commanders: 6.5
  },
  playerEntries: {
    "michael-daniel": [
      {
        name: "Entry 1",
        picks: [
          "Panthers -3",
          "Lions -6.5",
          "Steelers -4.5",
          "Jaguars -5.5",
          "Bengals -6.5"
        ]
      },
      {
        name: "Entry 2",
        picks: [
          "Panthers -3",
          "Lions -6.5",
          "Steelers -4.5",
          "Jaguars -5.5",
          "Bengals -6.5"
        ]
      }
    ]
  }
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
