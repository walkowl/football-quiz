# 0005: Add Prediction Leagues As Future Conditional Scope

## Status

Accepted

## Context

The product may expand beyond quizzes into score prediction leagues. Users could predict football match scores, compete on leaderboards, and eventually earn rewards. The founder wants rewards to be defined later and ideally include money.

Money or money-like rewards can create legal, compliance, tax, payments, age, identity, fraud, and responsible-play obligations. The project should capture the product ambition without turning the current local quiz prototype into betting, wagering, or payout infrastructure.

## Decision

Prediction leagues are added as future conditional scope.

The project may prototype score predictions, leagues, leaderboards, scoring rules, lock times, and result settlement locally with mock data. The project must not implement paid entry, cash prizes, withdrawable balances, odds, stakes, wagers, payouts, or money-like rewards until the reward model has been reviewed for the intended markets.

The first implementation path is non-monetary:

- Mock fixture and result data.
- Prediction domain models.
- Score calculation tests.
- Local league leaderboard.
- No real-value rewards.

## Consequences

- Prediction leagues can influence the data model and roadmap now.
- Real-money rewards stay blocked until compliance work is explicit.
- The product can test whether prediction play is fun before payments or prizes exist.
- The app avoids accidental gambling UX while still preserving the longer-term business ambition.
