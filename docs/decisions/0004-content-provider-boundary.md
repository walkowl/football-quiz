# 0004: Keep Provider Data Behind A Normalized Content Boundary

## Status

Accepted

## Context

Football Quiz will eventually need current football data: results, players, teams, competitions, scorers, transfers, market values, and possibly news or discussion signals.

The first prototype is local-only with mock data. Integrating raw provider responses directly into UI code would make it harder to switch providers, test content quality, handle missing media, and enforce freshness rules.

## Decision

Provider-specific data must be normalized before the app consumes it.

The frontend consumes quiz packs, quiz questions, answer options, explanations, source metadata, freshness metadata, and optional media. It should not consume raw provider response shapes.

Media should be expected for normal production quiz content, but it must remain optional in the contract and UI.

## Consequences

- The mock data layer can evolve into a real adapter boundary.
- Provider evaluation can focus on whether providers can satisfy the app contract.
- Photoless content has a deliberate UI fallback.
- Freshness and source attribution become part of the product model instead of afterthoughts.
- More ingestion code will be needed before using real data, but it keeps the product safer and easier to test.
