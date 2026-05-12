import { describe, expect, it } from "vitest";
import {
  buildFanProfile,
  classifyKnowledge,
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
