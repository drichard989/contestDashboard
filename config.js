window.CIRCA_CONFIG = {
  // Refresh live scores every 30 seconds.
  refreshMs: 30000,

  // Keep provider-specific fetch and JSON normalization outside the dashboard UI.
  scoreProvider: "espn",

  // Avoid leaving the refresh button waiting forever if the endpoint is unavailable.
  requestTimeoutMs: 12000,

  // Unofficial / unsupported ESPN endpoint. No API key is currently required.
  // See README.md and CODEX_HANDOFF.md for caveats and fallback strategy.
  espnScoreboardBase:
    "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard",

  // Optional defaults. null = let ESPN determine current scoreboard.
  defaultSeason: null,
  defaultSeasonType: 2,
  defaultWeek: null,

  // Preloaded examples based on the Week 1 picks discussed while this starter was created.
  // The UI persists edits in localStorage.
  starterEntries: [
    {
      name: "Entry 1",
      picks: [
        "Bears -3",
        "Broncos +3",
        "Steelers -3.5",
        "Vikings -1.5",
        "Lions -7"
      ]
    },
    {
      name: "Entry 2",
      picks: [
        "Texans +0.5",
        "Lions -7",
        "Vikings -1.5",
        "Steelers -3.5",
        "Broncos +3"
      ]
    }
  ]
};
