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
  type LucideIcon,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState, useSyncExternalStore } from "react";
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
  type PredictionLeagueEntry,
  type PredictionFixture,
  type PredictionLockState,
  type ScoreLine,
  type ScorePrediction,
} from "../../domain/prediction";
import {
  buildFanProfile,
  buildPlayerBenchmark,
  compareQuizPerformanceWithPlayers,
  evaluateQuiz,
  getFeedback,
  isCorrect,
  recommendPacks,
  recommendationCopy,
  type AnswerMap,
  type FanProfile,
  type PlayerBenchmark,
  type QuizMedia,
  type QuizOutcome,
  type QuizPack,
  type QuizQuestion,
  type RecommendedPack,
} from "../../domain/quiz";
import {
  clearLocalScorePrediction,
  getBrowserPredictionStorage,
  readLocalScorePrediction,
  saveLocalScorePrediction,
} from "./localPredictionStorage";
import {
  clearLocalQuizProgress,
  getBrowserQuizProgressStorage,
  readLocalQuizProgress,
  saveLocalQuizProgress,
  type LocalQuizAttempt,
  type LocalQuizProgress,
} from "./localQuizProgressStorage";

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
const defaultSelectedTopics = ["premier-league", "transfers"];
const maxLocalCompletedAttempts = 12;
const topicIds = new Set(topicOptions.map((topic) => topic.id));
const scheduledPredictionFixture = mockPredictionFixtures.find(
  (fixture) => fixture.status === "scheduled",
);

type AppView = "home" | "play" | "leaderboard" | "profile";
type PredictionSaveState = "draft" | "saved" | "restored" | "unavailable";

interface QuizUiState {
  activePackId: string;
  answers: AnswerMap;
  completedAttempts: LocalQuizAttempt[];
  questionIndex: number;
  selectedTopics: string[];
}

interface PredictionUiState {
  draft: ScoreLine;
  saveState: PredictionSaveState;
  savedPrediction?: ScorePrediction;
}

export function QuizExperience() {
  const [activeView, setActiveView] = useState<AppView>("play");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [quizUiOverride, setQuizUiOverride] = useState<QuizUiState | undefined>(
    undefined,
  );
  const [predictionUiOverride, setPredictionUiOverride] = useState<
    PredictionUiState | undefined
  >(undefined);
  const storedQuizSnapshot = useSyncExternalStore(
    subscribeToLocalBrowserStorage,
    getStoredQuizSnapshot,
    getEmptyStorageSnapshot,
  );
  const storedPredictionSnapshot = useSyncExternalStore(
    subscribeToLocalBrowserStorage,
    getStoredPredictionSnapshot,
    getEmptyStorageSnapshot,
  );
  const storedQuizUi = useMemo(
    () => getStoredQuizUiState(storedQuizSnapshot),
    [storedQuizSnapshot],
  );
  const storedPredictionUi = useMemo(
    () => getStoredPredictionUiState(storedPredictionSnapshot),
    [storedPredictionSnapshot],
  );
  const quizUi = quizUiOverride ?? storedQuizUi;
  const predictionUi = predictionUiOverride ?? storedPredictionUi;
  const { activePackId, answers, questionIndex, selectedTopics } = quizUi;

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

  const outcome = evaluateQuiz(quizQuestions, answers);
  const fanProfile = buildFanProfile(quizQuestions, answers, selectedTopics);
  const playerBenchmark = compareQuizPerformanceWithPlayers(
    quizQuestions,
    answers,
  );
  const scheduledPredictionLockState = scheduledPredictionFixture
    ? getPredictionLockState(scheduledPredictionFixture, localPredictionClockAt)
    : undefined;
  const predictionLeaderboard = useMemo(() => {
    const predictions = predictionUi.savedPrediction
      ? [...mockScorePredictions, predictionUi.savedPrediction]
      : mockScorePredictions;
    const members = predictionUi.savedPrediction
      ? [...mockPredictionMembers, localPredictionMember]
      : mockPredictionMembers;

    return buildPredictionLeaderboard({
      fixtures: mockPredictionFixtures,
      members,
      predictions,
    });
  }, [predictionUi.savedPrediction]);
  const localPredictionEntry = predictionLeaderboard.find(
    (entry) => entry.userId === localPredictionMember.userId,
  );
  const settingsPickLabel =
    predictionUi.savedPrediction && scheduledPredictionFixture
      ? `${scheduledPredictionFixture.homeTeam.shortName} ${predictionUi.savedPrediction.score.home}-${predictionUi.savedPrediction.score.away} ${scheduledPredictionFixture.awayTeam.shortName}`
      : "No pick";
  const localProfileSummary = buildLocalProfileSummary({
    activePackTitle: activePack.title,
    answeredCount,
    completedAttempts: quizUi.completedAttempts,
    isComplete,
    outcome,
    playerBenchmark,
    profile: fanProfile,
    totalQuestions: quizQuestions.length,
  });
  const nextHomePack = isComplete
    ? recommendPacks(fanProfile).find(
        (pack) => localPackIds.has(pack.id) && pack.id !== activePack.id,
      )
    : undefined;

  function startPack(packId: string) {
    const completedAttempts = isComplete
      ? recordCompletedAttempt(
          quizUi.completedAttempts,
          createCompletedAttempt(activePack, outcome, fanProfile),
        )
      : quizUi.completedAttempts;
    const nextState = {
      activePackId: packId,
      answers: {},
      completedAttempts,
      questionIndex: 0,
      selectedTopics,
    };

    setActiveView("play");
    commitQuizUiState(nextState);
  }

  function selectAnswer(optionId: string) {
    if (!currentQuestion || selectedAnswer) {
      return;
    }

    commitQuizUiState({
      ...quizUi,
      answers: {
        ...answers,
        [currentQuestion.id]: optionId,
      },
    });
  }

  function goNext() {
    const nextQuestionIndex = questionIndex + 1;
    const completedAttempts =
      nextQuestionIndex >= quizQuestions.length
        ? recordCompletedAttempt(
            quizUi.completedAttempts,
            createCompletedAttempt(activePack, outcome, fanProfile),
          )
        : quizUi.completedAttempts;

    commitQuizUiState({
      ...quizUi,
      completedAttempts,
      questionIndex: nextQuestionIndex,
    });
  }

  function restart() {
    setActiveView("play");
    startPack(activePack.id);
  }

  function resetLocalData() {
    clearLocalQuizProgress(getBrowserQuizProgressStorage());

    if (scheduledPredictionFixture) {
      clearLocalScorePrediction(
        getBrowserPredictionStorage(),
        scheduledPredictionFixture.id,
      );
    }

    setActiveView("play");
    setSettingsOpen(false);
    setQuizUiOverride(createDefaultQuizUiState());
    setPredictionUiOverride(createDefaultPredictionUiState());
  }

  function toggleTopic(topicId: string) {
    const nextTopics = selectedTopics.includes(topicId)
      ? selectedTopics.filter((id) => id !== topicId)
      : [...selectedTopics, topicId];

    commitQuizUiState({
      ...quizUi,
      selectedTopics: nextTopics,
    });
  }

  function commitQuizUiState(nextState: QuizUiState) {
    setQuizUiOverride(nextState);
    saveQuizUiState(nextState);
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
              onClick={() => setSettingsOpen(true)}
              type="button"
            >
              <Settings aria-hidden="true" size={17} />
            </button>
          </div>
        </div>

        <section
          className="match-strip"
          aria-label={
            activeView === "play"
              ? "Quiz progress"
              : activeView === "leaderboard"
                ? "Prediction league status"
                : activeView === "profile"
                  ? "Profile status"
                  : "Home status"
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
                <span>This quiz: {playerBenchmark.shortLabel}</span>
              </>
            ) : activeView === "leaderboard" ? (
              <>
                <span>Prediction League</span>
                <strong>Local</strong>
                <span>Rewards locked</span>
              </>
            ) : activeView === "profile" ? (
              <>
                <span>Fan Profile</span>
                <strong>
                  {localProfileSummary.playerBenchmark.shortLabel}
                </strong>
                <span>Device only</span>
              </>
            ) : (
              <>
                <span>Home</span>
                <strong>Local</strong>
                <span>Mock data</span>
              </>
            )}
          </div>
        </section>

        <div className="screen-content">
          {activeView === "home" ? (
            <LocalHomeScreen
              activePack={activePack}
              answeredCount={answeredCount}
              fixture={scheduledPredictionFixture}
              isComplete={isComplete}
              localPredictionEntry={localPredictionEntry}
              nextPack={nextHomePack}
              onNavigate={setActiveView}
              onStartPack={startPack}
              profileSummary={localProfileSummary}
              savedPrediction={predictionUi.savedPrediction}
              totalQuestions={quizQuestions.length}
            />
          ) : activeView === "leaderboard" ? (
            <PredictionLeagueScreen
              draft={predictionUi.draft}
              fixture={scheduledPredictionFixture}
              localPredictionEntry={localPredictionEntry}
              lockState={scheduledPredictionLockState}
              onDraftChange={(draft) =>
                setPredictionUiOverride({
                  ...predictionUi,
                  draft,
                })
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

                setPredictionUiOverride({
                  ...predictionUi,
                  savedPrediction: nextPrediction,
                  saveState,
                });
              }}
              onClear={() => {
                if (!scheduledPredictionFixture) {
                  return;
                }

                clearLocalScorePrediction(
                  getBrowserPredictionStorage(),
                  scheduledPredictionFixture.id,
                );

                setPredictionUiOverride({
                  draft: defaultPredictionDraft,
                  saveState: "draft",
                  savedPrediction: undefined,
                });
              }}
              leaderboard={predictionLeaderboard}
              saveState={predictionUi.saveState}
              savedPrediction={predictionUi.savedPrediction}
            />
          ) : activeView === "profile" ? (
            <LocalProfileScreen
              fixture={scheduledPredictionFixture}
              localPackIds={localPackIds}
              localPredictionEntry={localPredictionEntry}
              onStartPack={startPack}
              profile={fanProfile}
              profileSummary={localProfileSummary}
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
              playerBenchmark={playerBenchmark}
              profile={fanProfile}
              outcome={outcome}
              selectedTopics={selectedTopics}
            />
          )}
        </div>

        <BottomNav activeView={activeView} onNavigate={setActiveView} />
        {settingsOpen ? (
          <section
            aria-label="Controls"
            aria-modal="true"
            className="settings-backdrop"
            role="dialog"
          >
            <div className="settings-sheet">
              <button
                aria-label="Close settings"
                className="chrome-button settings-close"
                onClick={() => setSettingsOpen(false)}
                type="button"
              >
                <X aria-hidden="true" size={17} />
              </button>
              <h2>Controls</h2>
              <p>
                <span>Data</span>
                <strong>Mock</strong>
              </p>
              <p>
                <span>Pick</span>
                <strong>{settingsPickLabel}</strong>
              </p>
              <button
                className="settings-reset-button"
                onClick={resetLocalData}
                type="button"
              >
                <Trash2 aria-hidden="true" size={16} />
                Reset data
              </button>
            </div>
          </section>
        ) : null}
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
  playerBenchmark: PlayerBenchmark;
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
  playerBenchmark,
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
        <span className="score-pill">This quiz: {playerBenchmark.label}</span>
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
          <span className="profile-value">
            {outcome.correctCount}/{outcome.totalQuestions}
          </span>
          <span className="profile-label">correct</span>
        </div>
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
    </section>
  );
}

interface LocalHomeScreenProps {
  activePack: QuizPack;
  answeredCount: number;
  fixture?: PredictionFixture;
  isComplete: boolean;
  localPredictionEntry?: PredictionLeagueEntry;
  nextPack?: RecommendedPack;
  profileSummary: LocalProfileSummary;
  savedPrediction?: ScorePrediction;
  totalQuestions: number;
  onNavigate: (view: AppView) => void;
  onStartPack: (packId: string) => void;
}

function LocalHomeScreen({
  activePack,
  answeredCount,
  fixture,
  isComplete,
  localPredictionEntry,
  nextPack,
  profileSummary,
  savedPrediction,
  totalQuestions,
  onNavigate,
  onStartPack,
}: LocalHomeScreenProps) {
  const quizProgressLabel = isComplete
    ? "Pack complete"
    : `${answeredCount}/${totalQuestions} questions`;
  const quizShortcutLabel = nextPack ? "Next quiz" : "Continue quiz";
  const quizShortcutCopy = nextPack
    ? `${nextPack.title} / ${nextPack.description}`
    : `${activePack.subtitle} / ${quizProgressLabel}`;
  const quizShortcutValue = nextPack ? "Play" : isComplete ? "Result" : "Play";
  const savedPickLabel =
    savedPrediction && fixture
      ? `${fixture.homeTeam.shortName} ${savedPrediction.score.home}-${savedPrediction.score.away} ${fixture.awayTeam.shortName}`
      : "No pick saved";
  const fixtureLabel = fixture
    ? `${fixture.homeTeam.shortName} vs ${fixture.awayTeam.shortName}`
    : "Fixture pending";
  const predictionShortcutValue = savedPrediction
    ? getStandingValue(localPredictionEntry)
    : "League";

  return (
    <section className="home-screen" aria-label="Local home">
      <div className="league-topline home-topline">
        <span className="score-pill home-pill">
          <Home aria-hidden="true" size={15} />
          Local hub
        </span>
        <span className="locked-pill">
          <Shield aria-hidden="true" size={14} />
          Device only
        </span>
      </div>

      <div className="home-hero">
        <div>
          <p>Matchday control</p>
          <h2>Matchday Hub</h2>
          <strong>{activePack.title}</strong>
        </div>
        <div
          className="home-hero-badge"
          aria-label={profileSummary.playerBenchmark.label}
        >
          <Trophy aria-hidden="true" size={22} />
          <span>{profileSummary.playerBenchmark.shortLabel}</span>
        </div>
      </div>

      <section className="home-shortcuts" aria-label="Home shortcuts">
        <HomeShortcut
          copy={quizShortcutCopy}
          icon={Play}
          label={quizShortcutLabel}
          onOpen={() =>
            nextPack ? onStartPack(nextPack.id) : onNavigate("play")
          }
          value={quizShortcutValue}
        />
        <HomeShortcut
          copy={`Overall: ${profileSummary.playerBenchmark.label} / ${profileSummary.historyLabel}`}
          icon={User}
          label="Fan profile"
          onOpen={() => onNavigate("profile")}
          value="Profile"
        />
        <HomeShortcut
          copy={`${fixtureLabel} / ${savedPickLabel}`}
          icon={BarChart3}
          label="Score League"
          onOpen={() => onNavigate("leaderboard")}
          value={predictionShortcutValue}
        />
      </section>

      <section className="home-data-card" aria-label="Local data status">
        <div>
          <span>Mock data</span>
          <strong>Provider</strong>
          <p>Fixtures and picks stay local.</p>
        </div>
        <Shield aria-hidden="true" size={26} />
      </section>
    </section>
  );
}

function HomeShortcut({
  copy,
  icon: Icon,
  label,
  value,
  onOpen,
}: {
  copy: string;
  icon: LucideIcon;
  label: string;
  value: string;
  onOpen: () => void;
}) {
  return (
    <article className="home-shortcut-row">
      <div className="home-shortcut-icon" aria-hidden="true">
        <Icon size={18} />
      </div>
      <div className="home-shortcut-copy">
        <h3>{label}</h3>
        <p>{copy}</p>
      </div>
      <button
        aria-label={`Open ${label}`}
        className="home-shortcut-button"
        onClick={onOpen}
        type="button"
      >
        <span>{value}</span>
        <ChevronRight aria-hidden="true" size={15} />
      </button>
    </article>
  );
}

interface PredictionLeagueScreenProps {
  draft: ScoreLine;
  fixture?: PredictionFixture;
  leaderboard: PredictionLeagueEntry[];
  localPredictionEntry?: PredictionLeagueEntry;
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
  leaderboard,
  localPredictionEntry,
  lockState,
  saveState,
  savedPrediction,
  onClear,
  onDraftChange,
  onSave,
}: PredictionLeagueScreenProps) {
  const predictionLocked = lockState?.status === "locked";
  const standingTitle = getStandingValue(localPredictionEntry);
  const standingCopy = !localPredictionEntry
    ? "Save pick."
    : localPredictionEntry.settledPicks === 0
      ? "Pending result."
      : `Rank ${localPredictionEntry.rank} of ${leaderboard.length}.`;

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
        <span className="score-pill">Local</span>
        <span className="locked-pill">
          <Lock aria-hidden="true" size={14} />
          Rewards locked
        </span>
      </div>

      <div className="league-heading">
        <div>
          <p>Mock picks</p>
          <h2>Score League</h2>
        </div>
        <Medal aria-hidden="true" size={28} />
      </div>

      <section className="prediction-standing-card" aria-label="Standing">
        <div>
          <span>Standing</span>
          <strong>{standingTitle}</strong>
          <p>{standingCopy}</p>
        </div>
      </section>

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
                  ? "Prediction locked."
                  : "Local until provider boundary."}
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
          <small>Exact, outcome, margin</small>
        </div>
        <div className="leaderboard-list">
          {leaderboard.map((entry, index) => (
            <article className="leaderboard-row" key={entry.userId}>
              <span className="rank">{index + 1}</span>
              <div>
                <h3>{entry.displayName}</h3>
                <p>
                  Rank {entry.rank} / {entry.exactScores} exact /{" "}
                  {entry.correctOutcomes} outcome
                </p>
              </div>
              <strong>{getStandingValue(entry)}</strong>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

interface LocalProfileSummary {
  accuracy: number;
  answeredCount: number;
  correctCount: number;
  historyLabel: string;
  latestAttemptLabel: string;
  level: FanProfile["level"];
  playerBenchmark: PlayerBenchmark;
  strongestSignals: string[];
  topicCount: number;
  totalQuestions: number;
}

interface LocalProfileScreenProps {
  fixture?: PredictionFixture;
  localPackIds: ReadonlySet<string>;
  localPredictionEntry?: PredictionLeagueEntry;
  profile: FanProfile;
  profileSummary: LocalProfileSummary;
  savedPrediction?: ScorePrediction;
  onStartPack: (packId: string) => void;
}

function LocalProfileScreen({
  fixture,
  localPackIds,
  localPredictionEntry,
  profile,
  profileSummary,
  savedPrediction,
  onStartPack,
}: LocalProfileScreenProps) {
  const packs = recommendPacks(profile);
  const savedPickLabel =
    savedPrediction && fixture
      ? `${fixture.homeTeam.shortName} ${savedPrediction.score.home}-${savedPrediction.score.away} ${fixture.awayTeam.shortName}`
      : "No pick";

  return (
    <section className="profile-screen" aria-label="Local profile">
      <div className="league-topline profile-topline">
        <span className="score-pill profile-pill">
          <User aria-hidden="true" size={15} />
          Local profile
        </span>
        <span className="locked-pill">
          <Shield aria-hidden="true" size={14} />
          Device only
        </span>
      </div>

      <div className="profile-hero">
        <div>
          <p>Knowledge level</p>
          <h2>Fan Profile</h2>
          <strong>{profileSummary.level}</strong>
        </div>
        <div
          className="profile-badge"
          aria-label={`${profileSummary.accuracy}% quiz accuracy`}
        >
          <Trophy aria-hidden="true" size={22} />
          <span>{profileSummary.accuracy}%</span>
        </div>
      </div>

      <div className="profile-stat-grid" aria-label="Local profile stats">
        <ProfileStat
          label="Overall players"
          value={profileSummary.playerBenchmark.shortLabel}
        />
        <ProfileStat
          label="Quiz accuracy"
          value={`${profileSummary.accuracy}%`}
        />
        <ProfileStat
          label="Questions"
          value={`${profileSummary.answeredCount}/${profileSummary.totalQuestions}`}
        />
        <ProfileStat
          label="Prediction rank"
          value={getStandingValue(localPredictionEntry)}
        />
      </div>

      <section className="profile-section" aria-label="Strongest signals">
        <div className="prediction-section-title">
          <span>Signals</span>
          <small>{profileSummary.topicCount} active topics</small>
        </div>
        <div className="signal-list">
          {profileSummary.strongestSignals.map((signal) => (
            <span className="signal-chip" key={signal}>
              {formatSignalLabel(signal)}
            </span>
          ))}
        </div>
      </section>

      <section className="profile-history-card" aria-label="Local quiz history">
        <div>
          <span>Quiz history</span>
          <strong>{profileSummary.historyLabel}</strong>
          <p>{profileSummary.latestAttemptLabel}</p>
        </div>
        <Trophy aria-hidden="true" size={26} />
      </section>

      <section
        className="profile-pick-card"
        aria-label="Local prediction summary"
      >
        <div>
          <span>Saved pick</span>
          <strong>{savedPickLabel}</strong>
          <p>
            {savedPrediction && fixture
              ? `${fixture.competition} / ${fixture.matchday}`
              : "No local pick saved"}
          </p>
        </div>
        <Medal aria-hidden="true" size={26} />
      </section>

      <section
        className="profile-section"
        aria-label="Profile pack recommendations"
      >
        <div className="prediction-section-title">
          <span>Next focus</span>
          <small>{profileSummary.level}</small>
        </div>
        <div className="profile-pack-list">
          {packs.map((pack) => {
            const playable = localPackIds.has(pack.id);

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
                    onClick={() => onStartPack(pack.id)}
                    type="button"
                  >
                    <Play aria-hidden="true" size={14} />
                    <span>Play</span>
                  </button>
                ) : (
                  <span className="pack-badge">{pack.freshness}</span>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="profile-stat" aria-label={`${label} ${value}`}>
      <span>{value}</span>
      <small>{label}</small>
    </div>
  );
}

function buildLocalProfileSummary({
  activePackTitle,
  answeredCount,
  completedAttempts,
  isComplete,
  outcome,
  playerBenchmark,
  profile,
  totalQuestions,
}: {
  activePackTitle: string;
  answeredCount: number;
  completedAttempts: LocalQuizAttempt[];
  isComplete: boolean;
  outcome: QuizOutcome;
  playerBenchmark: PlayerBenchmark;
  profile: FanProfile;
  totalQuestions: number;
}): LocalProfileSummary {
  if (completedAttempts.length === 0) {
    if (isComplete && totalQuestions > 0) {
      return {
        accuracy: profile.accuracy,
        answeredCount,
        correctCount: outcome.correctCount,
        historyLabel: "1 completed pack",
        latestAttemptLabel: `${activePackTitle} / ${outcome.correctCount}/${outcome.totalQuestions}`,
        level: profile.level,
        playerBenchmark,
        strongestSignals: profile.strongestSignals,
        topicCount: profile.selectedTopics.length,
        totalQuestions,
      };
    }

    return {
      accuracy: profile.accuracy,
      answeredCount,
      correctCount: outcome.correctCount,
      historyLabel: "No completed packs",
      latestAttemptLabel: "Finish a quiz to start history",
      level: profile.level,
      playerBenchmark,
      strongestSignals: profile.strongestSignals,
      topicCount: profile.selectedTopics.length,
      totalQuestions,
    };
  }

  const correctCount = completedAttempts.reduce(
    (total, attempt) => total + attempt.correctCount,
    0,
  );
  const historyQuestions = completedAttempts.reduce(
    (total, attempt) => total + attempt.totalQuestions,
    0,
  );
  const latestAttempt = completedAttempts[0]!;
  const completedPackCount = new Set(
    completedAttempts.map((attempt) => attempt.packId),
  ).size;

  return {
    accuracy:
      historyQuestions === 0
        ? 0
        : Math.round((correctCount / historyQuestions) * 100),
    answeredCount: historyQuestions,
    correctCount,
    historyLabel: `${completedPackCount} completed ${
      completedPackCount === 1 ? "pack" : "packs"
    }`,
    latestAttemptLabel: `${latestAttempt.packTitle} / ${latestAttempt.correctCount}/${latestAttempt.totalQuestions}`,
    level: latestAttempt.level,
    playerBenchmark: buildPlayerBenchmark(correctCount / historyQuestions),
    strongestSignals: getUniqueSignals(completedAttempts),
    topicCount: profile.selectedTopics.length,
    totalQuestions: historyQuestions,
  };
}

function formatSignalLabel(signal: string) {
  return signal
    .split("-")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function getUniqueSignals(attempts: LocalQuizAttempt[]) {
  const signals = attempts.flatMap((attempt) => attempt.strongestSignals);
  const uniqueSignals = signals.filter(
    (signal, index) => signals.indexOf(signal) === index,
  );

  return uniqueSignals.length > 0
    ? uniqueSignals.slice(0, 3)
    : ["starter-pack"];
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

function getStandingValue(entry?: PredictionLeagueEntry) {
  if (!entry) {
    return "No pick";
  }

  if (entry.settledPicks === 0) {
    return "Pending";
  }

  return `Better than ${entry.betterThan}%`;
}

function scoresEqual(left: ScoreLine, right: ScoreLine) {
  return left.home === right.home && left.away === right.away;
}

function getStoredQuizUiState(snapshot: string): QuizUiState {
  const storedProgress = parseQuizProgressSnapshot(snapshot);

  if (!storedProgress) {
    return createDefaultQuizUiState();
  }

  const activePack =
    localPackById.get(storedProgress.activePackId) ?? firstRunQuizPack;

  return {
    activePackId: activePack.id,
    answers: normalizeStoredAnswers(activePack, storedProgress.answers),
    completedAttempts: normalizeStoredAttempts(
      storedProgress.completedAttempts,
    ),
    questionIndex: Math.min(
      storedProgress.questionIndex,
      activePack.questions.length,
    ),
    selectedTopics: normalizeStoredTopics(storedProgress.selectedTopics),
  };
}

function createDefaultQuizUiState(): QuizUiState {
  return {
    activePackId: firstRunQuizPack.id,
    answers: {},
    completedAttempts: [],
    questionIndex: 0,
    selectedTopics: defaultSelectedTopics,
  };
}

function createDefaultPredictionUiState(): PredictionUiState {
  return {
    draft: defaultPredictionDraft,
    saveState: "draft",
    savedPrediction: undefined,
  };
}

function subscribeToLocalBrowserStorage() {
  return () => undefined;
}

function getEmptyStorageSnapshot() {
  return "";
}

function getStoredQuizSnapshot() {
  const storedProgress = readLocalQuizProgress(getBrowserQuizProgressStorage());

  return storedProgress ? JSON.stringify(storedProgress) : "";
}

function getStoredPredictionSnapshot() {
  const storedPrediction = scheduledPredictionFixture
    ? readLocalScorePrediction(
        getBrowserPredictionStorage(),
        scheduledPredictionFixture.id,
      )
    : undefined;

  return storedPrediction ? JSON.stringify(storedPrediction) : "";
}

function getStoredPredictionUiState(snapshot: string): PredictionUiState {
  const storedPrediction = parsePredictionSnapshot(snapshot);

  if (!storedPrediction) {
    return createDefaultPredictionUiState();
  }

  return {
    draft: storedPrediction.score,
    savedPrediction: storedPrediction,
    saveState: "restored",
  };
}

function parseQuizProgressSnapshot(snapshot: string) {
  if (!snapshot) {
    return undefined;
  }

  try {
    return JSON.parse(snapshot) as LocalQuizProgress;
  } catch {
    return undefined;
  }
}

function parsePredictionSnapshot(snapshot: string) {
  if (!snapshot) {
    return undefined;
  }

  try {
    return JSON.parse(snapshot) as ScorePrediction;
  } catch {
    return undefined;
  }
}

function saveQuizUiState(state: QuizUiState) {
  const progress: LocalQuizProgress = {
    ...state,
    updatedAt: new Date().toISOString(),
  };

  saveLocalQuizProgress(getBrowserQuizProgressStorage(), progress);
}

function createCompletedAttempt(
  pack: QuizPack,
  outcome: QuizOutcome,
  profile: FanProfile,
): LocalQuizAttempt {
  return {
    accuracy: profile.accuracy,
    completedAt: new Date().toISOString(),
    correctCount: outcome.correctCount,
    level: outcome.level,
    packId: pack.id,
    packTitle: pack.title,
    strongestSignals: profile.strongestSignals,
    totalQuestions: outcome.totalQuestions,
  };
}

function recordCompletedAttempt(
  attempts: LocalQuizAttempt[],
  nextAttempt: LocalQuizAttempt,
) {
  return [
    nextAttempt,
    ...attempts.filter((attempt) => attempt.packId !== nextAttempt.packId),
  ].slice(0, maxLocalCompletedAttempts);
}

function normalizeStoredAnswers(pack: QuizPack, answers: AnswerMap) {
  return pack.questions.reduce<AnswerMap>((validAnswers, question) => {
    const selectedOptionId = answers[question.id];

    if (
      selectedOptionId &&
      question.options.some((option) => option.id === selectedOptionId)
    ) {
      validAnswers[question.id] = selectedOptionId;
    }

    return validAnswers;
  }, {});
}

function normalizeStoredTopics(selectedTopics: string[]) {
  const topics = selectedTopics.filter(
    (topicId, index) =>
      topicIds.has(topicId) && selectedTopics.indexOf(topicId) === index,
  );

  return topics.length > 0 ? topics : defaultSelectedTopics;
}

function normalizeStoredAttempts(attempts: LocalQuizAttempt[] | undefined) {
  return attempts?.slice(0, maxLocalCompletedAttempts) ?? [];
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
    { label: "Home", icon: Home, view: "home" as const },
    { label: "Play", icon: Play, view: "play" as const },
    { label: "Leaderboard", icon: BarChart3, view: "leaderboard" as const },
    { label: "Profile", icon: User, view: "profile" as const },
  ];

  return (
    <nav className="bottom-nav" aria-label="Prototype navigation">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.view === activeView;

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
