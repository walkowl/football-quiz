import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { DataSource } from "../domain/content";
import { localMockQuizPacks } from "./mockFootballData";
import {
  mockPredictionFixtures,
  mockPredictionMembers,
  mockScorePredictions,
} from "./mockPredictionData";

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
        expectProviderReadyMockSource(question.source);
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

  it("keeps local continuation packs available for Home routes", () => {
    expect(localMockQuizPacks.map((pack) => pack.id)).toEqual(
      expect.arrayContaining(["weekly-pulse", "daily-matchday"]),
    );
  });

  it("keeps referenced mock media present, accessible, and lightweight", () => {
    const mediaItems = allQuestions.flatMap((question) =>
      question.media ? [question.media] : [],
    );

    expect(mediaItems.length).toBeGreaterThan(0);

    for (const media of mediaItems) {
      expect(media.src).toMatch(/^\/mock-media\/.+\.(jpeg|jpg|png|svg)$/);

      const mediaPath = join(process.cwd(), "public", media.src.slice(1));

      expect(existsSync(mediaPath)).toBe(true);
      expect(statSync(mediaPath).size).toBeLessThanOrEqual(150_000);
    }
  });

  it("keeps prediction fixtures provider-shaped before real data", () => {
    const fixtureIds = new Set<string>();
    const teamIds = new Set<string>();

    for (const fixture of mockPredictionFixtures) {
      expect(fixtureIds.has(fixture.id)).toBe(false);
      fixtureIds.add(fixture.id);
      teamIds.add(fixture.homeTeam.id);
      teamIds.add(fixture.awayTeam.id);

      expect(fixture.homeTeam.id).not.toBe(fixture.awayTeam.id);
      expect(fixture.homeTeam.shortName).toMatch(/^[A-Z]{3}$/);
      expect(fixture.awayTeam.shortName).toMatch(/^[A-Z]{3}$/);
      expect(Date.parse(fixture.kickoffAt)).not.toBeNaN();
      expect(Date.parse(fixture.lockAt)).not.toBeNaN();
      expect(Date.parse(fixture.lockAt)).toBeLessThanOrEqual(
        Date.parse(fixture.kickoffAt),
      );
      expect(fixture.source.kind).toBe("mock");
      expectProviderReadyMockSource(fixture.source);
      expect(fixture.freshness.validUntil).not.toHaveLength(0);

      if (fixture.status === "completed") {
        expect(fixture.finalScore).toBeDefined();
        expect(fixture.settledAt).toBeDefined();
        expect(Date.parse(fixture.settledAt ?? "")).toBeGreaterThanOrEqual(
          Date.parse(fixture.kickoffAt),
        );
      } else {
        expect(fixture.finalScore).toBeUndefined();
      }
    }

    expect(
      mockPredictionFixtures.some((fixture) => fixture.status === "completed"),
    ).toBe(true);
    expect(
      mockPredictionFixtures.some((fixture) => fixture.status === "scheduled"),
    ).toBe(true);
    expect(teamIds.size).toBeGreaterThanOrEqual(4);
  });

  it("keeps mock prediction picks connected to fixtures and members", () => {
    const fixtureIds = new Set(
      mockPredictionFixtures.map((fixture) => fixture.id),
    );
    const memberIds = new Set(
      mockPredictionMembers.map((member) => member.userId),
    );
    const predictionIds = new Set<string>();

    for (const prediction of mockScorePredictions) {
      expect(predictionIds.has(prediction.id)).toBe(false);
      predictionIds.add(prediction.id);

      expect(fixtureIds.has(prediction.fixtureId)).toBe(true);
      expect(memberIds.has(prediction.userId)).toBe(true);
      expect(Date.parse(prediction.submittedAt)).not.toBeNaN();
      expect(prediction.score.home).toBeGreaterThanOrEqual(0);
      expect(prediction.score.away).toBeGreaterThanOrEqual(0);
      expect(prediction.score.home).toBeLessThanOrEqual(12);
      expect(prediction.score.away).toBeLessThanOrEqual(12);
      expect(Number.isInteger(prediction.score.home)).toBe(true);
      expect(Number.isInteger(prediction.score.away)).toBe(true);
    }
  });
});

function expectProviderReadyMockSource(source: DataSource) {
  expect(source.kind).toBe("mock");
  expect(source.label).not.toHaveLength(0);
  expect(source.confidence).toBe("mock");
  expect(Date.parse(source.retrievedAt)).not.toBeNaN();
}
