import { beforeEach, describe, expect, it } from "vitest";
import type { ScorePrediction } from "../../domain/prediction";
import {
  readLocalScorePrediction,
  saveLocalScorePrediction,
} from "./localPredictionStorage";

const prediction: ScorePrediction = {
  id: "local-fixture-a",
  fixtureId: "fixture-a",
  userId: "local-user",
  submittedAt: "2026-05-12T00:00:00.000Z",
  score: {
    home: 2,
    away: 1,
  },
};

describe("local prediction storage", () => {
  let storage: Storage;

  beforeEach(() => {
    storage = createMemoryStorage();
  });

  it("saves and restores a prediction by fixture", () => {
    expect(saveLocalScorePrediction(storage, prediction)).toBe(true);

    expect(readLocalScorePrediction(storage, prediction.fixtureId)).toEqual(
      prediction,
    );
  });

  it("keeps predictions for other fixtures when saving a new one", () => {
    const otherPrediction: ScorePrediction = {
      ...prediction,
      id: "local-fixture-b",
      fixtureId: "fixture-b",
      score: {
        home: 0,
        away: 0,
      },
    };

    saveLocalScorePrediction(storage, prediction);
    saveLocalScorePrediction(storage, otherPrediction);

    expect(readLocalScorePrediction(storage, prediction.fixtureId)).toEqual(
      prediction,
    );
    expect(
      readLocalScorePrediction(storage, otherPrediction.fixtureId),
    ).toEqual(otherPrediction);
  });

  it("ignores corrupt, old, or malformed records", () => {
    storage.setItem("footy-guess.local-predictions.v1", "{");
    expect(
      readLocalScorePrediction(storage, prediction.fixtureId),
    ).toBeUndefined();

    storage.setItem(
      "footy-guess.local-predictions.v1",
      JSON.stringify({
        version: 0,
        predictionsByFixtureId: {
          [prediction.fixtureId]: prediction,
        },
      }),
    );
    expect(
      readLocalScorePrediction(storage, prediction.fixtureId),
    ).toBeUndefined();

    storage.setItem(
      "footy-guess.local-predictions.v1",
      JSON.stringify({
        version: 1,
        predictionsByFixtureId: {
          [prediction.fixtureId]: {
            ...prediction,
            score: {
              home: -1,
              away: 1,
            },
          },
        },
      }),
    );
    expect(
      readLocalScorePrediction(storage, prediction.fixtureId),
    ).toBeUndefined();
  });

  it("reports unavailable storage without throwing", () => {
    expect(saveLocalScorePrediction(undefined, prediction)).toBe(false);
    expect(
      readLocalScorePrediction(undefined, prediction.fixtureId),
    ).toBeUndefined();
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
    removeItem(key: string) {
      values.delete(key);
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
  };
}
