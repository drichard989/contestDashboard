const ALL_PICKS_PRESET = [
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
];

const KEN_PRESET = [
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
];

window.CIRCA_CONFIG = {
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

  // Hard-code the default current week's entries here, then push the change with the site.
  allPicksPreset: ALL_PICKS_PRESET,
  // Add player-specific weekly presets here when a player has a different card.
  playerPresets: {
    ken: KEN_PRESET
  },
  starterEntries: ALL_PICKS_PRESET
};
