import type { QuizPack, QuizQuestion, TopicOption } from "../domain/quiz";

export const mockQuestions: QuizQuestion[] = [
  {
    id: "mock-week-1-legend",
    category: "Player ID",
    difficulty: "easy",
    prompt: "Who is this football legend?",
    context:
      "Mock weekly feed: this question represents an image-led player-identification question.",
    freshness: {
      label: "Mock week",
      validUntil: "Replace before beta",
    },
    source: {
      kind: "mock",
      label: "Local mock data",
    },
    media: {
      kind: "image",
      src: "/mock-media/legend-photo.jpeg",
      alt: "A football legend celebrating in a Portugal kit.",
      credit: "Mock photo",
    },
    options: [
      { id: "messi", label: "Lionel Messi", hint: "Argentina" },
      { id: "neymar", label: "Neymar Jr.", hint: "Brazil" },
      { id: "ronaldo", label: "Cristiano Ronaldo", hint: "Portugal" },
      { id: "mbappe", label: "Kylian Mbappe", hint: "France" },
    ],
    correctOptionId: "ronaldo",
    explanation:
      "The mock photo points to Ronaldo and keeps the opener fast, visual, and familiar.",
    tags: ["players", "photo", "national-team"],
  },
  {
    id: "mock-week-1-leverkusen",
    category: "Club context",
    difficulty: "medium",
    prompt: "Which club became the story of a modern unbeaten Bundesliga run?",
    context:
      "Mock history/current-context blend: useful for testing league-interest personalization.",
    freshness: {
      label: "Historical anchor",
      validUntil: "Stable",
    },
    source: {
      kind: "mock",
      label: "Local mock data",
    },
    media: {
      kind: "image",
      src: "/mock-media/club-night.svg",
      alt: "Two footballers challenging for a ball under stadium lights.",
      credit: "Mock image",
    },
    options: [
      { id: "dortmund", label: "Borussia Dortmund", hint: "BVB" },
      { id: "leverkusen", label: "Bayer Leverkusen", hint: "Werkself" },
      { id: "wolfsburg", label: "Wolfsburg", hint: "Lower Saxony" },
      { id: "leipzig", label: "RB Leipzig", hint: "Saxony" },
    ],
    correctOptionId: "leverkusen",
    explanation:
      "Leverkusen is the intended medium answer and helps the app detect Bundesliga awareness.",
    tags: ["bundesliga", "clubs", "form"],
  },
  {
    id: "mock-week-1-market-value",
    category: "Market value",
    difficulty: "advanced",
    prompt: "Which profile would usually carry the higher market-value signal?",
    context:
      "Mock market question: this tests whether the user follows age, role, and transfer value patterns.",
    freshness: {
      label: "Mock valuation",
      validUntil: "Provider required",
    },
    source: {
      kind: "mock",
      label: "Local mock data",
    },
    options: [
      {
        id: "young-winger",
        label: "20-year-old elite winger",
        hint: "High upside",
      },
      {
        id: "veteran-keeper",
        label: "34-year-old veteran keeper",
        hint: "Lower resale",
      },
      {
        id: "backup-fullback",
        label: "Backup fullback in a mid-table side",
        hint: "Limited minutes",
      },
      {
        id: "free-agent",
        label: "Free agent striker after injury",
        hint: "High risk",
      },
    ],
    correctOptionId: "young-winger",
    explanation:
      "The mock model rewards high-upside attacking players because age, scarcity, and resale value matter.",
    tags: ["market-values", "transfers", "advanced", "text-only"],
  },
];

export const firstRunQuizPack: QuizPack = {
  id: "mock-legend-challenge",
  title: "Legend Challenge",
  subtitle: "Three fast questions to estimate your football level.",
  questions: mockQuestions,
};

export const weeklyPulseQuizPack: QuizPack = {
  id: "weekly-pulse",
  title: "Weekly Pulse",
  subtitle: "Local mock questions shaped like recent match and player data.",
  questions: [
    {
      id: "mock-pulse-featured-result",
      category: "Recent result",
      difficulty: "easy",
      prompt: "Who won the featured derby in this week's local pulse?",
      context:
        "Mock match result: this stands in for a recent completed match once a provider exists.",
      freshness: {
        label: "Mock week",
        validUntil: "Replace before beta",
      },
      source: {
        kind: "mock",
        label: "Local mock data",
      },
      media: {
        kind: "image",
        src: "/mock-media/club-night.svg",
        alt: "Two footballers challenging for a ball under stadium lights.",
        credit: "Mock image",
      },
      options: [
        { id: "arsenal", label: "Arsenal", hint: "2-1" },
        { id: "tottenham", label: "Tottenham", hint: "1-2" },
        { id: "draw", label: "Draw", hint: "1-1" },
        { id: "postponed", label: "Match postponed", hint: "No result" },
      ],
      correctOptionId: "arsenal",
      explanation:
        "The local pulse marks Arsenal as the mock winner so the app can exercise recent-result questions before live data.",
      tags: ["recent-results", "premier-league", "clubs"],
    },
    {
      id: "mock-pulse-player-form",
      category: "Player form",
      difficulty: "medium",
      prompt: "Which player profile should trigger a form-watch question?",
      context:
        "Mock player form: this represents a normalized player signal rather than raw provider data.",
      freshness: {
        label: "Mock week",
        validUntil: "Replace before beta",
      },
      source: {
        kind: "mock",
        label: "Local mock data",
      },
      options: [
        {
          id: "wide-forward",
          label: "Wide forward",
          hint: "3 goal involvements in 2 matches",
        },
        {
          id: "unused-sub",
          label: "Unused substitute",
          hint: "0 minutes",
        },
        {
          id: "suspended-captain",
          label: "Suspended captain",
          hint: "Unavailable",
        },
        {
          id: "loan-recall",
          label: "Loan recall",
          hint: "No recent starts",
        },
      ],
      correctOptionId: "wide-forward",
      explanation:
        "A short run of goal involvements is the strongest mock signal for a form-based question.",
      tags: ["players", "form", "text-only"],
    },
    {
      id: "mock-pulse-table-movement",
      category: "Table movement",
      difficulty: "advanced",
      prompt: "What is the strongest quiz hook from a club jumping 7th to 4th?",
      context:
        "Mock table movement: this prepares the app for standings-driven quiz generation.",
      freshness: {
        label: "Mock week",
        validUntil: "Replace before beta",
      },
      source: {
        kind: "mock",
        label: "Local mock data",
      },
      media: {
        kind: "image",
        src: "/mock-media/transfer-room.svg",
        alt: "A football analysis room with a player silhouette and data board.",
        credit: "Mock image",
      },
      options: [
        {
          id: "champions-league-race",
          label: "Champions League race",
          hint: "Position swing",
        },
        {
          id: "stadium-capacity",
          label: "Stadium capacity",
          hint: "Not table-linked",
        },
        {
          id: "shirt-sponsor",
          label: "Shirt sponsor",
          hint: "Commercial trivia",
        },
        {
          id: "mascot-history",
          label: "Mascot history",
          hint: "Evergreen topic",
        },
      ],
      correctOptionId: "champions-league-race",
      explanation:
        "A move into fourth place is a standings signal, so the quiz should frame it around the Champions League race.",
      tags: ["tables", "form", "advanced"],
    },
  ],
};

export const localMockQuizPacks: QuizPack[] = [
  firstRunQuizPack,
  weeklyPulseQuizPack,
];

export const topicOptions: TopicOption[] = [
  {
    id: "premier-league",
    label: "Premier League",
    hint: "Results, scorers, table swings",
  },
  {
    id: "transfers",
    label: "Transfers",
    hint: "Confirmed moves and rumours",
  },
  {
    id: "market-values",
    label: "Market values",
    hint: "Who is worth more and why",
  },
  {
    id: "national-team",
    label: "National team",
    hint: "Country-first questions",
  },
];
