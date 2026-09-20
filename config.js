/*
  Weekly maintenance lives in this one object. Replace it each week with:
  - the new key, which makes the prior week's local state obsolete;
  - the Circa lines from the weekly picture; and
  - each player's entries and picks for that week.

  Keep picks in the format "Team + line". Player keys use the IDs below.
*/
const CURRENT_WEEK = {
  key: "2026-week-2",
  label: "Week 2",
  season: 2026,
  seasonType: 2,
  week: 2,
  circaMatchups: [
    ["DET", "BUF"],
    ["GB", "NYJ"],
    ["MIN", "CHI"],
    ["PIT", "NE"],
    ["CAR", "ATL"],
    ["CLE", "TB"],
    ["CIN", "HOU"],
    ["NO", "BAL"],
    ["PHI", "TEN"],
    ["LV", "LAC"],
    ["JAX", "DEN"],
    ["WSH", "DAL"],
    ["SEA", "ARI"],
    ["MIA", "SF"],
    ["IND", "KC"],
    ["NYG", "LAR"]
  ],
  circaLines: {
    Lions: 5.5,
    Bills: -5.5,
    Packers: -3.5,
    Jets: 3.5,
    Vikings: 4.5,
    Bears: -4.5,
    Steelers: 5.5,
    Patriots: -5.5,
    Panthers: -2.5,
    Falcons: 2.5,
    Browns: 8.5,
    Bucs: -8.5,
    Bengals: 2.5,
    Texans: -2.5,
    Saints: 8.5,
    Ravens: -8.5,
    Eagles: -7,
    Titans: 7,
    Raiders: 6.5,
    Chargers: -6.5,
    Jaguars: 2.5,
    Broncos: -2.5,
    Commanders: 4,
    Cowboys: -4,
    Seahawks: -4,
    Cardinals: 4,
    Dolphins: 13,
    "49ers": -13,
    Colts: 6.5,
    Chiefs: -6.5,
    Giants: 7,
    Rams: -7
  },
  playerEntries: {
    "michael-daniel": [
      {
        name: "Entry 1",
        picks: [
          "Bills -5.5",
          "Packers -3.5",
          "Bears -4.5",
          "Eagles -7",
          "Chiefs -6.5"
        ]
      },
      {
        name: "Entry 2",
        picks: [
          "Packers -3.5",
          "Bears -4.5",
          "Panthers -2.5",
          "Eagles -7",
          "Bills -5.5"
        ]
      }
    ],
    andy: [
      {
        name: "Entry 1",
        picks: [
          "Jets +3.5",
          "Browns +8.5",
          "Saints +8.5",
          "Cardinals +4",
          "Chargers -6.5"
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
