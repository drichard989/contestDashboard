# Codex handoff: Circa Picks dashboard

## Goal

Turn this starter into a polished personal live dashboard hosted at:

**contestDashboard.danielrichard.com**

The dashboard tracks manually entered Circa contest selections against live NFL scores.

The most important rule:

> The user's entered Circa line is authoritative. Never substitute the current sportsbook spread.

## Current implementation

The included starter already supports:

- multiple entries
- 1 pick per line
- natural team-name parsing
- half-point lines
- localStorage
- an ESPN scoreboard fetch
- team matching
- ATS grading
- live/pregame/final states
- 30-second refresh
- responsive layout
- custom-domain CNAME

Review and improve the existing code rather than replacing working behavior gratuitously.

## Product requirements

### 1. Entry management

Support any reasonable number of entries.

Each entry has:

- editable name
- ordered list of picks
- one pick per line

Example:

```text
Entry 1
Bears -3
Broncos +3
Steelers -3.5
Vikings -1.5
Lions -7
```

Persist everything in localStorage.

### 2. Live score retrieval

Initial zero-cost data source:

`https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard`

Treat this as unofficial and unstable.

Requirements:

- no API key
- no paid service
- refresh every ~30 seconds when page is open
- manual refresh button
- show last successful update
- do not clear saved picks if score fetching fails
- fail gracefully

### 3. ATS logic

For selected team `T`:

`atsMargin = score(T) + spread(T) - score(opponent)`

Status:

- `atsMargin > 0`: COVERING while live; WIN when final
- `atsMargin === 0`: PUSH
- `atsMargin < 0`: LOSING while live; LOSS when final
- pregame: PENDING

The line is always the stored contest line.

### 4. UI

Mobile-first, compact, readable.

Each entry should show:

- `Team Spread` together, e.g. **Steelers -3½**
- opponent
- current score
- quarter / clock or final
- ATS state
- ATS margin
- summary counts for covering/winning, losing/losses, pushes, pending

Use accessible text labels in addition to color.

Desired feel:

- clean sportsbook/contest dashboard
- navy/white/neutral palette
- very little wasted vertical space
- good on iPhone

### 5. Deduplication

If the same pick occurs on multiple entries, fetch/parse its game once and reuse the result.

### 6. Week controls

Support:

- auto current scoreboard
- manual season
- manual season type
- manual week

Preserve overrides in localStorage.

### 7. Error handling

Handle:

- unknown team
- malformed spread
- game not found
- ESPN fetch failure
- unexpected ESPN schema
- postponed/canceled game where available

Never throw an uncaught error that blanks the page.

## Strongly recommended improvements

### A. Isolate the score provider

Refactor score access into a provider abstraction, e.g.:

```text
providers/
  espn.js
```

Normalized game schema:

```js
{
  id,
  state,          // pre | in | post
  statusText,
  startTime,
  home: { abbr, name, score },
  away: { abbr, name, score }
}
```

Everything outside the provider should operate on that normalized shape.

### B. Optional free proxy

If direct GitHub Pages → ESPN runs into CORS or reliability issues, add a free Cloudflare Worker.

Desired endpoint:

```text
GET https://scores.danielrichard.com/nfl?week=1&season=2026&seasonType=2
```

or route it behind the same domain if practical.

Worker responsibilities:

- fetch ESPN
- cache briefly (10–20 sec)
- normalize response
- return permissive CORS headers only for `https://contestDashboard.danielrichard.com`
- never expose secrets because none should be needed

Do not introduce a paid dependency.

### C. Share/import/export

Nice-to-have:

- Export all entries as JSON
- Import JSON
- Generate a compact shareable URL payload if safely small

### D. Weekly reset

Nice-to-have:

- "New week" action
- confirmation before replacing picks
- preserve prior week in an optional local history

### E. Installable PWA

Optional:

- web app manifest
- icons
- service worker for shell caching
- clearly show that live score refresh still needs connectivity

## Do not do

- Do not iframe ESPN/CBS/Yahoo scoreboards as the primary implementation.
- Do not scrape rendered HTML if JSON score data remains available.
- Do not require an API key.
- Do not introduce Firebase or a database unless device syncing is explicitly requested.
- Do not pull current betting odds and overwrite the contest number.
- Do not assume the user's Circa selection card line equals a current market line.

## Acceptance examples

Given:

`Lions -7`

Score:

`DET 7, NO 0`

Expected:

- status: PUSH
- ATS margin: 0

Given:

`Bears -3`

Score:

`CHI 14, CAR 7`

Expected:

- status: COVERING
- ATS margin: +4

Given:

`Texans +0.5`

Score:

`HOU 7, BUF 10`

Expected:

- status: LOSING
- ATS margin: -2.5

Given final:

`DEN 20, KC 22`
with `Broncos +3`

Expected:

- WIN
- ATS margin: +1

## Deployment requirements

Repository root must remain GitHub Pages-compatible.

Required file:

```text
CNAME
```

Contents:

```text
contestDashboard.danielrichard.com
```

No build step is required for the current starter.

If introducing a framework, keep deployment simple and document the GitHub Actions build/deploy path.

## Source caveat

The ESPN endpoint is used because it is publicly reachable without authentication and is widely used by hobby projects. It is not an officially guaranteed developer API. Design so it can be swapped out quickly.

## Definition of done

The project is done when:

1. I can open the site on iPhone.
2. I can paste two or more five-pick entries.
3. I can save and reload without losing them.
4. Live NFL scores appear automatically.
5. Every pick shows the contest spread immediately next to the team.
6. ATS grading is correct for positive, negative, half-point, and push lines.
7. Shared picks across entries are consistent.
8. Finals are labeled WIN / LOSS / PUSH.
9. Score outages do not erase picks.
10. It deploys cleanly to GitHub Pages at `contestDashboard.danielrichard.com`.
