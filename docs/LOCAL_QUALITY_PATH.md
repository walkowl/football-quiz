# Local Quality Path

## Policy

Quality enforcement is local-first.

Before code is pushed, the local machine should run the full verification path. GitHub may run tests as a second signal, but GitHub should not become the primary place where code quality is discovered.

## Local Gate

The local gate is:

```sh
tools/quality/check.sh
```

This command is intentionally technology-aware but framework-neutral at the start of the project. As the app stack is chosen, the gate should grow to include the real compiler, formatter, linter, architecture checks, tests, security checks, and build verification for that stack.

For the current web prototype, the gate runs:

- Prettier format check.
- ESLint for the web app.
- TypeScript type checking.
- Architecture boundary checks.
- Vitest unit and component tests.
- Coverage threshold checks.
- Playwright mobile browser E2E tests.
- Basic automated accessibility scan.
- Next.js production build.
- NPM high-severity audit.

## GitHub Boundary

Do not add a broad GitHub quality pipeline by default.

GitHub automation may be added later for:

- Test execution.
- Build verification when deployment needs it.
- Repository safety checks that cannot run locally.

The full engineering gate belongs on the developer machine before push.

## Required Future Checks

When implementation starts, the local gate should include:

- Formatting.
- Linting.
- Static analysis.
- Type checking or compiler verification.
- Unit tests.
- Integration tests where appropriate.
- Coverage thresholds.
- Dependency vulnerability scanning.
- Dead-code detection.
- Architecture rule checks.
- Production build verification.

## Push Rule

The local repository has a pre-push hook installed at `.git/hooks/pre-push`. It runs the local gate before allowing a push.

Because `.git/hooks` is not versioned, this hook is local to this checkout. If the repository is cloned elsewhere, install the same policy there before pushing from that checkout.
