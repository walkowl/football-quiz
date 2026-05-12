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
- Basic automated accessibility scan.
- Next.js production build.
- NPM audit for high-severity vulnerabilities.

## Current Coverage Floors

The current enforced floors are:

- Statements: 85%.
- Branches: 80%.
- Functions: 85%.
- Lines: 85%.

These are starter floors, not the ambition. Raise them as the app stabilizes.

## Missing Before Production

Before a public beta, add:

- Visual regression tests against approved mobile screenshots.
- Bundle-size budgets.
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
