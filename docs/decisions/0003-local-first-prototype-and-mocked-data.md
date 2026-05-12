# 0003: Start Local-Only With Mocked Football Data

## Status

Accepted

## Context

The product needs a fast first quiz loop before it needs deployment infrastructure. The app will eventually need fresh football data for matches, players, transfers, tables, and current events, but integrating paid or production data too early would slow iteration and force premature infrastructure decisions.

The user also wants to click through the mobile version without downloading anything to a phone.

## Decision

Start with a local-only Next.js web app under `apps/web`.

Use committed mock data for the first quiz, player, match, league, and personalization content. Make the mock data structured enough that real data can replace it behind a clean boundary later.

Do not buy a VPS yet. Do not integrate production football data yet. Use browser mobile emulation, or a phone browser on the same Wi-Fi network, to click through the mobile experience without installing an app.

## Consequences

- Product iteration stays fast.
- No hosting or data-provider cost is needed yet.
- The first mobile click-through can run from a local browser.
- Mock data must be treated as a real contract, not throwaway strings.
- Real data should be introduced after the quiz model, scoring, and first-run flow are stable and tested.
