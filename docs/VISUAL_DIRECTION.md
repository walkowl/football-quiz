# Visual Direction

## Preferred Reference

The preferred visual direction is captured here:

- [preferred-mobile-quiz-direction.jpeg](references/preferred-mobile-quiz-direction.jpeg)

## Direction

The first playable prototype should feel close to the preferred dark stadium mockup:

- Dark phone-native game surface.
- Stadium-at-night energy.
- Orange/gold accent system.
- Compact top app bar with a trophy-style game identity.
- Clear progress and timer row.
- Large football photo area near the top of each question.
- Big direct question text.
- Four answer rows with letter markers.
- Correct answer state in green.
- Bottom navigation that makes the surface feel like a real app.

The working name shown in the prototype can be `Footy Guess` while the repository remains `Football Quiz`.

## Result Screen Rule

The result screen should be compact and information-first.

The first mobile viewport must show the relevant result information without making the user scroll: how they compare with other players, their knowledge level, accuracy or correct count, strongest signal, and the next action.

Do not show meaningless score totals. Use a player-relative benchmark such as `Better than 74% of players`. During the local-only phase this can come from a mocked benchmark cohort, but the UI language and data model should be ready to replace it with a real user cohort later.

When more than one benchmark appears, label the scope clearly. For example, use `This quiz` for the just-finished pack and `Overall` for the device profile/history benchmark.

Prediction league surfaces should follow the same rule. Scoring rules can exist underneath for exact-score settlement, but the primary user-facing signal should be rank or `Better than X%` standing, with pending language before the user's own prediction has a settled fixture.

## Media Rule

Normal quiz content should expect a photo or image.

The data model and UI must still support photoless questions because real providers may occasionally lack a licensed image, image fetch may fail, or certain question types may be text-only.

When media is missing, the UI should render a deliberate fallback state, not a broken image or empty hole.

## Implementation Rule

The reference image is a design target, not a product asset to paste into the app.

The app UI should be code-native and interactive. Question media can be mocked locally for now, then replaced behind the content-data boundary when real football data and licensed media are introduced.
