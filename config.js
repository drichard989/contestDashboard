/*
  Weekly maintenance lives in this one object. Replace it each week with:
  - the new key, which discards saved entries from the prior week;
  - the Circa lines from the weekly picture; and
  - each player's entries and picks for that week.

  Keep picks in the format "Team + line". Player keys use the IDs below.
*/
const CURRENT_WEEK = {
  key: "2026-week-1",
  label: "Week 1",
  circaLines: {
    Patriots: 3,
    Seahawks: -3,
    "49ers": 4,
    Rams: -4,
    Browns: 8.5,
    Jaguars: -8.5,
    Bucs: 3.5,
    Bengals: -3.5,
    Ravens: -3.5,
    Colts: 3.5,
    Falcons: 3.5,
    Steelers: -3.5,
    Bills: -0.5,
    Texans: 0.5,
    Bears: -3,
    Panthers: 3,
    Jets: 1.5,
    Titans: -1.5,
    Saints: 7,
    Lions: -7,
    Cardinals: 8.5,
    Chargers: -8.5,
    Dolphins: 3.5,
    Raiders: -3.5,
    Commanders: 4.5,
    Eagles: -4.5,
    Packers: 1.5,
    Vikings: -1.5,
    Cowboys: -3,
    Giants: 3,
    Broncos: 3,
    Chiefs: -3
  },
  playerEntries: {
    "michael-daniel": [
      {
        name: "Entry 1",
        picks: [
          "Texans +0.5",
          "Lions -7",
          "Vikings -1.5",
          "Steelers -3.5",
          "Broncos +3"
        ]
      },
      {
        name: "Entry 2",
        picks: [
          "Bears -3",
          "Broncos +3",
          "Steelers -3.5",
          "Vikings -1.5",
          "Lions -7"
        ]
      }
    ],
    ken: [
      {
        name: "Entry 1",
        picks: [
          "Eagles -4.5",
          "Texans +0.5",
          "Packers +1.5",
          "Broncos +3",
          "Jets +1.5"
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
  circaLines: CURRENT_WEEK.circaLines,

  // Refresh live scores every 10 seconds.
  refreshMs: 10000,

  // Keep provider-specific fetch and JSON normalization outside the dashboard UI.
  scoreProvider: "espn",

  // Avoid leaving the refresh button waiting forever if the endpoint is unavailable.
  requestTimeoutMs: 12000,

  // Player tabs. Each player's entries and picks are stored independently.
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

  // Optional defaults. null = let ESPN determine current scoreboard.
  defaultSeason: null,
  defaultSeasonType: 2,
  defaultWeek: null,

  // These are derived from CURRENT_WEEK above.
  allPicksPreset: ALL_PICKS_PRESET,
  playerPresets: PLAYER_PRESETS,
  starterEntries: ALL_PICKS_PRESET
};
