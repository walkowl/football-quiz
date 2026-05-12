import type { QuizQuestion, TopicOption } from "../domain/quiz";

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
    media: {
      kind: "image",
      src: "/mock-media/transfer-room.svg",
      alt: "A football transfer room with a player silhouette and valuation board.",
      credit: "Mock image",
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
    tags: ["market-values", "transfers", "advanced"],
  },
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
