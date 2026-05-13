# Content Provider Boundary

## Current State

Football Quiz uses local mock content only.

The app should behave as if real football content is coming later, but the current prototype must not depend on paid data, scheduled ingestion, a VPS, or provider credentials.

The current local mocks cover the first provider-shaped content slices: image-led player identification, recent result, player form, table movement, transfer-style, and market-value-style questions. They also include deliberate text-only questions so missing or unlicensed images remain a supported product state.

## Boundary Shape

The app consumes normalized quiz content, not raw provider responses.

Provider-specific code should eventually live behind a content ingestion boundary that produces app-ready records:

- Quiz pack.
- Quiz question.
- Answer options.
- Correct answer.
- Explanation.
- Difficulty.
- Tags.
- Normalized entity references for fixtures, teams, players, competitions, and topics.
- Source attribution.
- Freshness and expiry.
- Optional media.

The frontend should not know which provider supplied the data.

## Media Policy

Most production questions should include a photo or image because the desired app experience is photo-led.

Media is still optional in the contract because:

- A provider may not include a licensed image.
- An image request may fail.
- Some question types are better as text-only.
- Legal/licensing review may block image use for some entities.

If media is missing, the UI must show an intentional fallback state.

## Freshness Policy

Every current-football question needs freshness metadata.

The quiz screen must show that metadata compactly while the app is using local mocks, so testers can see whether a question is historical, mock weekly content, provider-required content, or eventually live provider content.

Required fields:

- Source label.
- Retrieval time.
- Event time where relevant.
- Valid-until or expiry rule.
- Confidence level for rumours or unofficial reports.

Stale current-football content is a product bug.

## When To Evaluate Providers

Evaluate providers after:

- The first-run quiz model is stable.
- Scoring and fan profiling are tested.
- The UI can render image-led and photoless questions.
- The mock app proves at least three content types.

## First Provider Questions

Provider evaluation should answer:

- Which competitions, players, clubs, and national teams are covered?
- How current are fixtures, lineups, results, scorers, transfers, and tables?
- Are player and club images included, licensed, or separate?
- What are the rate limits?
- What is the historical depth?
- How are entities identified and deduplicated?
- What are the commercial terms for a consumer quiz app?
- Can local ingestion tests run against sample responses?

## Good First Real Integration

The first real integration should not be live match polling.

Start with a bounded data slice:

1. Recent completed matches.
2. Teams and competitions for those matches.
3. Goal scorers where available.
4. One generated quiz pack from that normalized data.

Only move to transfers, market values, rumours, and social discussion once the basic ingestion and freshness rules are proven.
