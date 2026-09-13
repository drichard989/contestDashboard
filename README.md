# Circa Picks Live Dashboard

A tiny, static GitHub Pages dashboard for tracking NFL contest picks against live scores.

Target hostname:

**https://contestDashboard.danielrichard.com**

## What is included

- Static HTML/CSS/JavaScript only
- No backend required for the initial version
- Multiple contest entries
- Player tabs for Michael-Daniel, Rob, Ken, Ryan, and Andy
- Independent saved picks for each player
- An all-picks view showing each unique pick and the entries using it
- A checked-in weekly preset that can be loaded through deep links
- Deep links to the all-picks preset for any player
- Per-entry won/lost/tied records, with finished teams in the solid category color, live picks shown in parentheses, and pending teams listed by selection
- Pick input such as `Bears -3`, `Texans +0.5`, `Vikings -1.5`
- Live NFL scores
- Automatic ATS calculation
- Covering / losing / push / pending status
- Margin against the contest line
- Automatic score refresh every 10 seconds from ESPN; live clocks show ESPN's latest reported value without client-side interpolation, and there is no kickoff countdown
- Desktop text starts larger, with saved A− / A+ size controls
- Browser `localStorage` persistence
- Responsive/mobile layout
- `CNAME` preconfigured for `contestDashboard.danielrichard.com`

## Score source

The starter uses this unauthenticated ESPN web endpoint:

`https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard`

Optional query parameters commonly used by hobby projects include:

- `week=1`
- `seasontype=2`
- `dates=2026`

This is **not an official supported public API contract**. It currently requires no key, but ESPN can change the endpoint, JSON shape, access policy, or CORS behavior at any time.

The app therefore keeps ESPN-specific parsing in `providers/espn.js` and the endpoint itself in `config.js`, so Codex can swap providers or add a lightweight proxy later.

## Quick local test

Because browsers sometimes treat `file://` fetches differently, use a tiny local HTTP server.

Python:

```bash
# Run this from the project root.
python3 -m http.server 8080
```

Then open:

`http://localhost:8080`

## GitHub Pages deployment

1. Create a new GitHub repository, for example `circa-picks`.
2. Put the contents of this folder at the repository root.
3. Commit and push.
4. In GitHub:
   - **Settings → Pages**
   - Source: **Deploy from a branch**
   - Branch: `main`
   - Folder: `/ (root)`
5. GitHub Pages should detect the included `CNAME` file for `contestDashboard.danielrichard.com`.

## Custom domain DNS

At the DNS provider for `danielrichard.com`, create:

- Type: `CNAME`
- Host/name: `contestDashboard`
- Target: `<YOUR-GITHUB-USERNAME>.github.io`

Do **not** literally use the placeholder above. Use the actual GitHub Pages hostname for the account/repository.

Then in GitHub Pages settings set the custom domain to:

`contestDashboard.danielrichard.com`

After DNS resolves, enable **Enforce HTTPS**.

### If Cloudflare is your DNS provider

Start with the record as **DNS only** if GitHub's domain verification gives you trouble. After GitHub Pages is working and HTTPS is provisioned, you can decide whether you want Cloudflare proxying in front of it.

## How picks are graded

For a selected team:

`ATS margin = selected team's score + contest spread - opponent score`

Examples:

- Bears -3, Bears lead 14-7 → `14 - 3 - 7 = +4` → covering
- Lions -7, Lions lead 7-0 → `7 - 7 - 0 = 0` → push
- Texans +0.5, Texans trail 7-10 → `7 + 0.5 - 10 = -2.5` → losing

At game end the same math determines win/loss/push.

## Input format

One pick per line:

```text
Bears -3
Broncos +3
Steelers -3.5
Vikings -1.5
Lions -7
```

Accepted team text includes common names such as `Bears`, `Chicago Bears`, or `CHI`.

Half points can be entered as either:

```text
Steelers -3.5
Steelers -3½
```

Pick'em can be entered as:

```text
Bears PK
```

## Files

- `index.html` — UI shell
- `style.css` — responsive styling
- `config.js` — endpoint, refresh cadence, starter entries
- `providers/espn.js` — ESPN fetch and response normalization
- `app.js` — input parsing, team matching, ATS grading, rendering, persistence
- `CNAME` — GitHub Pages custom domain
- `CODEX_HANDOFF.md` — requirements and recommended next steps for Codex
- `TEST_PLAN.md` — manual acceptance checklist

### Weekly preset and deep links

Update `ALL_PICKS_PRESET` in `config.js` with the default current week's entries, or add a player-specific entry under `playerPresets`. Then push the change. The all-picks deep links load the matching preset for the selected player.

Use these links to open the preset directly:

- `?preset=all-picks&player=michael-daniel`
- `?preset=all-picks&player=rob`
- `?preset=all-picks&player=ken`
- `?preset=all-picks&player=ryan`
- `?preset=all-picks&player=andy`

The `player` value can be either the configured ID or display name. A link with only `?player=rob` opens Rob's saved dashboard without replacing the entries.

## Important limitations

1. ESPN's endpoint is unofficial/unsupported.
2. Direct browser fetches depend on ESPN continuing to allow cross-origin requests.
3. This starter does not scrape the weekly Circa card.
4. Contest lines are entered manually and intentionally never replaced by sportsbook market odds.
5. Browser storage is per-device/browser. Save picks after changing entries or scoreboard filters. Player tabs and the selected view are saved too.
6. If you want entries synced across devices later, add a backend or a shareable URL format.

## Recommended production hardening

The simplest robust next step is a free edge proxy using **Cloudflare Workers** or another free serverless tier:

Browser → your worker → ESPN scoreboard endpoint

Advantages:

- avoids future CORS problems
- lets you normalize ESPN's JSON into your own stable schema
- lets you add a second free source as fallback
- keeps the front-end independent of ESPN-specific response details

The current static version should remain the zero-cost baseline.
