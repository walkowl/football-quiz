"use client";

import {
  BarChart3,
  CalendarClock,
  Check,
  ChevronRight,
  Circle,
  Flame,
  Home,
  Lock,
  Medal,
  Play,
  RotateCcw,
  Save,
  Settings,
  Shield,
  SlidersHorizontal,
  Trash2,
  Trophy,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import {
  firstRunQuizPack,
  localMockQuizPacks,
  topicOptions,
} from "../../data/mockFootballData";
import {
  mockPredictionFixtures,
  mockPredictionMembers,
  mockScorePredictions,
} from "../../data/mockPredictionData";
import {
  buildPredictionLeaderboard,
  getPredictionLockState,
  type PredictionFixture,
  type PredictionLockState,
  type ScoreLine,
  type ScorePrediction,
} from "../../domain/prediction";
import {
  buildFanProfile,
  evaluateQuiz,
  getFeedback,
  isCorrect,
  recommendPacks,
  recommendationCopy,
  type AnswerMap,
  type QuizMedia,
  type QuizPack,
  type QuizQuestion,
} from "../../domain/quiz";
import {
  clearLocalScorePrediction,
  getBrowserPredictionStorage,
  readLocalScorePrediction,
  saveLocalScorePrediction,
} from "./localPredictionStorage";

const localPackById = new Map(
  localMockQuizPacks.map((pack) => [pack.id, pack]),
);
const localPackIds = new Set(localPackById.keys());
const localPredictionMember = {
  userId: "local-user",
  displayName: "You",
};
const localPredictionSubmittedAt = "2026-05-12T00:00:00.000Z";
const localPredictionClockAt = localPredictionSubmittedAt;
const defaultPredictionDraft: ScoreLine = {
  home: 1,
  away: 1,
};
const scheduledPredictionFixture = mockPredictionFixtures.find(
  (fixture) => fixture.status === "scheduled",
);

type AppView = "play" | "leaderboard";
type PredictionSaveState = "draft" | "saved" | "restored" | "unavailable";

interface PredictionUiState {
  draft: ScoreLine;
  saveState: PredictionSaveState;
  savedPrediction?: ScorePrediction;
}

export function QuizExperience() {
  const [activeView, setActiveView] = useState<AppView>("play");
  const [activePackId, setActivePackId] = useState(firstRunQuizPack.id);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    "premier-league",
    "transfers",
  ]);
  const [predictionUi, setPredictionUi] = useState<PredictionUiState>(
    getInitialPredictionUiState,
  );

  const activePack = localPackById.get(activePackId) ?? firstRunQuizPack;
  const quizQuestions = activePack.questions;
  const currentQuestion = quizQuestions[questionIndex];
  const selectedAnswer = currentQuestion
    ? answers[currentQuestion.id]
    : undefined;
  const isComplete = questionIndex >= quizQuestions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / quizQuestions.length) * 100);
  const displayQuestionNumber = Math.min(
    questionIndex + 1,
    quizQuestions.length,
  );

  const outcome = useMemo(
    () => evaluateQuiz(quizQuestions, answers),
    [answers, quizQuestions],
  );
  const fanProfile = useMemo(
    () => buildFanProfile(quizQuestions, answers, selectedTopics),
    [answers, quizQuestions, selectedTopics],
  );
  const score = outcome.weightedScore * 420;
  const scheduledPredictionLockState = scheduledPredictionFixture
    ? getPredictionLockState(scheduledPredictionFixture, localPredictionClockAt)
    : undefined;

  function startPack(packId: string) {
    setActiveView("play");
    setActivePackId(packId);
    setQuestionIndex(0);
    setAnswers({});
  }

  function selectAnswer(optionId: string) {
    if (!currentQuestion || selectedAnswer) {
      return;
    }

    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [currentQuestion.id]: optionId,
    }));
  }

  function goNext() {
    setQuestionIndex((index) => index + 1);
  }

  function restart() {
    setActiveView("play");
    startPack(activePack.id);
  }

  function toggleTopic(topicId: string) {
    setSelectedTopics((currentTopics) =>
      currentTopics.includes(topicId)
        ? currentTopics.filter((id) => id !== topicId)
        : [...currentTopics, topicId],
    );
  }

  return (
    <main className="app-shell">
      <section
        aria-label="Footy Guess mobile prototype"
        className="phone-frame"
      >
        <div className="phone-status" aria-hidden="true">
          <span>10:09 AM</span>
          <span>5G</span>
        </div>

        <div className="app-bar">
          <Trophy aria-hidden="true" className="title-icon" size={24} />
          <h1 className="app-title">Footy Guess</h1>
          <div className="app-actions">
            <button
              aria-label="Restart quiz"
              className="chrome-button"
              onClick={restart}
              type="button"
            >
              <RotateCcw aria-hidden="true" size={17} />
            </button>
            <button
              aria-label="Settings"
              className="chrome-button"
              type="button"
            >
              <Settings aria-hidden="true" size={17} />
            </button>
          </div>
        </div>

        <section
          className="match-strip"
          aria-label={
            activeView === "play" ? "Quiz progress" : "Prediction league status"
          }
        >
          {activeView === "play" ? (
            <div
              aria-label={`${progress}% complete`}
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={progress}
              className="progress-track"
              role="progressbar"
            >
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          ) : (
            <div className="league-status-track" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          )}
          <div className="match-meta">
            {activeView === "play" ? (
              <>
                <span>
                  {isComplete
                    ? `${activePack.title} done`
                    : `Question ${displayQuestionNumber}/${quizQuestions.length}`}
                </span>
                <strong>00:14</strong>
                <span>Score: {score}</span>
              </>
            ) : (
              <>
                <span>Prediction League</span>
                <strong>Local</strong>
                <span>Rewards locked</span>
              </>
            )}
          </div>
        </section>

        <div className="screen-content">
          {activeView === "leaderboard" ? (
            <PredictionLeagueScreen
              draft={predictionUi.draft}
              fixture={scheduledPredictionFixture}
              lockState={scheduledPredictionLockState}
              onDraftChange={(draft) =>
                setPredictionUi((currentState) => ({
                  ...currentState,
                  draft,
                }))
              }
              onSave={() => {
                if (
                  !scheduledPredictionFixture ||
                  scheduledPredictionLockState?.status === "locked"
                ) {
                  return;
                }

                const nextPrediction = {
                  id: `local-${scheduledPredictionFixture.id}`,
                  fixtureId: scheduledPredictionFixture.id,
                  userId: localPredictionMember.userId,
                  score: predictionUi.draft,
                  submittedAt: localPredictionSubmittedAt,
                };

                const saveState = saveLocalScorePrediction(
                  getBrowserPredictionStorage(),
                  nextPrediction,
                )
                  ? "saved"
                  : "unavailable";

                setPredictionUi((currentState) => ({
                  ...currentState,
                  savedPrediction: nextPrediction,
                  saveState,
                }));
              }}
              onClear={() => {
                if (!scheduledPredictionFixture) {
                  return;
                }

                clearLocalScorePrediction(
                  getBrowserPredictionStorage(),
                  scheduledPredictionFixture.id,
                );

                setPredictionUi({
                  draft: defaultPredictionDraft,
                  saveState: "draft",
                  savedPrediction: undefined,
                });
              }}
              saveState={predictionUi.saveState}
              savedPrediction={predictionUi.savedPrediction}
            />
          ) : !isComplete && currentQuestion ? (
            <QuestionCard
              isFinalQuestion={questionIndex === quizQuestions.length - 1}
              onNext={goNext}
              onSelectAnswer={selectAnswer}
              question={currentQuestion}
              selectedAnswer={selectedAnswer}
            />
          ) : (
            <ResultCard
              activePack={activePack}
              localPackIds={localPackIds}
              onRestart={restart}
              onStartPack={startPack}
              onToggleTopic={toggleTopic}
              profile={fanProfile}
              outcome={outcome}
              selectedTopics={selectedTopics}
            />
          )}
        </div>

        <BottomNav activeView={activeView} onNavigate={setActiveView} />
      </section>
    </main>
  );
}

interface QuestionCardProps {
  question: QuizQuestion;
  isFinalQuestion: boolean;
  selectedAnswer?: string;
  onSelectAnswer: (optionId: string) => void;
  onNext: () => void;
}

function QuestionCard({
  isFinalQuestion,
  question,
  selectedAnswer,
  onSelectAnswer,
  onNext,
}: QuestionCardProps) {
  const answered = Boolean(selectedAnswer);

  return (
    <section className="quiz-card" aria-label="Current question">
      <QuestionMedia
        category={question.category}
        freshness={question.freshness}
        media={question.media}
        source={question.source}
      />

      <p className="question-kicker">
        {question.difficulty} / {question.category}
      </p>
      <h2 className="question-title">{question.prompt}</h2>

      <div className="answer-list">
        {question.options.map((option, index) => {
          const selected = selectedAnswer === option.id;
          const correct = selected && isCorrect(question, option.id);
          const incorrect = selected && !correct;

          return (
            <button
              aria-label={option.label}
              aria-pressed={selected}
              className={[
                "answer-row",
                selected ? "selected" : "",
                correct ? "correct" : "",
                incorrect ? "incorrect" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={answered}
              key={option.id}
              onClick={() => onSelectAnswer(option.id)}
              type="button"
            >
              <span className="answer-letter" aria-hidden="true">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="answer-copy">
                <span>{option.label}</span>
                {option.hint ? (
                  <small aria-hidden="true">{option.hint}</small>
                ) : null}
              </span>
              <span className="answer-icon">
                {selected ? (
                  correct ? (
                    <Check aria-hidden="true" size={17} />
                  ) : (
                    <X aria-hidden="true" size={17} />
                  )
                ) : (
                  <Circle aria-hidden="true" size={13} />
                )}
              </span>
            </button>
          );
        })}
      </div>

      <p className="feedback" data-testid="feedback">
        {selectedAnswer
          ? getFeedback(question, selectedAnswer)
          : question.source.label}
      </p>

      <button
        className="primary-button"
        disabled={!selectedAnswer}
        onClick={onNext}
        type="button"
      >
        {isFinalQuestion ? "Reveal profile" : "Next question"}
        <ChevronRight aria-hidden="true" size={18} />
      </button>
    </section>
  );
}

export function QuestionMedia({
  category = "Question",
  freshness,
  media,
  source,
}: {
  category?: string;
  freshness?: QuizQuestion["freshness"];
  media?: QuizMedia;
  source?: QuizQuestion["source"];
}) {
  if (!media) {
    return (
      <div
        className="media-frame media-fallback"
        role="img"
        aria-label="No question photo available"
      >
        <QuestionDataBadges freshness={freshness} source={source} />
        <Shield aria-hidden="true" size={34} />
        <span>Text-only question</span>
        <small>{category}</small>
      </div>
    );
  }

  return (
    <figure className="media-frame">
      <Image
        alt={media.alt}
        fill
        loading="eager"
        sizes="(max-width: 520px) 100vw, 360px"
        src={media.src}
      />
      <QuestionDataBadges freshness={freshness} source={source} />
      <figcaption>{media.credit}</figcaption>
    </figure>
  );
}

function QuestionDataBadges({
  freshness,
  source,
}: {
  freshness?: QuizQuestion["freshness"];
  source?: QuizQuestion["source"];
}) {
  if (!freshness || !source) {
    return null;
  }

  return (
    <div className="data-badges" role="group" aria-label="Question data status">
      <span>{source.label}</span>
      <span>{freshness.label}</span>
      <span>{freshness.validUntil}</span>
    </div>
  );
}

interface ResultCardProps {
  activePack: QuizPack;
  localPackIds: ReadonlySet<string>;
  outcome: ReturnType<typeof evaluateQuiz>;
  profile: ReturnType<typeof buildFanProfile>;
  selectedTopics: string[];
  onRestart: () => void;
  onStartPack: (packId: string) => void;
  onToggleTopic: (topicId: string) => void;
}

function ResultCard({
  activePack,
  localPackIds,
  outcome,
  profile,
  selectedTopics,
  onRestart,
  onStartPack,
  onToggleTopic,
}: ResultCardProps) {
  const packs = recommendPacks(profile);

  return (
    <section className="result-card" aria-label="Quiz result">
      <div className="result-topline">
        <span className="score-pill">
          {outcome.correctCount}/{outcome.totalQuestions} correct
        </span>
        <button
          aria-label="Try again"
          className="chrome-button"
          onClick={onRestart}
          type="button"
        >
          <RotateCcw aria-hidden="true" size={18} />
        </button>
      </div>

      <h2 className="level">{outcome.level}</h2>
      <p className="result-copy">{recommendationCopy(outcome)}</p>

      <div className="profile-panel" aria-label="Fan profile summary">
        <div>
          <span className="profile-value">{profile.accuracy}%</span>
          <span className="profile-label">accuracy</span>
        </div>
        <div>
          <span className="profile-value">{profile.strongestSignals[0]}</span>
          <span className="profile-label">strongest signal</span>
        </div>
      </div>

      <div className="personalize-header">
        <SlidersHorizontal aria-hidden="true" size={18} />
        <span>Tune the next quiz</span>
      </div>
      <div className="topic-grid">
        {topicOptions.map((topic) => {
          const active = selectedTopics.includes(topic.id);

          return (
            <button
              aria-pressed={active}
              className={`topic-toggle ${active ? "active" : ""}`}
              key={topic.id}
              onClick={() => onToggleTopic(topic.id)}
              type="button"
            >
              {topic.label}
              <span>{topic.hint}</span>
            </button>
          );
        })}
      </div>

      <div className="personalize-header">
        <Flame aria-hidden="true" size={18} />
        <span>Next packs</span>
      </div>
      <div className="pack-list">
        {packs.map((pack) => {
          const playable = localPackIds.has(pack.id);
          const active = activePack.id === pack.id;

          return (
            <article className="pack-row" key={pack.id}>
              <div>
                <h3>{pack.title}</h3>
                <p>{pack.description}</p>
              </div>
              {playable ? (
                <button
                  aria-label={`Start ${pack.title}`}
                  className="pack-action"
                  disabled={active}
                  onClick={() => onStartPack(pack.id)}
                  type="button"
                >
                  <Play aria-hidden="true" size={14} />
                  <span>{active ? "Now" : "Play"}</span>
                </button>
              ) : (
                <span className="pack-badge">{pack.freshness}</span>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

interface PredictionLeagueScreenProps {
  draft: ScoreLine;
  fixture?: PredictionFixture;
  lockState?: PredictionLockState;
  saveState: PredictionSaveState;
  savedPrediction?: ScorePrediction;
  onClear: () => void;
  onDraftChange: (score: ScoreLine) => void;
  onSave: () => void;
}

function PredictionLeagueScreen({
  draft,
  fixture,
  lockState,
  saveState,
  savedPrediction,
  onClear,
  onDraftChange,
  onSave,
}: PredictionLeagueScreenProps) {
  const predictions = useMemo(
    () =>
      savedPrediction
        ? [...mockScorePredictions, savedPrediction]
        : mockScorePredictions,
    [savedPrediction],
  );
  const members = useMemo(
    () =>
      savedPrediction
        ? [...mockPredictionMembers, localPredictionMember]
        : mockPredictionMembers,
    [savedPrediction],
  );
  const leaderboard = useMemo(
    () =>
      buildPredictionLeaderboard({
        fixtures: mockPredictionFixtures,
        members,
        predictions,
      }),
    [members, predictions],
  );
  const completedFixtures = mockPredictionFixtures.filter(
    (candidate) => candidate.status === "completed",
  );
  const predictionLocked = lockState?.status === "locked";

  function updateDraft(side: keyof ScoreLine, value: string) {
    if (predictionLocked) {
      return;
    }

    const parsed = Number.parseInt(value, 10);
    const nextValue = Number.isFinite(parsed)
      ? Math.min(Math.max(parsed, 0), 12)
      : 0;

    onDraftChange({
      ...draft,
      [side]: nextValue,
    });
  }

  return (
    <section className="prediction-screen" aria-label="Prediction league">
      <div className="league-topline">
        <span className="score-pill">Local league</span>
        <span className="locked-pill">
          <Lock aria-hidden="true" size={14} />
          Rewards locked
        </span>
      </div>

      <div className="league-heading">
        <div>
          <p>Mock score picks</p>
          <h2>Score League</h2>
        </div>
        <Medal aria-hidden="true" size={28} />
      </div>

      <section className="prediction-panel" aria-label="Upcoming prediction">
        <div className="prediction-panel-header">
          <CalendarClock aria-hidden="true" size={18} />
          <span>Next lock</span>
        </div>
        {fixture ? (
          <>
            <div className="fixture-matchup">
              <span>{fixture.homeTeam.name}</span>
              <strong>vs</strong>
              <span>{fixture.awayTeam.name}</span>
            </div>
            <p className="fixture-meta">
              {fixture.competition} / {fixture.matchday} /{" "}
              {formatFixtureDate(fixture.lockAt)}
            </p>
            {lockState ? (
              <div
                className={`prediction-lock-card ${
                  predictionLocked ? "locked" : ""
                }`}
                role="status"
              >
                <span>
                  <Lock aria-hidden="true" size={15} />
                  {predictionLocked ? "Prediction locked" : "Open for picks"}
                </span>
                <small>
                  {predictionLocked ? "Locked" : "Locks"}{" "}
                  {formatFixtureDate(lockState.lockAt)}
                </small>
              </div>
            ) : null}
            <div className="score-input-grid">
              <label
                className={`score-input ${predictionLocked ? "locked" : ""}`}
              >
                <span>{fixture.homeTeam.shortName}</span>
                <input
                  aria-label={`${fixture.homeTeam.name} score`}
                  disabled={predictionLocked}
                  inputMode="numeric"
                  max={12}
                  min={0}
                  onChange={(event) =>
                    updateDraft("home", event.currentTarget.value)
                  }
                  type="number"
                  value={draft.home}
                />
              </label>
              <label
                className={`score-input ${predictionLocked ? "locked" : ""}`}
              >
                <span>{fixture.awayTeam.shortName}</span>
                <input
                  aria-label={`${fixture.awayTeam.name} score`}
                  disabled={predictionLocked}
                  inputMode="numeric"
                  max={12}
                  min={0}
                  onChange={(event) =>
                    updateDraft("away", event.currentTarget.value)
                  }
                  type="number"
                  value={draft.away}
                />
              </label>
            </div>
            <div className="prediction-actions">
              <button
                className="primary-button prediction-save"
                disabled={predictionLocked}
                onClick={onSave}
                type="button"
              >
                <Save aria-hidden="true" size={17} />
                {predictionLocked
                  ? "Prediction locked"
                  : savedPrediction
                    ? "Update prediction"
                    : "Save prediction"}
              </button>
              {savedPrediction ? (
                <button
                  className="clear-prediction-button"
                  disabled={predictionLocked}
                  onClick={onClear}
                  type="button"
                >
                  <Trash2 aria-hidden="true" size={15} />
                  Clear local pick
                </button>
              ) : null}
            </div>
            {savedPrediction ? (
              <p className="saved-prediction">
                {getPredictionSaveMessage(draft, savedPrediction, saveState)}
              </p>
            ) : (
              <p className="saved-prediction">
                {predictionLocked
                  ? "Prediction window is locked for this fixture."
                  : "Local only until the data provider boundary is ready."}
              </p>
            )}
          </>
        ) : (
          <p className="fixture-meta">No scheduled mock fixture available.</p>
        )}
      </section>

      <section aria-label="Prediction leaderboard">
        <div className="prediction-section-title">
          <span>Leaderboard</span>
          <small>Exact 5 / outcome 2 / margin 1</small>
        </div>
        <div className="leaderboard-list">
          {leaderboard.map((entry, index) => (
            <article className="leaderboard-row" key={entry.userId}>
              <span className="rank">{index + 1}</span>
              <div>
                <h3>{entry.displayName}</h3>
                <p>
                  {entry.exactScores} exact / {entry.correctOutcomes} outcome
                </p>
              </div>
              <strong>{entry.points}</strong>
            </article>
          ))}
        </div>
      </section>

      <section aria-label="Settled mock fixtures">
        <div className="prediction-section-title">
          <span>Settled fixtures</span>
          <small>Mock results</small>
        </div>
        <div className="fixture-list">
          {completedFixtures.map((settledFixture) => (
            <article className="fixture-row" key={settledFixture.id}>
              <div>
                <h3>
                  {settledFixture.homeTeam.shortName} /{" "}
                  {settledFixture.awayTeam.shortName}
                </h3>
                <p>{settledFixture.competition}</p>
              </div>
              <strong>
                {settledFixture.finalScore?.home}-
                {settledFixture.finalScore?.away}
              </strong>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function getPredictionSaveMessage(
  draft: ScoreLine,
  prediction: ScorePrediction,
  saveState: PredictionSaveState,
) {
  const score = `${prediction.score.home}-${prediction.score.away}`;

  if (!scoresEqual(draft, prediction.score)) {
    return `Unsaved changes to ${draft.home}-${draft.away}`;
  }

  if (saveState === "restored") {
    return `Restored ${score} from this device`;
  }

  if (saveState === "unavailable") {
    return `Saved ${score} for this session`;
  }

  return `Saved ${score} locally`;
}

function scoresEqual(left: ScoreLine, right: ScoreLine) {
  return left.home === right.home && left.away === right.away;
}

function getInitialPredictionUiState(): PredictionUiState {
  const storedPrediction = scheduledPredictionFixture
    ? readLocalScorePrediction(
        getBrowserPredictionStorage(),
        scheduledPredictionFixture.id,
      )
    : undefined;

  return {
    draft: storedPrediction?.score ?? defaultPredictionDraft,
    savedPrediction: storedPrediction,
    saveState: storedPrediction ? "restored" : "draft",
  };
}

function formatFixtureDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(new Date(value));
}

function BottomNav({
  activeView,
  onNavigate,
}: {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
}) {
  const items = [
    { label: "Home", icon: Home, view: "play" as const },
    { label: "Play", icon: Play, view: "play" as const },
    { label: "Leaderboard", icon: BarChart3, view: "leaderboard" as const },
    { label: "Profile", icon: User, view: "play" as const },
  ];

  return (
    <nav className="bottom-nav" aria-label="Prototype navigation">
      {items.map((item) => {
        const Icon = item.icon;
        const active =
          (item.label === "Play" && activeView === "play") ||
          (item.label === "Leaderboard" && activeView === "leaderboard");

        return (
          <button
            aria-current={active ? "page" : undefined}
            className={active ? "active" : ""}
            key={item.label}
            onClick={() => onNavigate(item.view)}
            type="button"
          >
            <Icon aria-hidden="true" size={17} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
