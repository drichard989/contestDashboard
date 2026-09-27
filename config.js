/*
  Weekly maintenance lives in this one object. Replace it each week with:
  - the new key, which makes the prior week's local state obsolete;
  - the Circa lines from the weekly picture; and
  - each player's entries and picks for that week.

  Keep picks in the format "Team + line". Player keys use the IDs below.
*/
const CURRENT_WEEK = {
  key: "2026-week-3",
  label: "Week 3",
  season: 2026,
  seasonType: 2,
  week: 3,
  circaMatchups: [
    ["ATL", "GB"],
    ["SEA", "WSH"],
    ["CIN", "PIT"],
    ["NYJ", "DET"],
    ["TEN", "NYG"],
    ["NE", "JAX"],
    ["KC", "MIA"],
    ["HOU", "IND"],
    ["CAR", "CLE"],
    ["LAC", "BUF"],
    ["MIN", "TB"],
    ["ARI", "SF"],
    ["LV", "NO"],
    ["BAL", "DAL"],
    ["LAR", "DEN"],
    ["PHI", "CHI"]
  ],
  circaLines: {
    Falcons: 4.5,
    Packers: -4.5,
    Seahawks: -7.5,
    Commanders: 7.5,
    Bengals: -3.5,
    Steelers: 3.5,
    Jets: 6.5,
    Lions: -6.5,
    Titans: 2.5,
    Giants: -2.5,
    Patriots: 3,
    Jaguars: -3,
    Chiefs: -11.5,
    Dolphins: 11.5,
    Texans: -1.5,
    Colts: 1.5,
    Panthers: -2.5,
    Browns: 2.5,
    Chargers: 7,
    Bills: -7,
    Vikings: -1,
    Bucs: 1,
    Cardinals: 8.5,
    "49ers": -8.5,
    Raiders: 3,
    Saints: -3,
    Ravens: -3,
    Cowboys: 3,
    Rams: -2.5,
    Broncos: 2.5,
    Eagles: -4.5,
    Bears: 4.5
  },
  playerEntries: {
    "michael-daniel": [
      {
        name: "Entry 1",
        picks: [
          "Bengals -3.5",
          "Panthers -2.5",
          "Bills -7",
          "Vikings -1",
          "Seahawks -7.5"
        ]
      },
      {
        name: "Entry 2",
        picks: [
          "Panthers -2.5",
          "Bengals -3.5",
          "Seahawks -7.5",
          "Vikings -1",
          "Eagles -4.5"
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
