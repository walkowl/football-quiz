# Project Boundaries

## Product North Star

Football Quiz should feel alive, fast, and personal from the first interaction.

The first user experience must avoid login, email capture, and long onboarding. A new user should open the app and start answering football questions immediately.

The longer-term product can grow from quiz play into football prediction leagues, where users predict match scores, compete on leaderboards, and earn rewards when the compliance model is ready.

## Initial Product Promise

"Test how well you followed football this week."

This positions the app as a current football habit, not a static trivia toy.

## First Experience

The first session should:

1. Start with a short football quiz.
2. Ask roughly three questions across easy, medium, and advanced difficulty.
3. Estimate the user's football knowledge level.
4. Show how the user compares with other players using a meaningful "better than X% of players" style benchmark.
5. Suggest relevant leagues, teams, players, countries, or topics.
6. Ask lightweight personalization questions only after the quiz has created engagement.

## UX Requirements

- Do not show arbitrary score counters such as fake points, coin totals, or unexplained numeric scores.
- Quiz results must use meaningful comparative language, especially how much better the user performed than other players.
- While the project is local-only, player comparison may use a clearly local mocked benchmark cohort.
- Once real user data exists, the benchmark should be backed by real cohort data and should say which cohort it compares against.
- The result screen must keep the most relevant information above the fold on mobile: player comparison, knowledge level, accuracy or correct count, strongest signal, and the next useful action.
- Users should not need to scroll before understanding how they did or what to do next.
- Home must surface the most important matchday actions at the top: continue or start the right quiz, make a score prediction, and see the player-relative benchmark.

## Near-Term Local Plan

1. Keep the app local-only while the first product loop is still changing quickly.
2. Build a mocked Daily Matchday loop that connects one upcoming fixture, a short quiz pack, and the score-prediction league.
3. Keep phone click-through on a production LAN preview so mobile testing reflects the hydrated app, not a dev-server edge case.
4. Add tests for every major first-screen interaction, especially answer taps/clicks and Home-to-quiz/Home-to-prediction routing.
5. Expand the mock data contract before paying for a provider: fixture, team, player, quiz source, freshness, media, and photoless fallback fields.
6. Revisit VPS and real football data only when external testers, scheduled ingestion, accounts, or real freshness requirements make local-only work too slow.

## In Scope

- Cross-platform mobile app direction.
- Frictionless first quiz without mandatory account creation.
- Knowledge-level estimation.
- Meaningful player-relative performance comparison instead of arbitrary game score totals.
- A local profile surface that summarizes quiz level, strongest signals, saved prediction state, and next recommended packs before account infrastructure exists.
- Device-only persistence for the first quiz loop so progress survives refreshes without introducing login or backend storage.
- Local completed-quiz history for early profile quality, while keeping cross-device identity and long-term accounts out of the first pass.
- Personalization by country, league, club, player, and topic interest.
- Quiz content that mixes timeless knowledge with recent football events.
- Score-prediction league direction as a future product mode.
- Strong local quality gates before code is pushed.
- Architecture that remains maintainable under AI-assisted development.
- Battery, network, and performance discipline as product requirements.

## Future Conditional Scope

Score prediction leagues are in scope as a future product direction.

That mode may include:

- Predicting exact match scores before kickoff.
- Joining public or private leagues.
- Ranking users by prediction accuracy.
- Streaks, seasonal tables, and weekly winners.
- Rewards defined later, potentially including money or money-like value.

Money, prizes, or money-like rewards must not be implemented until the reward model has legal, compliance, tax, age, identity, and jurisdiction review. The product must distinguish skill-based prediction contests from betting, wagering, gambling, fantasy sports, and odds-based flows before any real-value reward is offered.

## Out of Scope For The First Implementation Pass

- Mandatory login or account creation before the first quiz.
- Heavy onboarding forms before the user experiences the game.
- Social graph features.
- Betting, gambling, odds, or wagering flows.
- Real-money contests, prizes, payouts, paid entry, or money-like rewards.
- Push-notification strategy before the core quiz habit is proven.
- Large-scale content management tooling before the content model is validated.

## User Knowledge Levels

- Newbie: knows famous players and clubs but does not follow football deeply.
- Casual Fan: watches major matches and follows some big teams or players.
- Intermediate Fan: follows one or more leagues regularly.
- Daily Follower: keeps up with results, transfers, tables, and player news.
- Advanced Fan: understands multiple leagues, player form, transfers, tactics, and current football context.

## Content Directions

Quiz content may cover:

- Recent match results.
- Current league tables and form.
- Goals and scorers.
- Confirmed transfers and credible rumours.
- Player market values.
- Club history.
- National teams.
- Champions League.
- Player identification.
- Score predictions.
- Prediction leagues.
- Rewarded prediction challenges after compliance review.
- Football discussion and gossip topics.

## Open Product Questions

- Which cross-platform technology should be selected for the first production app?
- Which data sources provide the best mix of freshness, reliability, cost, and licensing safety?
- How much content can be generated automatically while preserving trust and quality?
- What is the minimum personalization model that feels intelligent without feeling invasive?
- What local quality gates should be mandatory before the first implementation commit?
- What prediction scoring rules are most fun without encouraging betting behavior?
- Which reward models are legally viable in the first target markets?
