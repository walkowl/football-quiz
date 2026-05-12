# 0002: Prefer Separate Web And Mobile Experiences With Shared Domain Boundaries

## Status

Proposed

## Context

Football Quiz should eventually work on iOS, Android, and the web. The app must feel fast, current, personal, and lightweight. Performance and battery life are product requirements, not afterthoughts.

The founder has deep Java/Kotlin/JVM experience, which makes a Kotlin-first engineering strategy attractive. However, a real website has needs that differ from a mobile app: search visibility, link sharing, content pages, browser-native behavior, and fast document-style rendering.

## Decision

Use a split platform strategy:

- Build the website as a proper web product, with TypeScript, React, and Next.js as the current preferred direction.
- Build backend and content systems in Kotlin on the JVM.
- Keep quiz, scoring, personalization, freshness, and content-domain rules behind explicit shared boundaries.
- Keep the mobile direction Kotlin-first.
- Decide later whether the mobile UI should use Compose Multiplatform across Android and iOS or native UI layers with shared Kotlin domain logic.

The project should share domain intelligence and contracts, not blindly force every platform to share the same UI.

## Consequences

- The website can be excellent at web concerns such as SEO, sharing, content pages, and browser-native performance.
- The mobile app can still optimize for native feel, startup speed, battery life, and platform polish.
- Kotlin remains central to backend and domain logic, matching the founder's strengths.
- Some UI work may be duplicated between web and mobile.
- The codebase needs strong contracts and tests around shared behavior to prevent web and mobile from drifting.
- The next implementation decision should choose the first product slice and define the initial local quality gate for that stack.
