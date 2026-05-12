# Prediction League Scope

## Product Direction

Football Quiz may evolve into a prediction league product mode.

Users should eventually be able to predict match scores, join leagues, compare accuracy, and compete across weekly or seasonal tables. Rewards are intentionally undefined for now, but the product direction can include money or money-like value later if it is legally and operationally safe.

## Initial Product Shape

Prediction leagues should start as a non-monetary local prototype.

The first version should prove:

- Match-score prediction before kickoff.
- Public or private league membership.
- Prediction lock time.
- Exact-score and outcome-based scoring.
- Weekly leaderboard.
- Season leaderboard.
- Tiebreakers.
- Result settlement from normalized match data.

## Reward Boundary

Rewards are future conditional scope.

Do not implement any of the following until the reward model has been reviewed for the target markets:

- Paid entry.
- Cash prizes.
- Cash-equivalent rewards.
- Withdrawable balances.
- Odds, betting, or wagering mechanics.
- User-to-user stakes.
- Sponsor-funded prizes.
- Marketplace credits with cash value.

Before any real-value reward exists, the project needs clear answers for legal classification, eligibility, age limits, identity checks, tax reporting, abuse prevention, payment operations, chargebacks, jurisdiction availability, and responsible-play controls.

## Product Guardrails

Prediction leagues should be designed as skill and knowledge competition, not gambling UX.

Early prototypes should:

- Avoid odds language.
- Avoid wager language.
- Avoid deposit, stake, cashout, or bet slip patterns.
- Avoid paid entry.
- Make scoring transparent.
- Explain lock times and settlement rules.
- Keep reward copy generic until reviewed.

## Data Needs

Prediction leagues need more real data maturity than quiz-only play.

Required data contracts:

- Fixtures.
- Kickoff time and timezone.
- Home and away teams.
- Match status.
- Final score.
- Postponement and cancellation handling.
- Competition and season.
- Result source attribution.
- Settlement timestamp.

This should come after the normalized content boundary is stable.

## First Implementation Rule

Build this in stages:

1. Document prediction and reward boundaries.
2. Add local mock fixture and result data.
3. Add score-prediction domain models and scoring tests.
4. Add a local-only prediction league prototype with no real rewards.
5. Evaluate legal/compliance requirements for any money or money-like reward.
6. Only then consider accounts, payments, payouts, or sponsored rewards.

## Current Local Foundation

The project now has a local-only prediction domain foundation:

- Mock fixtures and final results.
- Mock score predictions.
- Lock-time enforcement.
- Exact-score, outcome, and goal-difference scoring.
- Pending, void, locked, and scored states.
- Leaderboard ranking with tiebreakers.
- A local mobile league screen with an upcoming score-prediction form.
- A local save flow for the current user that persists only in browser storage on this device.
- A local edit and clear flow for correcting or removing the device-saved pick.
- Lock-window status based on fixture lock time, with save/update blocked once locked.
- Player-relative standing copy, such as `Better than X%`, instead of presenting raw points as the main reward signal.
- UI copy that keeps rewards explicitly locked until compliance work exists.

This is not a rewards system. It has no paid entry, prizes, balances, payouts, odds, or wager mechanics.

## Current Prototype Behavior

The bottom navigation now exposes a `Leaderboard` view inside the same mobile shell as the quiz. It shows the local prediction league using the mock fixture pack, the current scoring rules, and the in-memory saved prediction for the local user.

The current user can enter a home and away score for the next scheduled mock fixture while the local lock window is open. Saving the prediction writes a versioned local-storage record in the browser so the pick survives a refresh on this device. The current user can update that local pick or clear it from this device before lock. It does not create an account, persist to a database, send to an API, join a real league, or unlock any reward.

The good time to connect real match, player, and result data is after the local quiz and prediction loops both survive the full quality gate with their mock contracts. At that point the provider adapter can replace mock data without changing the product surface.
