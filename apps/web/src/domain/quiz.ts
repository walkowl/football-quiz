export type Difficulty = "easy" | "medium" | "advanced";

export type KnowledgeLevel =
  | "Newbie"
  | "Casual Fan"
  | "Intermediate Fan"
  | "Daily Follower"
  | "Advanced Fan";

export interface QuizOption {
  id: string;
  label: string;
  hint?: string;
}

export interface QuizMedia {
  kind: "image";
  src: string;
  alt: string;
  credit: string;
}

export interface QuizQuestion {
  id: string;
  category: string;
  difficulty: Difficulty;
  prompt: string;
  context: string;
  freshness: {
    label: string;
    validUntil: string;
  };
  source: {
    kind: "mock" | "provider";
    label: string;
  };
  media?: QuizMedia;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
  tags: string[];
}

export interface QuizPack {
  id: string;
  title: string;
  subtitle: string;
  questions: QuizQuestion[];
}

export interface TopicOption {
  id: string;
  label: string;
  hint: string;
}

export type AnswerMap = Record<string, string>;

export interface QuizOutcome {
  correctCount: number;
  totalQuestions: number;
  weightedScore: number;
  level: KnowledgeLevel;
}

export interface PlayerBenchmark {
  betterThanPercent: number | null;
  label: string;
  shortLabel: string;
}

export interface FanProfile {
  level: KnowledgeLevel;
  accuracy: number;
  strongestSignals: string[];
  selectedTopics: string[];
}

export interface RecommendedPack {
  id: string;
  title: string;
  description: string;
  freshness: string;
}

const difficultyWeight: Record<Difficulty, number> = {
  easy: 1,
  medium: 2,
  advanced: 3,
};
const localPlayerBenchmarkRatios = [
  0, 0.12, 0.18, 0.25, 0.33, 0.42, 0.5, 0.58, 0.64, 0.7, 0.76, 0.82, 0.88, 0.92,
  0.96, 1,
];

export function isCorrect(question: QuizQuestion, selectedOptionId: string) {
  return question.correctOptionId === selectedOptionId;
}

export function evaluateQuiz(
  questions: QuizQuestion[],
  answers: AnswerMap,
): QuizOutcome {
  const maxScore = questions.reduce(
    (total, question) => total + difficultyWeight[question.difficulty],
    0,
  );

  const weightedScore = questions.reduce((total, question) => {
    const selectedOptionId = answers[question.id];

    if (!selectedOptionId || !isCorrect(question, selectedOptionId)) {
      return total;
    }

    return total + difficultyWeight[question.difficulty];
  }, 0);

  const correctCount = questions.filter((question) => {
    const selectedOptionId = answers[question.id];
    return selectedOptionId ? isCorrect(question, selectedOptionId) : false;
  }).length;

  return {
    correctCount,
    totalQuestions: questions.length,
    weightedScore,
    level: classifyKnowledge(weightedScore, maxScore),
  };
}

export function classifyKnowledge(
  weightedScore: number,
  maxScore: number,
): KnowledgeLevel {
  if (maxScore <= 0) {
    return "Newbie";
  }

  const ratio = weightedScore / maxScore;

  if (ratio >= 0.95) {
    return "Advanced Fan";
  }

  if (ratio >= 0.7) {
    return "Daily Follower";
  }

  if (ratio >= 0.45) {
    return "Intermediate Fan";
  }

  if (ratio >= 0.2) {
    return "Casual Fan";
  }

  return "Newbie";
}

export function compareQuizPerformanceWithPlayers(
  questions: QuizQuestion[],
  answers: AnswerMap,
): PlayerBenchmark {
  const attemptedQuestions = questions.filter(
    (question) => answers[question.id],
  );

  if (attemptedQuestions.length === 0) {
    return buildPlayerBenchmark(undefined);
  }

  const attemptedMaxScore = attemptedQuestions.reduce(
    (total, question) => total + difficultyWeight[question.difficulty],
    0,
  );
  const attemptedScore = attemptedQuestions.reduce((total, question) => {
    const selectedOptionId = answers[question.id];

    return selectedOptionId && isCorrect(question, selectedOptionId)
      ? total + difficultyWeight[question.difficulty]
      : total;
  }, 0);

  return buildPlayerBenchmark(attemptedScore / attemptedMaxScore);
}

export function buildPlayerBenchmark(
  performanceRatio: number | undefined,
): PlayerBenchmark {
  if (performanceRatio === undefined || !Number.isFinite(performanceRatio)) {
    return {
      betterThanPercent: null,
      label: "Benchmark pending",
      shortLabel: "Benchmark pending",
    };
  }

  const normalizedRatio = Math.min(Math.max(performanceRatio, 0), 1);
  const betterThanPercent = Math.round(
    (localPlayerBenchmarkRatios.filter(
      (benchmarkRatio) => normalizedRatio > benchmarkRatio,
    ).length /
      localPlayerBenchmarkRatios.length) *
      100,
  );

  return {
    betterThanPercent,
    label: `Better than ${betterThanPercent}% of players`,
    shortLabel: `Better than ${betterThanPercent}%`,
  };
}

export function getFeedback(question: QuizQuestion, selectedOptionId: string) {
  if (isCorrect(question, selectedOptionId)) {
    return `Correct. ${question.explanation}`;
  }

  const correctOption = question.options.find(
    (option) => option.id === question.correctOptionId,
  );

  return `Not this time. The answer is ${correctOption?.label ?? "unknown"}. ${
    question.explanation
  }`;
}

export function recommendationCopy(outcome: QuizOutcome) {
  switch (outcome.level) {
    case "Advanced Fan":
      return "Start with current form, market-value traps, and transfer logic. You can handle the sharp stuff.";
    case "Daily Follower":
      return "Mix results, tables, transfers, and one difficult player-value question each session.";
    case "Intermediate Fan":
      return "Anchor the next quiz around your favourite league, then add one weekly news question.";
    case "Casual Fan":
      return "Keep the next quiz around famous players, big clubs, and national-team moments.";
    case "Newbie":
      return "Start with superstar players, major clubs, and simple match-result questions.";
  }
}

export function buildFanProfile(
  questions: QuizQuestion[],
  answers: AnswerMap,
  selectedTopics: string[],
): FanProfile {
  const outcome = evaluateQuiz(questions, answers);
  const correctTags = questions.flatMap((question) => {
    const selectedOptionId = answers[question.id];

    if (!selectedOptionId || !isCorrect(question, selectedOptionId)) {
      return [];
    }

    return question.tags;
  });
  const strongestSignals = rankTags([...correctTags, ...selectedTopics]).slice(
    0,
    3,
  );

  return {
    level: outcome.level,
    accuracy:
      outcome.totalQuestions === 0
        ? 0
        : Math.round((outcome.correctCount / outcome.totalQuestions) * 100),
    strongestSignals:
      strongestSignals.length > 0 ? strongestSignals : ["starter-pack"],
    selectedTopics,
  };
}

export function recommendPacks(profile: FanProfile): RecommendedPack[] {
  const packs: RecommendedPack[] = [
    {
      id: "weekly-pulse",
      title: "Weekly Pulse",
      description: "Recent results, scorers, table movement, and form traps.",
      freshness: "Refresh weekly",
    },
    {
      id: "transfer-radar",
      title: "Transfer Radar",
      description: "Confirmed moves, rumours, and market-value comparisons.",
      freshness: "Needs provider",
    },
    {
      id: "nation-hook",
      title: "Nation Hook",
      description:
        "National-team players, heroes, and country-first questions.",
      freshness: "Good for onboarding",
    },
  ];

  if (profile.selectedTopics.includes("market-values")) {
    return [packs[1]!, packs[0]!, packs[2]!];
  }

  if (profile.selectedTopics.includes("national-team")) {
    return [packs[2]!, packs[0]!, packs[1]!];
  }

  return packs;
}

function rankTags(tags: string[]) {
  const counts = new Map<string, number>();

  for (const tag of tags) {
    counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort(
      (left, right) => right[1] - left[1] || left[0].localeCompare(right[0]),
    )
    .map(([tag]) => tag);
}
