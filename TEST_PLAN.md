# Manual acceptance test plan

## Setup

Run:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Input parsing

Verify each is accepted:

- `Bears -3`
- `Chicago Bears -3`
- `CHI -3`
- `Texans +0.5`
- `Texans +½`
- `Steelers -3.5`
- `Steelers -3½`
- `Broncos +3`
- `Bears PK`

Verify an unknown team shows an input error without breaking other picks.

## Persistence

1. Edit both entry names.
2. Enter picks.
3. Save.
4. Reload the browser.
5. Confirm all entries and week settings remain.

## ATS math

Use browser dev tools or fixture data if Codex adds test fixtures.

Cases:

| Selected score | Opp score | Spread | Expected margin | Expected |
|---:|---:|---:|---:|---|
| 14 | 7 | -3 | +4 | Cover |
| 7 | 0 | -7 | 0 | Push |
| 7 | 10 | +0.5 | -2.5 | Lose |
| 20 | 22 | +3 | +1 | Cover |
| 24 | 27 | +3 | 0 | Push |
| 21 | 17 | -3.5 | +0.5 | Cover |

## State labels

Pregame:
- PENDING

Live:
- COVERING
- LOSING
- PUSH

Final:
- WIN
- LOSS
- PUSH

## Score outage

Temporarily replace the ESPN URL in `config.js` with an invalid URL.

Verify:

- page remains usable
- saved picks remain visible
- warning appears
- no unhandled exception blanks the app

Restore the URL.

## Mobile

Test around 390px width.

Verify:

- no horizontal page overflow
- tables can scroll if needed
- team + spread remains legible
- buttons are touch-friendly
- entry cards remain compact
