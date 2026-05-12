# Platform Strategy

## Recommendation

Build Football Quiz as two excellent experiences that share product thinking, data contracts, and domain rules, rather than forcing one UI technology to serve every platform equally.

Recommended direction:

- Website: TypeScript with React and Next.js.
- Backend and content services: Kotlin on the JVM.
- Shared quiz, scoring, profiling, and content-domain rules: Kotlin-first domain model, with explicit API contracts for web and mobile clients.
- Mobile app: Kotlin Multiplatform direction, with either shared Compose Multiplatform UI or native platform UI depending on how much iOS polish the first production version needs.

This keeps the website excellent as a website and the mobile app excellent as an app.

## Why The Website Changes The Decision

If the product were mobile-only, Kotlin Multiplatform with Compose Multiplatform would be a very strong default because it fits the founder's Kotlin/JVM background and keeps a large amount of app logic in one language.

Adding a real website changes the tradeoff.

A website is not only another screen size. It has different needs:

- Fast first load.
- Search engine visibility.
- Linkable quizzes, teams, players, leagues, and weekly challenges.
- Good sharing previews.
- Content pages that behave like normal web pages.
- Accessibility and browser-native text behavior.
- Easy analytics and experimentation.

React and Next.js are a better fit for those website concerns than treating the browser as another app runtime. A football quiz can be app-like once the user starts playing, but the broader product will likely benefit from real web architecture.

## Mobile Performance And Battery View

For this product, the largest performance and battery risks are not caused by the language alone. The app is mostly:

- Quiz screens.
- Images.
- Cached football data.
- API requests.
- Scoring logic.
- Lightweight personalization.
- Short animations and transitions.

That is not inherently heavy.

The bigger risks are engineering mistakes:

- Slow startup work before the first quiz appears.
- Repeated network calls for the same session.
- Oversized player photos or club images.
- Wasteful background refresh.
- Polling instead of event-driven or scheduled refresh.
- Animations that force too much render work.
- Poor caching.
- Too much business logic on a UI thread.
- Unbounded local storage or image cache growth.

Good architecture will matter more than small benchmark differences between modern frameworks.

## Option Comparison

### Native UI With Shared Kotlin Domain

This means:

- Android UI in Kotlin and Jetpack Compose.
- iOS UI in SwiftUI.
- Shared Kotlin Multiplatform modules for domain logic, scoring, personalization, models, validation, and networking where appropriate.

Performance and battery:

- Highest ceiling.
- Best platform-native behavior.
- Best access to platform profiling and optimization tools.
- Lowest risk for iOS-specific UI polish.

Tradeoff:

- More UI code to build and maintain.
- Requires SwiftUI knowledge for iOS.
- More coordination between platform UI layers.

This is the premium-mobile choice if app quality is the absolute priority.

### Kotlin Multiplatform With Compose Multiplatform UI

This means:

- Kotlin for shared domain logic.
- Compose Multiplatform for shared Android and iOS UI.
- Potentially web or desktop targets later, but the website should still be evaluated separately.

Performance and battery:

- Strong fit for Android.
- Increasingly strong on iOS, but still worth profiling carefully.
- Good for a quiz app because the UI is not extremely graphically demanding.
- Good code sharing and strong alignment with Kotlin expertise.

Tradeoff:

- iOS polish and platform-specific interaction details need careful testing.
- Web support is useful for app-like browser experiences, but not the strongest default for a content-rich website.
- Fewer engineers have deep production experience with this stack than with fully native mobile or React web.

This is the best Kotlin-centered cross-platform app choice.

### Flutter

This means:

- Dart and Flutter for iOS, Android, and possibly web.

Performance and battery:

- Generally strong mobile performance.
- Good animation and rendering model.
- Battery can be excellent when frame render work stays low.

Tradeoff:

- Less aligned with the founder's Kotlin/JVM strengths.
- Web output can work well for app-like flows, but content-heavy web experiences often fit the normal web stack better.
- Adds a new main language and ecosystem.

This is a strong cross-platform mobile option, but not the most natural fit for this project.

### React Native And Expo

This means:

- TypeScript and React for mobile apps.
- Expo can target iOS, Android, and web.

Performance and battery:

- Good enough for many production apps.
- Strong developer velocity.
- Natural mental model if the website is also React.

Tradeoff:

- More performance discipline is needed because application logic commonly runs on the JavaScript thread.
- Heavy renders, expensive state updates, or JS-driven animations can cause visible frame drops.
- Native-feeling polish may require careful library choices and native modules.

This is attractive if web and mobile code sharing is more important than the highest mobile performance ceiling.

### PWA Or Web-Only App

This means:

- Build the product as a responsive website or installable web app first.

Performance and battery:

- Excellent reach.
- Good enough for many quiz experiences.
- Lowest installation friction.

Tradeoff:

- Less native polish.
- Less reliable access to mobile OS features.
- Weaker app-store presence.
- More limitations around notifications, offline behavior, and deep platform integration.

This is good for proving demand quickly, but not the ideal final shape if the product needs to feel like a premium mobile app.

## Recommended Architecture Shape

Use explicit boundaries from the beginning:

```text
football-quiz
  apps/
    web/                 # Next.js website
    mobile/              # Mobile app when selected
  services/
    api/                 # Kotlin backend/API service
    content-ingestion/   # Football data/news ingestion jobs
  packages/
    contracts/           # API schemas shared by clients
    quiz-domain/         # Quiz rules, scoring, profiling concepts
  docs/
    decisions/           # Architecture decision records
```

The exact folder names can change once the technology is selected, but the conceptual boundaries should remain:

- Web app.
- Mobile app.
- Backend/API.
- Content ingestion.
- Domain model.
- API contracts.
- Quality tooling.

## What Should Be Shared

Share:

- Quiz content model.
- Answer evaluation rules.
- Difficulty and knowledge-level model.
- Personalization signal model.
- Data freshness and expiry rules.
- API contracts.
- Test fixtures.
- Scoring logic where feasible.

Do not force sharing:

- Every UI component.
- Every animation.
- Platform-specific navigation.
- Mobile app startup shell.
- Website content pages.
- SEO-specific web behavior.

The product should share the rules that make it intelligent, while allowing each platform to feel native to its environment.

## Battery And Performance Rules For Any Stack

The chosen stack must support these rules:

- The first quiz must appear quickly.
- Startup must not wait for account state.
- The app must cache quiz session data.
- Recent-football data should have clear freshness windows.
- Network calls should be bounded, observable, and retry-safe.
- Images must be resized, cached, and lazy-loaded.
- Background work must be minimal and justified.
- Animations must be profiled on real devices.
- Performance testing must run on release builds, not only debug builds.
- Battery and thermal behavior should be tested before public launch.

## Decision Bias

The current bias is:

1. Build the website in Next.js.
2. Build backend and content systems in Kotlin.
3. Keep the mobile app Kotlin-first.
4. Decide between shared Compose Multiplatform UI and native iOS/Android UI after validating the first quiz loop and desired iOS polish.

If the priority is fastest product validation:

- Start with Next.js web plus Kotlin backend.
- Make the quiz loop excellent.
- Use the web product to validate content, personalization, and retention.

If the priority is premium mobile quality from day one:

- Start mobile with Kotlin Multiplatform shared domain.
- Use native UI or carefully profiled Compose Multiplatform UI.
- Keep the website as a separate Next.js app rather than a generated afterthought.

## Sources Reviewed

As of 2026-05-12, these official sources informed this direction:

- Android Developers: Kotlin Multiplatform is officially supported by Google for sharing business logic between Android and iOS.
- Kotlin Multiplatform documentation: Kotlin targets Android, iOS, desktop, web, and server-side platforms.
- Flutter documentation: Flutter supports web, but document-style web content can be better served by the browser's normal document model.
- React Native documentation: React Native can deliver native-feeling apps, but performance requires attention to the JavaScript thread and frame deadlines.

The conclusion is not that one framework is universally fastest. The conclusion is that Football Quiz should avoid compromising either web quality or mobile quality by forcing one UI layer to solve every problem.
