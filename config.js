/*
  Weekly maintenance lives in this one object. Replace it each week with:
  - the new key, which makes the prior week's local state obsolete;
  - the Circa lines from the weekly picture; and
  - each player's entries and picks for that week.

  Keep picks in the format "Team + line". Player keys use the IDs below.
*/
const CURRENT_WEEK = {
  key: "2026-week-7",
  label: "Week 7",
  season: 2026,
  seasonType: 2,
  week: 7,
  circaMatchups: [
    ["SEA", "KC"],
    ["NO", "PIT"],
    ["ATL", "SF"],
    ["TEN", "CLE"],
    ["MIN", "IND"],
    ["NYJ", "MIA"],
    ["CAR", "TB"],
    ["BAL", "CIN"],
    ["HOU", "NYG"],
    ["ARI", "DEN"],
    ["DET", "GB"],
    ["LV", "LAR"],
    ["CHI", "NE"],
    ["PHI", "DAL"]
  ],
  circaLines: {
    Patriots: 3,
    Bears: -3,
    Steelers: -3,
    Saints: 3,
    Bucs: 3,
    Panthers: -3,
    Dolphins: 4,
    Jets: -4,
    Browns: -2.5,
    Titans: 2.5,
    Giants: 10,
    Texans: -10,
    "49ers": -2.5,
    Falcons: 2.5,
    Colts: 6.5,
    Vikings: -6.5,
    Bengals: 1.5,
    Ravens: -1.5,
    Broncos: -4.5,
    Cardinals: 4.5,
    Packers: 3,
    Lions: -3,
    Rams: -4,
    Raiders: 4,
    Chiefs: 2.5,
    Seahawks: -2.5,
    Cowboys: -3.5,
    Eagles: 3.5
  },
  playerEntries: {
    "michael-daniel": [
      {
        name: "Entry 2",
        picks: [
          "Colts +6.5",
          "Cardinals +4.5",
          "Raiders +4",
          "Eagles +3.5",
          "Seahawks -2.5"
        ]
      },
      {
        name: "Entry 1",
        picks: [
          "Bucs +3",
          "Titans +2.5",
          "Colts +6.5",
          "Cardinals +4.5",
          "Seahawks -2.5"
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
