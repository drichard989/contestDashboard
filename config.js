/*
  Weekly maintenance lives in this one object. Replace it each week with:
  - the new key, which makes the prior week's local state obsolete;
  - the Circa lines from the weekly picture; and
  - each player's entries and picks for that week.

  Keep picks in the format "Team + line". Player keys use the IDs below.
*/
const CURRENT_WEEK = {
  key: "2026-week-10",
  label: "Week 10",
  season: 2026,
  seasonType: 2,
  week: 10,
  circaMatchups: [
    ["NYG", "WSH"],
    ["NE", "DET"],
    ["BUF", "NYJ"],
    ["JAX", "TEN"],
    ["MIA", "IND"],
    ["KC", "ATL"],
    ["HOU", "CLE"],
    ["CAR", "NO"],
    ["MIN", "GB"],
    ["SEA", "LV"],
    ["LAR", "ARI"],
    ["SF", "DAL"],
    ["PIT", "CIN"],
    ["LAC", "BAL"]
  ],
  circaLines: {
    Commanders: 2,
    Giants: -2,
    Patriots: 3,
    Lions: -3,
    Bills: -7.5,
    Jets: 7.5,
    Jaguars: -10.5,
    Titans: 10.5,
    Dolphins: 3.5,
    Colts: -3.5,
    Chiefs: -3.5,
    Falcons: 3.5,
    Texans: -4.5,
    Browns: 4.5,
    Panthers: 2.5,
    Saints: -2.5,
    Vikings: 3,
    Packers: -3,
    Seahawks: -6.5,
    Raiders: 6.5,
    Rams: -9.5,
    Cardinals: 9.5,
    "49ers": -4,
    Cowboys: 4,
    Steelers: 3.5,
    Bengals: -3.5,
    Chargers: 4.5,
    Ravens: -4.5
  },
  playerEntries: {
    "michael-daniel": [
      {
        name: "Entry 2",
        picks: [
          "Lions -3",
          "Chiefs -3.5",
          "49ers -4",
          "Bengals -3.5",
          "Vikings +3"
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
