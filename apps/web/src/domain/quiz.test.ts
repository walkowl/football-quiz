import { describe, expect, it } from "vitest";
import {
  buildPlayerBenchmark,
  buildFanProfile,
  classifyKnowledge,
  compareQuizPerformanceWithPlayers,
  evaluateQuiz,
  getFeedback,
  recommendPacks,
} from "./quiz";
import { mockQuestions } from "../data/mockFootballData";

describe("quiz domain", () => {
  it("classifies a perfect weighted score as advanced", () => {
    const answers = Object.fromEntries(
      mockQuestions.map((question) => [question.id, question.correctOptionId]),
    );

    expect(evaluateQuiz(mockQuestions, answers)).toMatchObject({
      correctCount: 3,
      totalQuestions: 3,
      level: "Advanced Fan",
    });
  });

  it("classifies an empty score as newbie", () => {
    expect(evaluateQuiz(mockQuestions, {})).toMatchObject({
      correctCount: 0,
      level: "Newbie",
    });
  });

  it("uses weighted thresholds for knowledge levels", () => {
    expect(classifyKnowledge(3, 6)).toBe("Intermediate Fan");
    expect(classifyKnowledge(5, 6)).toBe("Daily Follower");
  });

  it("compares quiz performance against a player benchmark", () => {
    const answers = Object.fromEntries(
      mockQuestions.map((question) => [question.id, question.correctOptionId]),
    );

    expect(compareQuizPerformanceWithPlayers(mockQuestions, answers)).toEqual({
      betterThanPercent: 94,
      label: "Better than 94% of players",
      shortLabel: "Better than 94%",
    });
  });

  it("keeps the player benchmark pending before an answer exists", () => {
    expect(buildPlayerBenchmark(undefined)).toMatchObject({
      betterThanPercent: null,
      label: "Benchmark pending",
    });
    expect(compareQuizPerformanceWithPlayers(mockQuestions, {})).toMatchObject({
      betterThanPercent: null,
      shortLabel: "Benchmark pending",
    });
  });

  it("returns useful feedback for a wrong answer", () => {
    const firstQuestion = mockQuestions[0];

    if (!firstQuestion) {
      throw new Error("Expected at least one mock question");
    }

    const feedback = getFeedback(firstQuestion, "messi");

    expect(feedback).toContain("Not this time");
    expect(feedback).toContain("Cristiano Ronaldo");
  });

  it("builds a fan profile from correct answers and selected topics", () => {
    const answers = Object.fromEntries(
      mockQuestions.map((question) => [question.id, question.correctOptionId]),
    );

    const profile = buildFanProfile(mockQuestions, answers, [
      "national-team",
      "market-values",
    ]);

    expect(profile.accuracy).toBe(100);
    expect(profile.level).toBe("Advanced Fan");
    expect(profile.strongestSignals).toContain("national-team");
  });

  it("prioritizes recommended packs from selected topics", () => {
    const packs = recommendPacks({
      accuracy: 67,
      level: "Intermediate Fan",
      selectedTopics: ["market-values"],
      strongestSignals: ["transfers"],
    });

    expect(packs[0]?.id).toBe("transfer-radar");
  });
});
