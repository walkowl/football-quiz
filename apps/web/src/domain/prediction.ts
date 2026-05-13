import type { DataSource, FreshnessMetadata } from "./content";

export type MatchStatus =
  | "scheduled"
  | "locked"
  | "completed"
  | "postponed"
  | "cancelled";

export type ScoreOutcome = "home" | "draw" | "away";

export interface TeamRef {
  id: string;
  name: string;
  shortName: string;
}

export interface ScoreLine {
  home: number;
  away: number;
}

export interface PredictionFixture {
  id: string;
  competition: string;
  season: string;
  matchday: string;
  kickoffAt: string;
  lockAt: string;
  status: MatchStatus;
  homeTeam: TeamRef;
  awayTeam: TeamRef;
  finalScore?: ScoreLine;
  settledAt?: string;
  source: DataSource;
  freshness: FreshnessMetadata;
}

export interface ScorePrediction {
  id: string;
  userId: string;
  fixtureId: string;
  submittedAt: string;
  score: ScoreLine;
}

export interface PredictionLeagueMember {
  userId: string;
  displayName: string;
}

export interface PredictionScoringRules {
  exactScorePoints: number;
  correctOutcomePoints: number;
  correctGoalDifferenceBonus: number;
}

export interface PredictionScoreResult {
  fixtureId: string;
  predictionId: string;
  status: "pending" | "scored" | "locked" | "void";
  points: number;
  exactScore: boolean;
  correctOutcome: boolean;
  correctGoalDifference: boolean;
  reason: string;
}

export interface PredictionLeagueEntry {
  userId: string;
  displayName: string;
  points: number;
  exactScores: number;
  correctOutcomes: number;
  settledPicks: number;
  rank: number;
  betterThan: number;
}

export interface PredictionLockState {
  status: "open" | "locked";
  lockAt: string;
  currentTime: string;
  reason: string;
}

export const defaultPredictionScoringRules: PredictionScoringRules = {
  exactScorePoints: 5,
  correctOutcomePoints: 2,
  correctGoalDifferenceBonus: 1,
};

export function scorePrediction(
  fixture: PredictionFixture,
  prediction: ScorePrediction,
  rules = defaultPredictionScoringRules,
): PredictionScoreResult {
  if (prediction.fixtureId !== fixture.id) {
    throw new Error("Prediction fixture mismatch");
  }

  if (!isPredictionBeforeLock(fixture, prediction)) {
    return buildScoreResult(fixture, prediction, {
      status: "locked",
      reason: "Prediction was submitted after the lock time.",
    });
  }

  if (fixture.status === "cancelled" || fixture.status === "postponed") {
    return buildScoreResult(fixture, prediction, {
      status: "void",
      reason: "Fixture was not settled.",
    });
  }

  if (fixture.status !== "completed" || !fixture.finalScore) {
    return buildScoreResult(fixture, prediction, {
      status: "pending",
      reason: "Fixture is not complete yet.",
    });
  }

  const exactScore = scoresEqual(prediction.score, fixture.finalScore);
  const correctOutcome =
    getScoreOutcome(prediction.score) === getScoreOutcome(fixture.finalScore);
  const correctGoalDifference =
    correctOutcome &&
    goalDifference(prediction.score) === goalDifference(fixture.finalScore);

  const points = exactScore
    ? rules.exactScorePoints
    : correctOutcome
      ? rules.correctOutcomePoints +
        (correctGoalDifference ? rules.correctGoalDifferenceBonus : 0)
      : 0;

  return {
    fixtureId: fixture.id,
    predictionId: prediction.id,
    status: "scored",
    points,
    exactScore,
    correctOutcome,
    correctGoalDifference,
    reason: exactScore
      ? "Exact score."
      : correctOutcome
        ? "Correct match outcome."
        : "Incorrect match outcome.",
  };
}

export function buildPredictionLeaderboard({
  fixtures,
  members,
  predictions,
  rules = defaultPredictionScoringRules,
}: {
  fixtures: PredictionFixture[];
  members: PredictionLeagueMember[];
  predictions: ScorePrediction[];
  rules?: PredictionScoringRules;
}): PredictionLeagueEntry[] {
  const entries = members
    .map((member) => {
      const results = fixtures.flatMap((fixture) => {
        const prediction = selectLatestPredictionBeforeLock(
          fixture,
          predictions.filter((candidate) => candidate.userId === member.userId),
        );

        return prediction ? [scorePrediction(fixture, prediction, rules)] : [];
      });

      return {
        userId: member.userId,
        displayName: member.displayName,
        points: sum(results.map((result) => result.points)),
        exactScores: results.filter((result) => result.exactScore).length,
        correctOutcomes: results.filter((result) => result.correctOutcome)
          .length,
        settledPicks: results.filter((result) => result.status === "scored")
          .length,
      };
    })
    .sort(compareLeaderboardEntries);

  return entries.map((entry) => {
    const betterEntries = entries.filter(
      (candidate) => compareStrength(candidate, entry) < 0,
    ).length;
    const worseEntries = entries.filter(
      (candidate) => compareStrength(entry, candidate) < 0,
    ).length;

    return {
      ...entry,
      rank: betterEntries + 1,
      betterThan:
        entries.length > 0
          ? Math.round((worseEntries / entries.length) * 100)
          : 0,
    };
  });
}

export function getScoreOutcome(score: ScoreLine): ScoreOutcome {
  if (score.home > score.away) {
    return "home";
  }

  if (score.home < score.away) {
    return "away";
  }

  return "draw";
}

export function getPredictionLockState(
  fixture: PredictionFixture,
  currentTime: string,
): PredictionLockState {
  const locked =
    fixture.status !== "scheduled" ||
    Date.parse(currentTime) >= Date.parse(fixture.lockAt);

  return {
    status: locked ? "locked" : "open",
    lockAt: fixture.lockAt,
    currentTime,
    reason: locked
      ? "Prediction window is locked."
      : "Prediction window is open.",
  };
}

export function isPredictionBeforeLock(
  fixture: PredictionFixture,
  prediction: ScorePrediction,
) {
  return Date.parse(prediction.submittedAt) < Date.parse(fixture.lockAt);
}

function buildScoreResult(
  fixture: PredictionFixture,
  prediction: ScorePrediction,
  result: Pick<PredictionScoreResult, "reason" | "status">,
): PredictionScoreResult {
  return {
    fixtureId: fixture.id,
    predictionId: prediction.id,
    status: result.status,
    points: 0,
    exactScore: false,
    correctOutcome: false,
    correctGoalDifference: false,
    reason: result.reason,
  };
}

function selectLatestPredictionBeforeLock(
  fixture: PredictionFixture,
  predictions: ScorePrediction[],
) {
  return predictions
    .filter(
      (prediction) =>
        prediction.fixtureId === fixture.id &&
        isPredictionBeforeLock(fixture, prediction),
    )
    .sort(
      (left, right) =>
        Date.parse(right.submittedAt) - Date.parse(left.submittedAt),
    )[0];
}

function compareLeaderboardEntries(
  left: Pick<
    PredictionLeagueEntry,
    "correctOutcomes" | "displayName" | "exactScores" | "points"
  >,
  right: Pick<
    PredictionLeagueEntry,
    "correctOutcomes" | "displayName" | "exactScores" | "points"
  >,
) {
  return (
    compareStrength(left, right) ||
    left.displayName.localeCompare(right.displayName)
  );
}

function compareStrength(
  left: Pick<
    PredictionLeagueEntry,
    "correctOutcomes" | "exactScores" | "points"
  >,
  right: Pick<
    PredictionLeagueEntry,
    "correctOutcomes" | "exactScores" | "points"
  >,
) {
  return (
    right.points - left.points ||
    right.exactScores - left.exactScores ||
    right.correctOutcomes - left.correctOutcomes
  );
}

function scoresEqual(left: ScoreLine, right: ScoreLine) {
  return left.home === right.home && left.away === right.away;
}

function goalDifference(score: ScoreLine) {
  return score.home - score.away;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}
