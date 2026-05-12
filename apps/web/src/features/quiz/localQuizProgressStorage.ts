import type { AnswerMap } from "../../domain/quiz";

const STORAGE_KEY = "footy-guess.local-quiz-progress.v1";
const STORAGE_VERSION = 1;
const MAX_QUESTION_INDEX = 50;
const MAX_SELECTED_TOPICS = 20;

export interface LocalQuizProgress {
  activePackId: string;
  answers: AnswerMap;
  questionIndex: number;
  selectedTopics: string[];
  updatedAt: string;
}

interface LocalQuizProgressRecord {
  version: typeof STORAGE_VERSION;
  progress: LocalQuizProgress;
}

export function getBrowserQuizProgressStorage() {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function readLocalQuizProgress(storage: Storage | undefined) {
  return readRecord(storage)?.progress;
}

export function saveLocalQuizProgress(
  storage: Storage | undefined,
  progress: LocalQuizProgress,
) {
  if (!storage) {
    return false;
  }

  try {
    const record: LocalQuizProgressRecord = {
      version: STORAGE_VERSION,
      progress,
    };

    storage.setItem(STORAGE_KEY, JSON.stringify(record));

    return true;
  } catch {
    return false;
  }
}

export function clearLocalQuizProgress(storage: Storage | undefined) {
  if (!storage) {
    return false;
  }

  try {
    storage.removeItem(STORAGE_KEY);
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

    if (!isLocalQuizProgressRecord(parsedValue)) {
      return undefined;
    }

    return parsedValue;
  } catch {
    return undefined;
  }
}

function isLocalQuizProgressRecord(
  value: unknown,
): value is LocalQuizProgressRecord {
  if (!isPlainObject(value)) {
    return false;
  }

  if (value.version !== STORAGE_VERSION) {
    return false;
  }

  return isLocalQuizProgress(value.progress);
}

function isLocalQuizProgress(value: unknown): value is LocalQuizProgress {
  if (!isPlainObject(value)) {
    return false;
  }

  return (
    typeof value.activePackId === "string" &&
    typeof value.updatedAt === "string" &&
    isQuestionIndex(value.questionIndex) &&
    isAnswerMap(value.answers) &&
    isSelectedTopics(value.selectedTopics)
  );
}

function isQuestionIndex(value: unknown) {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= MAX_QUESTION_INDEX
  );
}

function isAnswerMap(value: unknown): value is AnswerMap {
  if (!isPlainObject(value)) {
    return false;
  }

  return Object.entries(value).every(
    ([questionId, optionId]) =>
      typeof questionId === "string" && typeof optionId === "string",
  );
}

function isSelectedTopics(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length <= MAX_SELECTED_TOPICS &&
    value.every((topicId) => typeof topicId === "string")
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
