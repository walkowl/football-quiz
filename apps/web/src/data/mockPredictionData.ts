import type {
  PredictionFixture,
  PredictionLeagueMember,
  ScorePrediction,
} from "../domain/prediction";

const teams = {
  arsenal: {
    id: "arsenal",
    name: "Arsenal",
    shortName: "ARS",
  },
  tottenham: {
    id: "tottenham",
    name: "Tottenham",
    shortName: "TOT",
  },
  manchesterCity: {
    id: "manchester-city",
    name: "Manchester City",
    shortName: "MCI",
  },
  realMadrid: {
    id: "real-madrid",
    name: "Real Madrid",
    shortName: "RMA",
  },
  napoli: {
    id: "napoli",
    name: "Napoli",
    shortName: "NAP",
  },
  inter: {
    id: "inter",
    name: "Inter",
    shortName: "INT",
  },
} as const;

const localMockFixtureSource: PredictionFixture["source"] = {
  kind: "mock",
  label: "Local mock fixtures",
  retrievedAt: "2026-05-12T09:00:00.000Z",
  confidence: "mock",
};

export const mockPredictionFixtures: PredictionFixture[] = [
  {
    id: "mock-pl-ars-tot-2026-05-09",
    competition: "Premier League",
    season: "2025/26",
    matchday: "Mock week 1",
    kickoffAt: "2026-05-09T16:30:00.000Z",
    lockAt: "2026-05-09T16:30:00.000Z",
    status: "completed",
    homeTeam: teams.arsenal,
    awayTeam: teams.tottenham,
    finalScore: {
      home: 2,
      away: 1,
    },
    settledAt: "2026-05-09T18:28:00.000Z",
    source: localMockFixtureSource,
    freshness: {
      label: "Mock result",
      validUntil: "Replace before beta",
    },
  },
  {
    id: "mock-ucl-mci-rma-2026-05-10",
    competition: "Champions League",
    season: "2025/26",
    matchday: "Mock semifinal",
    kickoffAt: "2026-05-10T19:00:00.000Z",
    lockAt: "2026-05-10T19:00:00.000Z",
    status: "completed",
    homeTeam: teams.manchesterCity,
    awayTeam: teams.realMadrid,
    finalScore: {
      home: 1,
      away: 1,
    },
    settledAt: "2026-05-10T20:58:00.000Z",
    source: localMockFixtureSource,
    freshness: {
      label: "Mock result",
      validUntil: "Replace before beta",
    },
  },
  {
    id: "mock-serie-a-nap-int-2026-05-16",
    competition: "Serie A",
    season: "2025/26",
    matchday: "Mock week 2",
    kickoffAt: "2026-05-16T18:45:00.000Z",
    lockAt: "2026-05-16T18:45:00.000Z",
    status: "scheduled",
    homeTeam: teams.napoli,
    awayTeam: teams.inter,
    source: localMockFixtureSource,
    freshness: {
      label: "Mock fixture",
      validUntil: "Provider required",
    },
  },
];

export const mockPredictionMembers: PredictionLeagueMember[] = [
  {
    userId: "ada",
    displayName: "Ada",
  },
  {
    userId: "leo",
    displayName: "Leo",
  },
  {
    userId: "maya",
    displayName: "Maya",
  },
];

export const mockScorePredictions: ScorePrediction[] = [
  {
    id: "pred-ada-ars-tot",
    userId: "ada",
    fixtureId: "mock-pl-ars-tot-2026-05-09",
    submittedAt: "2026-05-09T12:15:00.000Z",
    score: {
      home: 2,
      away: 1,
    },
  },
  {
    id: "pred-ada-mci-rma",
    userId: "ada",
    fixtureId: "mock-ucl-mci-rma-2026-05-10",
    submittedAt: "2026-05-10T09:00:00.000Z",
    score: {
      home: 2,
      away: 1,
    },
  },
  {
    id: "pred-leo-ars-tot",
    userId: "leo",
    fixtureId: "mock-pl-ars-tot-2026-05-09",
    submittedAt: "2026-05-09T15:45:00.000Z",
    score: {
      home: 3,
      away: 2,
    },
  },
  {
    id: "pred-leo-mci-rma",
    userId: "leo",
    fixtureId: "mock-ucl-mci-rma-2026-05-10",
    submittedAt: "2026-05-10T18:30:00.000Z",
    score: {
      home: 1,
      away: 1,
    },
  },
  {
    id: "pred-maya-ars-tot",
    userId: "maya",
    fixtureId: "mock-pl-ars-tot-2026-05-09",
    submittedAt: "2026-05-09T10:10:00.000Z",
    score: {
      home: 1,
      away: 0,
    },
  },
  {
    id: "pred-maya-nap-int",
    userId: "maya",
    fixtureId: "mock-serie-a-nap-int-2026-05-16",
    submittedAt: "2026-05-15T20:00:00.000Z",
    score: {
      home: 2,
      away: 2,
    },
  },
];
