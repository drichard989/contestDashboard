# Weekly update checklist

The dashboard intentionally tracks the current week only and is display-only. Nobody enters picks or scoreboard filters on the public site. When a new week starts, replace the contents of `CURRENT_WEEK` in `config.js` rather than adding an archive.

1. Change `CURRENT_WEEK.key` to the new season and week, such as `2026-week-2`. This makes prior-week local state obsolete on the next load.
2. Set `CURRENT_WEEK.season`, `seasonType`, and `week` to the same week shown on the Circa picture.
3. Replace `CURRENT_WEEK.circaMatchups` and `CURRENT_WEEK.circaLines` with every matchup, team, and spread from the Circa picture. ESPN requests will use the same season/week and exclude games outside those matchups.
4. Replace `CURRENT_WEEK.playerEntries` with each player's entries. Use the player ID from `config.js` and keep one pick per line in `Team + line` format.
5. Leave out players who do not have entries for that week. Their tabs remain available and show no configured picks until you add them.
6. Check the player tabs and all-picks links, then commit and push the update.

When the next update is requested, provide the Circa picture and the picks grouped by player and entry. The weekly data can then be replaced in this one section.
