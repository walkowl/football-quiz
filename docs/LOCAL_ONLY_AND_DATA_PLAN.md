# Local-Only And Data Plan

## Current Decision

The project should stay local-only for now.

The first implementation should prove the product loop before buying hosting, wiring production infrastructure, or paying for football data. The current app should run on the developer machine and use mocked match, player, league, and quiz data.

## How To Click Through Mobile Without Installing Anything

Use the web app as the first mobile prototype.

Desktop browser:

```sh
npm run dev
```

Open `http://localhost:3000` and switch the browser dev tools to a mobile viewport.

Phone browser on the same Wi-Fi:

```sh
npm run dev:web:lan
```

Open `http://<your-mac-ip>:3000` from the phone browser. This does not require an app download, TestFlight, Play Store, or any VPS.

## Mock Data For Now

Use committed mock data for:

- Recent match results.
- Players.
- Player or match imagery.
- Clubs.
- Leagues.
- National teams.
- Transfer-style stories.
- Market-value-style comparisons.
- Quiz questions.
- Personalization recommendations.

The mock data must still look like real product data. It should have source labels, freshness windows, difficulty, categories, and tags so the eventual real data integration can replace it without rewriting the app.

Normal mock quiz questions should include media because the intended quiz format is image-led. The model must still allow `media` to be absent, and the UI must render a deliberate photoless fallback.

## Current Mock Coverage

The local mock layer now includes:

- A first-run legend challenge with player ID, club context, and market-value questions.
- A weekly pulse pack shaped like recent-result, player-form, and table-movement content.
- Image-led questions for the preferred visual loop.
- Text-only questions for provider, licensing, or missing-photo cases.
- A local next-pack handoff from the first-run result screen into Weekly Pulse.

This is enough to keep building locally while the quiz contract stabilizes. It is not yet enough to pay for a football data provider.

## Do Not Buy A VPS Yet

A VPS is not useful while the product is still proving the first quiz loop locally.

Do not buy hosting until at least one of these becomes true:

- The prototype needs to be available outside the local network for testers.
- The app needs always-on backend APIs.
- The app needs scheduled data ingestion.
- The app needs a persistent database.
- The app needs authentication, accounts, or user history across devices.
- The app needs provider webhooks or callback URLs.
- The mobile app needs remote content, remote config, or a real API.
- The project needs realistic latency or uptime testing.

Until then, local development is faster, cheaper, and keeps the architecture easier to change.

## When To Add Real Football Data

Do not integrate real football data before the quiz contract is stable.

Good time to start provider evaluation:

- The first-run quiz flow works end to end with mocks.
- The app has a stable quiz question model.
- Scoring and knowledge-level estimation are tested.
- The UI can show freshness, category, and source information.
- At least three content types are proven with mocks, such as recent results, player questions, and transfer questions.

Good time to integrate real data:

- The mock data layer has a clean replacement boundary.
- There is a clear list of required entities and fields.
- There is a decision on freshness needs, such as live, daily, weekly, or historical.
- Licensing and cost have been checked.
- The local quality gate can test ingestion, normalization, and quiz generation.

Good time to pay for a provider:

- A small beta needs current football content.
- Manual mock updates are slowing product learning.
- The app needs confidence that questions are correct.
- Retention depends on "what happened this week" content.

## Real Data Integration Order

1. Keep the app local with mock data.
2. Define stable contracts for quiz questions, teams, players, matches, leagues, and freshness.
3. Add tests around scoring, profiling, and content expiry.
4. Evaluate data providers against the real contract.
5. Build local ingestion against provider sandbox or sample data.
6. Add a backend service only when the local ingestion path is proven.
7. Buy hosting when scheduled ingestion or external testers require it.

## Data Quality Rules

Real data must include:

- Source attribution.
- Fetch time.
- Event time.
- Freshness or expiry rules.
- Confidence level where the source is not official.
- Normalized team, player, and league identifiers.
- Tests that catch missing required fields.

If the app asks current football questions, stale data is a product bug.
