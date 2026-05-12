import { describe, expect, it } from "vitest";
import {
  mockPredictionFixtures,
  mockPredictionMembers,
  mockScorePredictions,
} from "../data/mockPredictionData";
import {
  buildPredictionLeaderboard,
  getPredictionLockState,
  getScoreOutcome,
  scorePrediction,
  type PredictionFixture,
  type ScorePrediction,
} from "./prediction";

const completedFixture = mustFindFixture("mock-pl-ars-tot-2026-05-09");

describe("prediction domain", () => {
  it("scores an exact match prediction", () => {
    const prediction = mustFindPrediction("pred-ada-ars-tot");
    const result = scorePrediction(completedFixture, prediction);

    expect(result).toMatchObject({
      status: "scored",
      points: 5,
      exactScore: true,
      correctOutcome: true,
      correctGoalDifference: true,
    });
  });

  it("scores correct outcome and goal difference without exact score", () => {
    const prediction = mustFindPrediction("pred-leo-ars-tot");
    const result = scorePrediction(completedFixture, prediction);

    expect(result).toMatchObject({
      status: "scored",
      points: 3,
      exactScore: false,
      correctOutcome: true,
      correctGoalDifference: true,
    });
  });

  it("keeps scheduled fixtures pending until a final score exists", () => {
    const scheduledFixture = mustFindFixture("mock-serie-a-nap-int-2026-05-16");
    const prediction = mustFindPrediction("pred-maya-nap-int");

    expect(scorePrediction(scheduledFixture, prediction)).toMatchObject({
      status: "pending",
      points: 0,
      reason: "Fixture is not complete yet.",
    });
  });

  it("voids postponed and cancelled fixtures", () => {
    const prediction = mustFindPrediction("pred-maya-nap-int");
    const postponedFixture: PredictionFixture = {
      ...mustFindFixture("mock-serie-a-nap-int-2026-05-16"),
      status: "postponed",
    };

    expect(scorePrediction(postponedFixture, prediction)).toMatchObject({
      status: "void",
      points: 0,
      reason: "Fixture was not settled.",
    });
  });

  it("rejects predictions submitted at or after lock time", () => {
    const latePrediction: ScorePrediction = {
      id: "pred-late",
      userId: "ada",
      fixtureId: completedFixture.id,
      submittedAt: completedFixture.lockAt,
      score: {
        home: 2,
        away: 1,
      },
    };

    expect(scorePrediction(completedFixture, latePrediction)).toMatchObject({
      status: "locked",
      points: 0,
      reason: "Prediction was submitted after the lock time.",
    });
  });

  it("reports whether scheduled prediction windows are open or locked", () => {
    const scheduledFixture = mustFindFixture("mock-serie-a-nap-int-2026-05-16");

    expect(
      getPredictionLockState(scheduledFixture, "2026-05-12T00:00:00.000Z"),
    ).toEqual({
      status: "open",
      lockAt: scheduledFixture.lockAt,
      currentTime: "2026-05-12T00:00:00.000Z",
      reason: "Prediction window is open.",
    });

    expect(
      getPredictionLockState(scheduledFixture, scheduledFixture.lockAt),
    ).toEqual({
      status: "locked",
      lockAt: scheduledFixture.lockAt,
      currentTime: scheduledFixture.lockAt,
      reason: "Prediction window is locked.",
    });
  });

  it("keeps non-scheduled fixtures locked for prediction edits", () => {
    expect(
      getPredictionLockState(completedFixture, "2026-05-08T12:00:00.000Z"),
    ).toMatchObject({
      status: "locked",
      reason: "Prediction window is locked.",
    });
  });

  it("builds a points leaderboard with transparent tiebreakers", () => {
    const leaderboard = buildPredictionLeaderboard({
      fixtures: mockPredictionFixtures,
      members: mockPredictionMembers,
      predictions: mockScorePredictions,
    });

    expect(leaderboard).toEqual([
      {
        userId: "leo",
        displayName: "Leo",
        points: 8,
        exactScores: 1,
        correctOutcomes: 2,
        settledPicks: 2,
        rank: 1,
        betterThan: 67,
      },
      {
        userId: "ada",
        displayName: "Ada",
        points: 5,
        exactScores: 1,
        correctOutcomes: 1,
        settledPicks: 2,
        rank: 2,
        betterThan: 33,
      },
      {
        userId: "maya",
        displayName: "Maya",
        points: 3,
        exactScores: 0,
        correctOutcomes: 1,
        settledPicks: 1,
        rank: 3,
        betterThan: 0,
      },
    ]);
  });

  it("does not count tied prediction entries as beaten players", () => {
    const tiedLeaderboard = buildPredictionLeaderboard({
      fixtures: [completedFixture],
      members: [
        { userId: "ada", displayName: "Ada" },
        { userId: "leo", displayName: "Leo" },
      ],
      predictions: [
        mustFindPrediction("pred-ada-ars-tot"),
        {
          ...mustFindPrediction("pred-ada-ars-tot"),
          id: "pred-leo-copy",
          userId: "leo",
        },
      ],
    });

    expect(tiedLeaderboard).toEqual([
      expect.objectContaining({
        userId: "ada",
        rank: 1,
        betterThan: 0,
      }),
      expect.objectContaining({
        userId: "leo",
        rank: 1,
        betterThan: 0,
      }),
    ]);
  });

  it("derives match outcomes without odds or wager language", () => {
    expect(getScoreOutcome({ home: 2, away: 1 })).toBe("home");
    expect(getScoreOutcome({ home: 1, away: 1 })).toBe("draw");
    expect(getScoreOutcome({ home: 0, away: 3 })).toBe("away");
  });

  it("throws when scoring a prediction against the wrong fixture", () => {
    const wrongFixture = mustFindFixture("mock-ucl-mci-rma-2026-05-10");
    const prediction = mustFindPrediction("pred-ada-ars-tot");

    expect(() => scorePrediction(wrongFixture, prediction)).toThrow(
      "Prediction fixture mismatch",
    );
  });
});

function mustFindFixture(id: string) {
  const fixture = mockPredictionFixtures.find(
    (candidate) => candidate.id === id,
  );

  if (!fixture) {
    throw new Error(`Missing fixture ${id}`);
  }

  return fixture;
}

function mustFindPrediction(id: string) {
  const prediction = mockScorePredictions.find(
    (candidate) => candidate.id === id,
  );

  if (!prediction) {
    throw new Error(`Missing prediction ${id}`);
  }

  return prediction;
}
