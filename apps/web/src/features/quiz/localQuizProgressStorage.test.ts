import { beforeEach, describe, expect, it } from "vitest";
import type { LocalQuizProgress } from "./localQuizProgressStorage";
import {
  clearLocalQuizProgress,
  readLocalQuizProgress,
  saveLocalQuizProgress,
} from "./localQuizProgressStorage";

const progress: LocalQuizProgress = {
  activePackId: "mock-legend-challenge",
  answers: {
    "mock-week-1-legend": "ronaldo",
  },
  completedAttempts: [
    {
      accuracy: 100,
      completedAt: "2026-05-12T00:00:00.000Z",
      correctCount: 3,
      level: "Advanced Fan",
      packId: "mock-legend-challenge",
      packTitle: "Legend Challenge",
      strongestSignals: ["transfers", "advanced"],
      totalQuestions: 3,
    },
  ],
  questionIndex: 1,
  selectedTopics: ["premier-league", "transfers"],
  updatedAt: "2026-05-12T00:00:00.000Z",
};

describe("local quiz progress storage", () => {
  let storage: Storage;

  beforeEach(() => {
    storage = createMemoryStorage();
  });

  it("saves and restores quiz progress", () => {
    expect(saveLocalQuizProgress(storage, progress)).toBe(true);

    expect(readLocalQuizProgress(storage)).toEqual(progress);
  });

  it("replaces older progress with the latest state", () => {
    const nextProgress: LocalQuizProgress = {
      ...progress,
      answers: {
        ...progress.answers,
        "mock-week-1-leverkusen": "leverkusen",
      },
      questionIndex: 2,
    };

    saveLocalQuizProgress(storage, progress);
    saveLocalQuizProgress(storage, nextProgress);

    expect(readLocalQuizProgress(storage)).toEqual(nextProgress);
  });

  it("clears local quiz progress", () => {
    saveLocalQuizProgress(storage, progress);

    expect(clearLocalQuizProgress(storage)).toBe(true);

    expect(readLocalQuizProgress(storage)).toBeUndefined();

    storage.setItem(
      "footy-guess.local-quiz-progress.v1",
      JSON.stringify({
        version: 1,
        progress: {
          ...progress,
          completedAttempts: [
            {
              ...progress.completedAttempts![0],
              accuracy: 101,
            },
          ],
        },
      }),
    );
    expect(readLocalQuizProgress(storage)).toBeUndefined();
  });

  it("ignores corrupt, old, or malformed records", () => {
    storage.setItem("footy-guess.local-quiz-progress.v1", "{");
    expect(readLocalQuizProgress(storage)).toBeUndefined();

    storage.setItem(
      "footy-guess.local-quiz-progress.v1",
      JSON.stringify({
        version: 0,
        progress,
      }),
    );
    expect(readLocalQuizProgress(storage)).toBeUndefined();

    storage.setItem(
      "footy-guess.local-quiz-progress.v1",
      JSON.stringify({
        version: 1,
        progress: {
          ...progress,
          questionIndex: -1,
        },
      }),
    );
    expect(readLocalQuizProgress(storage)).toBeUndefined();

    storage.setItem(
      "footy-guess.local-quiz-progress.v1",
      JSON.stringify({
        version: 1,
        progress: {
          ...progress,
          answers: {
            "mock-week-1-legend": 7,
          },
        },
      }),
    );
    expect(readLocalQuizProgress(storage)).toBeUndefined();
  });

  it("reports unavailable storage without throwing", () => {
    expect(saveLocalQuizProgress(undefined, progress)).toBe(false);
    expect(clearLocalQuizProgress(undefined)).toBe(false);
    expect(readLocalQuizProgress(undefined)).toBeUndefined();
  });
});

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear() {
      values.clear();
    },
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(values.keys())[index] ?? null;
    },
    removeItem(key) {
      values.delete(key);
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };
}
