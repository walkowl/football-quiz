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
4. Suggest relevant leagues, teams, players, countries, or topics.
5. Ask lightweight personalization questions only after the quiz has created engagement.

## In Scope

- Cross-platform mobile app direction.
- Frictionless first quiz without mandatory account creation.
- Knowledge-level estimation.
- A local profile surface that summarizes quiz level, strongest signals, saved prediction state, and next recommended packs before account infrastructure exists.
- Device-only persistence for the first quiz loop so progress survives refreshes without introducing login or backend storage.
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
