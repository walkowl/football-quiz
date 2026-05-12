import { describe, expect, it } from "vitest";
import { classifyKnowledge, evaluateQuiz, getFeedback } from "./quiz";
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
});
