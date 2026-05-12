import type { ScorePrediction } from "../../domain/prediction";

const STORAGE_KEY = "footy-guess.local-predictions.v1";
const STORAGE_VERSION = 1;

interface LocalPredictionRecord {
  version: typeof STORAGE_VERSION;
  predictionsByFixtureId: Record<string, ScorePrediction>;
}

export function getBrowserPredictionStorage() {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function readLocalScorePrediction(
  storage: Storage | undefined,
  fixtureId: string,
) {
  const record = readRecord(storage);

  return record?.predictionsByFixtureId[fixtureId];
}

export function saveLocalScorePrediction(
  storage: Storage | undefined,
  prediction: ScorePrediction,
) {
  if (!storage) {
    return false;
  }

  try {
    const currentRecord = readRecord(storage) ?? createEmptyRecord();
    const nextRecord: LocalPredictionRecord = {
      version: STORAGE_VERSION,
      predictionsByFixtureId: {
        ...currentRecord.predictionsByFixtureId,
        [prediction.fixtureId]: prediction,
      },
    };

    storage.setItem(STORAGE_KEY, JSON.stringify(nextRecord));

    return true;
  } catch {
    return false;
  }
}

export function clearLocalScorePrediction(
  storage: Storage | undefined,
  fixtureId: string,
) {
  if (!storage) {
    return false;
  }

  try {
    const currentRecord = readRecord(storage);

    if (!currentRecord) {
      return true;
    }

    const predictionsByFixtureId = {
      ...currentRecord.predictionsByFixtureId,
    };
    delete predictionsByFixtureId[fixtureId];

    const nextRecord: LocalPredictionRecord = {
      version: STORAGE_VERSION,
      predictionsByFixtureId,
    };

    storage.setItem(STORAGE_KEY, JSON.stringify(nextRecord));

    return true;
  } catch {
    return false;
  }
}

function readRecord(storage: Storage | undefined) {
  if (!storage) {
    return undefined;
  }

  try {
    const value = storage.getItem(STORAGE_KEY);

    if (!value) {
      return undefined;
    }

    const parsedValue: unknown = JSON.parse(value);

    if (!isLocalPredictionRecord(parsedValue)) {
      return undefined;
    }

    return parsedValue;
  } catch {
    return undefined;
  }
}

function createEmptyRecord(): LocalPredictionRecord {
  return {
    version: STORAGE_VERSION,
    predictionsByFixtureId: {},
  };
}

function isLocalPredictionRecord(
  value: unknown,
): value is LocalPredictionRecord {
  if (!isPlainObject(value)) {
    return false;
  }

  if (value.version !== STORAGE_VERSION) {
    return false;
  }

  if (!isPlainObject(value.predictionsByFixtureId)) {
    return false;
  }

  return Object.values(value.predictionsByFixtureId).every(isScorePrediction);
}

function isScorePrediction(value: unknown): value is ScorePrediction {
  if (!isPlainObject(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.userId === "string" &&
    typeof value.fixtureId === "string" &&
    typeof value.submittedAt === "string" &&
    isScoreLine(value.score)
  );
}

function isScoreLine(value: unknown) {
  if (!isPlainObject(value)) {
    return false;
  }

  return isStoredGoalValue(value.home) && isStoredGoalValue(value.away);
}

function isStoredGoalValue(value: unknown) {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 12
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
