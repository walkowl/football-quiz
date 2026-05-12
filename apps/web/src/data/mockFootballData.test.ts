import { describe, expect, it } from "vitest";
import { localMockQuizPacks } from "./mockFootballData";

const allQuestions = localMockQuizPacks.flatMap((pack) => pack.questions);

describe("mock football data", () => {
  it("keeps local quiz packs answerable and attribution-ready", () => {
    const questionIds = new Set<string>();

    for (const pack of localMockQuizPacks) {
      expect(pack.questions.length).toBeGreaterThanOrEqual(3);

      for (const question of pack.questions) {
        expect(questionIds.has(question.id)).toBe(false);
        questionIds.add(question.id);

        expect(question.options).toHaveLength(4);
        expect(
          question.options.some(
            (option) => option.id === question.correctOptionId,
          ),
        ).toBe(true);
        expect(question.context).not.toHaveLength(0);
        expect(question.explanation).not.toHaveLength(0);
        expect(question.source.label).not.toHaveLength(0);
        expect(question.freshness.validUntil).not.toHaveLength(0);

        if (question.media) {
          expect(question.media.alt).not.toHaveLength(0);
          expect(question.media.credit).not.toHaveLength(0);
        }
      }
    }
  });

  it("covers the provider-shaped mock content types we need before real data", () => {
    const categories = new Set(
      allQuestions.map((question) => question.category),
    );
    const tags = new Set(allQuestions.flatMap((question) => question.tags));

    expect([...categories]).toEqual(
      expect.arrayContaining([
        "Player ID",
        "Recent result",
        "Player form",
        "Market value",
      ]),
    );
    expect([...tags]).toEqual(
      expect.arrayContaining([
        "players",
        "recent-results",
        "market-values",
        "tables",
      ]),
    );
    expect(allQuestions.some((question) => !question.media)).toBe(true);
  });
});
