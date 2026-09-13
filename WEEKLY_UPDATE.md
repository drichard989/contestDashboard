# Weekly update checklist

The dashboard intentionally tracks the current week only. When a new week starts, replace the contents of `CURRENT_WEEK` in `config.js` rather than adding an archive.

1. Change `CURRENT_WEEK.key` to the new season and week, such as `2026-week-2`. This clears saved entries from the prior week on the next load.
2. Replace `CURRENT_WEEK.circaLines` with every team and spread from the Circa picture.
3. Replace `CURRENT_WEEK.playerEntries` with each player's entries. Use the player ID from `config.js` and keep one pick per line in `Team + line` format.
4. Leave out players who should use the default card. They will fall back to Michael-Daniel's entries until their own entries are added.
5. Check the player tabs and all-picks links, then commit and push the update.

When the next update is requested, provide the Circa picture and the picks grouped by player and entry. The weekly data can then be replaced in this one section.
