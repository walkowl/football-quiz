#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

fail() {
  printf 'quality check failed: %s\n' "$1" >&2
  exit 1
}

step() {
  printf '==> %s\n' "$1"
}

run_if_exists() {
  local description="$1"
  shift

  step "$description"
  "$@"
}

require_file() {
  local path="$1"
  [[ -f "$path" ]] || fail "required file is missing: $path"
}

ensure_not_tracked() {
  local pattern="$1"
  local description="$2"

  if git ls-files | grep -E "$pattern" >/dev/null; then
    fail "$description is tracked"
  fi
}

ensure_not_staged() {
  local pattern="$1"
  local description="$2"

  if git diff --cached --name-only | grep -E "$pattern" >/dev/null; then
    fail "$description is staged"
  fi
}

step "checking repository boundaries"
require_file "README.md"
require_file "docs/PROJECT_BOUNDARIES.md"
require_file "docs/PLATFORM_STRATEGY.md"
require_file "docs/VISUAL_DIRECTION.md"
require_file "docs/CONTENT_PROVIDER_BOUNDARY.md"
require_file "docs/QUALITY_PIPELINE.md"
require_file "docs/references/preferred-mobile-quiz-direction.jpeg"
require_file "docs/LOCAL_ONLY_AND_DATA_PLAN.md"
require_file "docs/ENGINEERING_GUARDRAILS.md"
require_file "docs/LOCAL_QUALITY_PATH.md"
require_file "docs/decisions/0001-project-boundaries.md"
require_file "docs/decisions/0002-platform-strategy.md"
require_file "docs/decisions/0003-local-first-prototype-and-mocked-data.md"
require_file "docs/decisions/0004-content-provider-boundary.md"

if [[ -f "package.json" ]]; then
  require_file "package-lock.json"
fi

step "checking local-only files stay out of git"
ensure_not_tracked '(^|/)\.DS_Store$' ".DS_Store"
ensure_not_staged '(^|/)\.DS_Store$' ".DS_Store"
ensure_not_tracked '(^|/)\.env(\.|$)' ".env"
ensure_not_staged '(^|/)\.env(\.|$)' ".env"
ensure_not_tracked '^\.local-quality/' ".local-quality"
ensure_not_staged '^\.local-quality/' ".local-quality"

step "checking decision records"
for decision in docs/decisions/*.md; do
  grep -q '^## Status$' "$decision" || fail "$decision is missing Status"
  grep -q '^## Context$' "$decision" || fail "$decision is missing Context"
  grep -q '^## Decision$' "$decision" || fail "$decision is missing Decision"
  grep -q '^## Consequences$' "$decision" || fail "$decision is missing Consequences"
done

if [[ -f "package.json" ]]; then
  if command -v npm >/dev/null 2>&1; then
    npm run format:check --if-present
    npm run lint --if-present
    npm run typecheck --if-present
    npm run quality:architecture --if-present
    npm run test:coverage --if-present
    npm run build --if-present
    npm run test:e2e --if-present
    npm audit --audit-level=high
  else
    fail "package.json exists but npm is not available"
  fi
fi

if [[ -x "./gradlew" ]]; then
  run_if_exists "running Gradle verification" ./gradlew check
fi

if [[ -f "pom.xml" ]]; then
  if command -v mvn >/dev/null 2>&1; then
    run_if_exists "running Maven verification" mvn verify
  else
    fail "pom.xml exists but mvn is not available"
  fi
fi

if [[ -f "pyproject.toml" ]]; then
  if command -v uv >/dev/null 2>&1; then
    run_if_exists "running Python tests" uv run pytest
  elif command -v pytest >/dev/null 2>&1; then
    run_if_exists "running Python tests" pytest
  else
    fail "pyproject.toml exists but no pytest runner is available"
  fi
fi

step "quality gate passed"
