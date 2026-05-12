import type { QuizPack, QuizQuestion, TopicOption } from "../domain/quiz";

export const mockQuestions: QuizQuestion[] = [
  {
    id: "mock-week-1-legend",
    category: "Player ID",
    difficulty: "easy",
    prompt: "Who is this football legend?",
    context: "Mock image-led player ID.",
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
      alt: "Football legend in a Portugal kit.",
      credit: "Mock photo",
    },
    options: [
      { id: "messi", label: "Lionel Messi", hint: "Argentina" },
      { id: "neymar", label: "Neymar Jr.", hint: "Brazil" },
      { id: "ronaldo", label: "Cristiano Ronaldo", hint: "Portugal" },
      { id: "mbappe", label: "Kylian Mbappe", hint: "France" },
    ],
    correctOptionId: "ronaldo",
    explanation: "The mock photo points to Ronaldo.",
    tags: ["players", "photo", "national-team"],
  },
  {
    id: "mock-week-1-leverkusen",
    category: "Club context",
    difficulty: "medium",
    prompt: "Which club owned a modern unbeaten Bundesliga run?",
    context: "Mock Bundesliga context.",
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
      alt: "Footballers under stadium lights.",
      credit: "Mock image",
    },
    options: [
      { id: "dortmund", label: "Borussia Dortmund", hint: "BVB" },
      { id: "leverkusen", label: "Bayer Leverkusen", hint: "Werkself" },
      { id: "wolfsburg", label: "Wolfsburg", hint: "Lower Saxony" },
      { id: "leipzig", label: "RB Leipzig", hint: "Saxony" },
    ],
    correctOptionId: "leverkusen",
    explanation: "Leverkusen is the intended Bundesliga signal.",
    tags: ["bundesliga", "clubs", "form"],
  },
  {
    id: "mock-week-1-market-value",
    category: "Market value",
    difficulty: "advanced",
    prompt: "Which profile carries higher market value?",
    context: "Mock market-value signal.",
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
    explanation: "Age, scarcity, and resale value favour the winger.",
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
      context: "Mock completed match result.",
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
      explanation: "Arsenal is the mock winner.",
      tags: ["recent-results", "premier-league", "clubs"],
    },
    {
      id: "mock-pulse-player-form",
      category: "Player form",
      difficulty: "medium",
      prompt: "Which profile triggers a form watch?",
      context: "Mock normalized player-form signal.",
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
          hint: "3 G/A in 2",
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
      explanation: "Recent goal involvements are the strongest form signal.",
      tags: ["players", "form", "text-only"],
    },
    {
      id: "mock-pulse-table-movement",
      category: "Table movement",
      difficulty: "advanced",
      prompt: "What hook fits a jump from 7th to 4th?",
      context: "Mock standings movement.",
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
        alt: "Football analysis room.",
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
      explanation: "Fourth place points to the Champions League race.",
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
    hint: "Results, scorers",
  },
  {
    id: "transfers",
    label: "Transfers",
    hint: "Moves and rumours",
  },
  {
    id: "market-values",
    label: "Market values",
    hint: "Who is worth more",
  },
  {
    id: "national-team",
    label: "National team",
    hint: "Country questions",
  },
];
