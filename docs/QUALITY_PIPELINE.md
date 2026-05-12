# Quality Pipeline

## Current Answer

The project has a serious local-first quality pipeline, but it should keep getting stricter as the product grows.

The current local gate is:

```sh
tools/quality/check.sh
```

This is the command that must pass before push.

## Current Gate

The gate currently checks:

- Required project boundary documents exist.
- Architecture decision records have required sections.
- Local-only files and secrets are not tracked or staged.
- Prettier formatting.
- ESLint with zero warnings.
- TypeScript strict type checking.
- Architecture boundary rules.
- Vitest unit and component tests.
- Coverage thresholds.
- Playwright mobile browser E2E tests.
- Playwright visual regression screenshot for the approved mobile phone frame.
- Basic automated accessibility scan.
- Next.js production build.
- Bundle-size budgets from the production Next.js output.
- NPM audit for high-severity vulnerabilities.

## Current Coverage Floors

The current enforced floors are:

- Statements: 85%.
- Branches: 80%.
- Functions: 85%.
- Lines: 85%.

These are starter floors, not the ambition. Raise them as the app stabilizes.

## Current Bundle Budgets

The current enforced bundle limits are:

- First-load uncompressed route JavaScript: 575 KiB.
- Largest emitted JavaScript chunk: 240 KiB.

These are set just above the current production build. If a new feature needs more weight, improve the loading strategy before raising the budget.

## Current Visual Baseline

The approved mobile phone-frame screenshot is stored at:

```text
apps/web/e2e/first-run.spec.ts-snapshots/phone-home-mobile-chromium-darwin.png
```

Update it only when the intended visual direction changes.

## Current Dependency Watch Item

As of the local audit on 2026-05-12, npm reports a moderate PostCSS advisory through Next.js' nested PostCSS dependency. The high-severity audit gate passes, and the npm-suggested force fix would downgrade Next.js across major versions, so do not apply it blindly. Re-check this when upgrading Next.js or when npm offers a non-breaking patched dependency path.

## Missing Before Production

Before a public beta, add:

- Lighthouse or Web Vitals checks for the website.
- Dependency license checks.
- Dead-code detection.
- Mutation tests for scoring and profiling logic.
- Contract tests for real football data ingestion.
- Performance profiling on real mobile devices.
- Battery and thermal checks for the native app when it exists.

## Principle

GitHub can run tests later, but it must not become the first place quality is discovered.

The local machine should reject bad changes before push.
