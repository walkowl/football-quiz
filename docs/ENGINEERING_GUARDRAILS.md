# Engineering Guardrails

## Engineering Priorities

Code quality is the top engineering constraint. Product trade-offs are acceptable; uncontrolled architecture drift is not.

The codebase should be:

- Well structured.
- Well tested.
- Easy to reason about.
- Safe for AI-assisted development.
- Protected by local checks before code leaves the machine.
- Efficient with network, battery, CPU, and memory.

## Local Quality Gate Target

Before production code is pushed, the repository should grow a single local verification command that runs the full quality gate.

Current entrypoint:

```sh
tools/quality/check.sh
```

Expected checks:

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
- Build verification.

## Architecture Principles

- Keep first-run quiz flow simple, fast, and isolated from account state.
- Treat personalization as an explicit domain concept, not incidental UI state.
- Separate quiz content, scoring, user profiling, and presentation concerns.
- Prefer deterministic domain logic that is easy to test.
- Avoid framework-specific leakage into core domain rules.
- Share domain intelligence and contracts across platforms; do not force all platforms to share one UI layer.
- Make data freshness visible in the model where it affects quiz correctness.
- Design content ingestion with source attribution and expiry in mind.

## AI-Assisted Development Rules

- New behavior should arrive with tests near the domain boundary it changes.
- Shared abstractions need a concrete second use before being generalized.
- Generated code must follow local patterns and pass the full local quality gate.
- Large changes should be split by product or architecture boundary.
- Architecture decisions that shape future work belong in `docs/decisions`.

## Performance And Battery Rules

- Avoid unnecessary background processing.
- Avoid repeated network calls for the same quiz session.
- Prefer cached, bounded data where freshness requirements allow it.
- Keep startup work minimal so the first quiz appears quickly.
- Measure before adding expensive client-side computation.
