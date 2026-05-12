"use client";

import {
  BarChart3,
  Check,
  ChevronRight,
  Circle,
  Flame,
  Home,
  Play,
  RotateCcw,
  Settings,
  Shield,
  SlidersHorizontal,
  Trophy,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { firstRunQuizPack, topicOptions } from "../../data/mockFootballData";
import {
  buildFanProfile,
  evaluateQuiz,
  getFeedback,
  isCorrect,
  recommendPacks,
  recommendationCopy,
  type AnswerMap,
  type QuizMedia,
  type QuizQuestion,
} from "../../domain/quiz";

const quizQuestions = firstRunQuizPack.questions;

export function QuizExperience() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    "premier-league",
    "transfers",
  ]);

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
    [answers],
  );
  const fanProfile = useMemo(
    () => buildFanProfile(quizQuestions, answers, selectedTopics),
    [answers, selectedTopics],
  );
  const score = outcome.weightedScore * 420;

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
    setQuestionIndex(0);
    setAnswers({});
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

        <section className="match-strip" aria-label="Quiz progress">
          <div
            aria-label={`${progress}% complete`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={progress}
            className="progress-track"
            role="progressbar"
          >
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="match-meta">
            <span>
              {isComplete
                ? "Profile ready"
                : `Question ${displayQuestionNumber}/${quizQuestions.length}`}
            </span>
            <strong>00:14</strong>
            <span>Score: {score}</span>
          </div>
        </section>

        <div className="screen-content">
          {!isComplete && currentQuestion ? (
            <QuestionCard
              isFinalQuestion={questionIndex === quizQuestions.length - 1}
              onNext={goNext}
              onSelectAnswer={selectAnswer}
              question={currentQuestion}
              selectedAnswer={selectedAnswer}
            />
          ) : (
            <ResultCard
              onRestart={restart}
              onToggleTopic={toggleTopic}
              profile={fanProfile}
              outcome={outcome}
              selectedTopics={selectedTopics}
            />
          )}
        </div>

        <BottomNav />
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
      <QuestionMedia category={question.category} media={question.media} />

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
  media,
}: {
  category?: string;
  media?: QuizMedia;
}) {
  if (!media) {
    return (
      <div
        className="media-frame media-fallback"
        role="img"
        aria-label="No question photo available"
      >
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
        sizes="(max-width: 520px) 100vw, 360px"
        src={media.src}
      />
      <figcaption>{media.credit}</figcaption>
    </figure>
  );
}

interface ResultCardProps {
  outcome: ReturnType<typeof evaluateQuiz>;
  profile: ReturnType<typeof buildFanProfile>;
  selectedTopics: string[];
  onRestart: () => void;
  onToggleTopic: (topicId: string) => void;
}

function ResultCard({
  outcome,
  profile,
  selectedTopics,
  onRestart,
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
        {packs.map((pack) => (
          <article className="pack-row" key={pack.id}>
            <div>
              <h3>{pack.title}</h3>
              <p>{pack.description}</p>
            </div>
            <span>{pack.freshness}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function BottomNav() {
  const items = [
    { label: "Home", icon: Home },
    { label: "Play", icon: Play, active: true },
    { label: "Leaderboard", icon: BarChart3 },
    { label: "Profile", icon: User },
  ];

  return (
    <nav className="bottom-nav" aria-label="Prototype navigation">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <button
            aria-current={item.active ? "page" : undefined}
            className={item.active ? "active" : ""}
            key={item.label}
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
