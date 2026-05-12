# Football Quiz

A fast, current, personalized football quiz app.

The product goal is to get a new user answering football questions immediately, then use those answers to infer their knowledge level and personalize future quiz content around leagues, teams, countries, players, and current football events.

## Current Stage

This repository is at project-boundary stage. The first commit defines the product and engineering edges before implementation starts.

## Boundaries

- Product scope is defined in [docs/PROJECT_BOUNDARIES.md](docs/PROJECT_BOUNDARIES.md).
- Platform strategy is defined in [docs/PLATFORM_STRATEGY.md](docs/PLATFORM_STRATEGY.md).
- Visual direction is defined in [docs/VISUAL_DIRECTION.md](docs/VISUAL_DIRECTION.md).
- Future football data boundaries are defined in [docs/CONTENT_PROVIDER_BOUNDARY.md](docs/CONTENT_PROVIDER_BOUNDARY.md).
- Prediction league and reward boundaries are defined in [docs/PREDICTION_LEAGUE_SCOPE.md](docs/PREDICTION_LEAGUE_SCOPE.md).
- Local quality is defined in [docs/QUALITY_PIPELINE.md](docs/QUALITY_PIPELINE.md).
- Engineering guardrails are defined in [docs/ENGINEERING_GUARDRAILS.md](docs/ENGINEERING_GUARDRAILS.md).
- The local-first quality path is defined in [docs/LOCAL_QUALITY_PATH.md](docs/LOCAL_QUALITY_PATH.md).
- Architecture decisions will be tracked in [docs/decisions](docs/decisions).

## Local Verification

Run the local quality gate before pushing:

```sh
tools/quality/check.sh
```

## Local App

The first clickable prototype lives in `apps/web`.

Run it locally:

```sh
npm run dev
```

Open `http://localhost:3000` and use your browser's mobile device mode to click through the mobile experience without installing anything on a phone.

To open it from a phone on the same Wi-Fi network without installing an app, use the production LAN preview:

```sh
npm run preview:web:lan
```

Then open `http://<your-mac-ip>:3001` from the phone browser. Use this production preview for phone click-through testing; the Next.js development server can fail to hydrate correctly over LAN when its hot-reload WebSocket is blocked.

## Source Brief

The initial product and engineering brief is included at the repository root:

- `Football Quiz App — Initial Product and Engineering Brief.txt`
