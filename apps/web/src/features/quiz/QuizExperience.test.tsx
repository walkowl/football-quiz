import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  readLocalScorePrediction,
  saveLocalScorePrediction,
} from "./localPredictionStorage";
import {
  readLocalQuizProgress,
  saveLocalQuizProgress,
} from "./localQuizProgressStorage";
import { QuestionMedia, QuizExperience } from "./QuizExperience";

describe("QuizExperience", () => {
  let storage: Storage;

  beforeEach(() => {
    storage = createMemoryStorage();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: storage,
    });
  });

  it("lets a user answer the first question and see feedback", () => {
    render(<QuizExperience />);

    fireEvent.click(screen.getByRole("button", { name: "Cristiano Ronaldo" }));

    expect(
      screen.getByRole("group", { name: "Question data status" }),
    ).toHaveTextContent("Mock week");
    expect(screen.getByTestId("feedback")).toHaveTextContent("Correct");
    expect(screen.getByText("This quiz: Better than 94%")).toBeInTheDocument();
    expect(screen.queryByText(/Score:/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Next question/ })).toBeEnabled();
  });

  it("accepts touch taps on answer buttons", () => {
    render(<QuizExperience />);

    fireEvent.touchEnd(
      screen.getByRole("button", { name: "Cristiano Ronaldo" }),
    );

    expect(screen.getByTestId("feedback")).toHaveTextContent("Correct");
    expect(screen.getByRole("button", { name: /Next question/ })).toBeEnabled();
  });

  it("lets a user change an answer before moving next", () => {
    render(<QuizExperience />);

    fireEvent.click(screen.getByRole("button", { name: "Lionel Messi" }));
    expect(screen.getByTestId("feedback")).toHaveTextContent("Not this time");

    fireEvent.click(screen.getByRole("button", { name: "Cristiano Ronaldo" }));

    expect(screen.getByTestId("feedback")).toHaveTextContent("Correct");
  });

  it("reaches the profile screen after three answers", () => {
    render(<QuizExperience />);

    fireEvent.click(screen.getByRole("button", { name: "Cristiano Ronaldo" }));
    fireEvent.click(screen.getByRole("button", { name: /Next question/ }));
    fireEvent.click(screen.getByRole("button", { name: "Bayer Leverkusen" }));
    fireEvent.click(screen.getByRole("button", { name: /Next question/ }));

    expect(
      screen.getByRole("img", { name: "No question photo available" }),
    ).toHaveTextContent("Text-only question");

    fireEvent.click(
      screen.getByRole("button", { name: "20-year-old elite winger" }),
    );
    fireEvent.click(screen.getByRole("button", { name: /Reveal profile/ }));

    expect(
      screen.getByRole("heading", { name: "Advanced Fan" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("This quiz: Better than 94% of players"),
    ).toBeInTheDocument();
  });

  it("persists completed quiz progress and restores it on reload", () => {
    const { unmount } = render(<QuizExperience />);

    fireEvent.click(screen.getByRole("button", { name: "Cristiano Ronaldo" }));
    fireEvent.click(screen.getByRole("button", { name: /Next question/ }));
    fireEvent.click(screen.getByRole("button", { name: "Bayer Leverkusen" }));
    fireEvent.click(screen.getByRole("button", { name: /Next question/ }));
    fireEvent.click(
      screen.getByRole("button", { name: "20-year-old elite winger" }),
    );
    fireEvent.click(screen.getByRole("button", { name: /Reveal profile/ }));

    expect(readLocalQuizProgress(storage)?.questionIndex).toBe(3);

    unmount();
    render(<QuizExperience />);
    fireEvent.click(screen.getByRole("button", { name: "Profile" }));

    expect(screen.getAllByText("Advanced Fan").length).toBeGreaterThan(0);
    expect(screen.getByLabelText("Questions 3/3")).toBeInTheDocument();
    expect(screen.getByLabelText("Quiz accuracy 100%")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Start Weekly Pulse" }));
    fireEvent.click(screen.getByRole("button", { name: "Profile" }));

    expect(screen.getByLabelText("Local quiz history")).toHaveTextContent(
      "Legend Challenge / 3/3",
    );
    expect(screen.getByLabelText("Questions 3/3")).toBeInTheDocument();
  });

  it("backfills local history from a completed quiz saved before history existed", () => {
    saveLocalQuizProgress(storage, {
      activePackId: "mock-legend-challenge",
      answers: {
        "mock-week-1-legend": "ronaldo",
        "mock-week-1-leverkusen": "leverkusen",
        "mock-week-1-market-value": "young-winger",
      },
      questionIndex: 3,
      selectedTopics: ["premier-league", "transfers"],
      updatedAt: "2026-05-12T00:00:00.000Z",
    });

    render(<QuizExperience />);
    fireEvent.click(screen.getByRole("button", { name: "Profile" }));

    expect(screen.getByLabelText("Local quiz history")).toHaveTextContent(
      "Legend Challenge / 3/3",
    );

    fireEvent.click(screen.getByRole("button", { name: "Start Weekly Pulse" }));
    fireEvent.click(screen.getByRole("button", { name: "Profile" }));

    expect(screen.getByLabelText("Local quiz history")).toHaveTextContent(
      "Legend Challenge / 3/3",
    );
  });

  it("starts the local weekly pulse pack from the result screen", () => {
    render(<QuizExperience />);

    fireEvent.click(screen.getByRole("button", { name: "Cristiano Ronaldo" }));
    fireEvent.click(screen.getByRole("button", { name: /Next question/ }));
    fireEvent.click(screen.getByRole("button", { name: "Bayer Leverkusen" }));
    fireEvent.click(screen.getByRole("button", { name: /Next question/ }));
    fireEvent.click(
      screen.getByRole("button", { name: "20-year-old elite winger" }),
    );
    fireEvent.click(screen.getByRole("button", { name: /Reveal profile/ }));

    fireEvent.click(screen.getByRole("button", { name: "Start Weekly Pulse" }));

    expect(
      screen.getByRole("heading", {
        name: "Who won the featured derby in this week's local pulse?",
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("0% complete")).toBeInTheDocument();
  });

  it("promotes the next local pack from Home after a quiz is complete", () => {
    render(<QuizExperience />);

    fireEvent.click(screen.getByRole("button", { name: "Cristiano Ronaldo" }));
    fireEvent.click(screen.getByRole("button", { name: /Next question/ }));
    fireEvent.click(screen.getByRole("button", { name: "Bayer Leverkusen" }));
    fireEvent.click(screen.getByRole("button", { name: /Next question/ }));
    fireEvent.click(
      screen.getByRole("button", { name: "20-year-old elite winger" }),
    );
    fireEvent.click(screen.getByRole("button", { name: /Reveal profile/ }));
    fireEvent.click(screen.getByRole("button", { name: "Home" }));

    expect(screen.getByRole("heading", { name: "Next quiz" })).toBeVisible();
    expect(screen.getByText(/Weekly Pulse/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open Next quiz" }));

    expect(
      screen.getByRole("heading", {
        name: "Who won the featured derby in this week's local pulse?",
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("0% complete")).toBeInTheDocument();
  });

  it("restarts the active quiz and lets result topics be tuned", () => {
    render(<QuizExperience />);

    fireEvent.click(screen.getByRole("button", { name: "Cristiano Ronaldo" }));
    fireEvent.click(screen.getByRole("button", { name: "Restart quiz" }));

    expect(screen.getByTestId("feedback")).toHaveTextContent("Local mock data");
    expect(
      screen.getByRole("button", { name: /Next question/ }),
    ).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Cristiano Ronaldo" }));
    fireEvent.click(screen.getByRole("button", { name: /Next question/ }));
    fireEvent.click(screen.getByRole("button", { name: "Bayer Leverkusen" }));
    fireEvent.click(screen.getByRole("button", { name: /Next question/ }));
    fireEvent.click(
      screen.getByRole("button", { name: "20-year-old elite winger" }),
    );
    fireEvent.click(screen.getByRole("button", { name: /Reveal profile/ }));

    const transfersTopic = screen.getByRole("button", { name: /Transfers/ });
    const marketValuesTopic = screen.getByRole("button", {
      name: /Market values/,
    });

    fireEvent.click(transfersTopic);
    expect(transfersTopic).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(marketValuesTopic);
    expect(marketValuesTopic).toHaveAttribute("aria-pressed", "true");
  });

  it("opens the local prediction league and saves a score prediction", () => {
    render(<QuizExperience />);

    fireEvent.click(screen.getByRole("button", { name: "Leaderboard" }));

    expect(
      screen.getByRole("heading", { name: "Score League" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Open for picks")).toBeInTheDocument();
    expect(screen.getByText("Locks May 16, 06:45 PM UTC")).toBeInTheDocument();
    expect(screen.getByLabelText("Standing")).toHaveTextContent("No pick");
    expect(screen.getByText("Better than 67%")).toBeInTheDocument();
    expect(
      screen.getByText(/Rank 1 .* 1 exact .* 2 outcome/),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Rewards locked").length).toBeGreaterThan(0);
    expect(
      screen.queryByText(/\b(bet|betting|odds|wager|payout|cash)\b/i),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Napoli score"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText("Inter score"), {
      target: { value: "1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save prediction" }));

    expect(screen.getByText("Saved 2-1 locally")).toBeInTheDocument();
    expect(screen.getByLabelText("Standing")).toHaveTextContent("Pending");
    expect(screen.getByText("Pending result.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "You" })).toBeInTheDocument();
    expect(screen.getByLabelText("Matchday pick complete")).toHaveTextContent(
      "NAP 2-1 INT",
    );

    fireEvent.click(screen.getByRole("button", { name: "Review Home" }));

    expect(
      screen.getByRole("heading", { name: "Matchday Hub" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Daily Matchday" }),
    ).toHaveTextContent("Pick 2-1");
    expect(
      within(
        screen.getByRole("region", { name: "Daily Matchday" }),
      ).getByLabelText("Daily Matchday checklist"),
    ).toHaveTextContent("Quiz pending");
    expect(
      within(
        screen.getByRole("region", { name: "Daily Matchday" }),
      ).getByLabelText("Daily Matchday checklist"),
    ).toHaveTextContent("Pick saved");
  });

  it("opens the local profile tab with quiz and prediction state", () => {
    render(<QuizExperience />);

    fireEvent.click(screen.getByRole("button", { name: "Profile" }));

    expect(
      screen.getByRole("heading", { name: "Fan Profile" }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Overall players Benchmark pending"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Questions 0/3")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Prediction rank No pick"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Local prediction summary")).toHaveTextContent(
      "No local pick saved",
    );
    expect(screen.getByRole("button", { name: "Profile" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("opens the local home hub and routes to the main surfaces", () => {
    render(<QuizExperience />);

    fireEvent.click(screen.getByRole("button", { name: "Home" }));

    expect(
      screen.getByRole("heading", { name: "Matchday Hub" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Home" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByLabelText("Local data status")).toHaveTextContent(
      "Mock data",
    );
    expect(screen.getAllByText("Benchmark pending").length).toBeGreaterThan(0);
    expect(screen.getByText(/Overall: Benchmark pending/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open Fan profile" }));
    expect(
      screen.getByRole("heading", { name: "Fan Profile" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Home" }));
    fireEvent.click(screen.getByRole("button", { name: "Open Score League" }));
    expect(
      screen.getByRole("heading", { name: "Score League" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Home" }));
    fireEvent.click(screen.getByRole("button", { name: "Open Continue quiz" }));
    expect(
      screen.getByRole("heading", {
        name: "Who is this football legend?",
      }),
    ).toBeInTheDocument();
  });

  it("surfaces Daily Matchday actions above Home shortcuts", () => {
    render(<QuizExperience />);

    fireEvent.click(screen.getByRole("button", { name: "Home" }));

    const dailyMatchday = screen.getByRole("region", {
      name: "Daily Matchday",
    });

    expect(dailyMatchday).toHaveTextContent("NAP vs INT");
    expect(dailyMatchday).toHaveTextContent("Serie A / Mock week 2");
    expect(
      within(dailyMatchday).getByLabelText("Daily Matchday checklist"),
    ).toHaveTextContent("Quiz pending");
    expect(
      within(dailyMatchday).getByLabelText("Daily Matchday checklist"),
    ).toHaveTextContent("Pick pending");

    fireEvent.click(
      within(dailyMatchday).getByRole("button", {
        name: "Start Daily Matchday",
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: "What is the key hook for Napoli vs Inter?",
      }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Home" }));
    fireEvent.click(
      within(screen.getByRole("region", { name: "Daily Matchday" })).getByRole(
        "button",
        { name: "Predict score" },
      ),
    );

    expect(
      screen.getByRole("heading", { name: "Score League" }),
    ).toBeInTheDocument();
  });

  it("hands off a completed Daily Matchday quiz to score prediction", () => {
    render(<QuizExperience />);

    fireEvent.click(screen.getByRole("button", { name: "Home" }));
    fireEvent.click(
      within(screen.getByRole("region", { name: "Daily Matchday" })).getByRole(
        "button",
        { name: "Start Daily Matchday" },
      ),
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Title-race pressure" }),
    );
    fireEvent.click(screen.getByRole("button", { name: /Next question/ }));
    fireEvent.click(
      screen.getByRole("button", { name: "Recent chance creation" }),
    );
    fireEvent.click(screen.getByRole("button", { name: /Next question/ }));
    fireEvent.click(
      screen.getByRole("button", { name: "Outcome plus margin" }),
    );
    fireEvent.click(screen.getByRole("button", { name: /Reveal profile/ }));

    const handoff = screen.getByRole("region", {
      name: "Matchday prediction handoff",
    });

    expect(handoff).toHaveTextContent("NAP vs INT");
    expect(handoff).toHaveTextContent(
      "Use the quiz read to make a local score pick.",
    );

    fireEvent.click(screen.getByRole("button", { name: "Home" }));

    const dailyMatchday = screen.getByRole("region", {
      name: "Daily Matchday",
    });

    expect(
      within(dailyMatchday).getByLabelText("Daily Matchday checklist"),
    ).toHaveTextContent("Quiz done");
    expect(
      within(dailyMatchday).getByLabelText("Daily Matchday checklist"),
    ).toHaveTextContent("Pick pending");

    fireEvent.click(
      within(dailyMatchday).getByRole("button", {
        name: "Review Daily Matchday",
      }),
    );

    expect(
      screen.getByRole("region", {
        name: "Matchday prediction handoff",
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      within(
        screen.getByRole("region", {
          name: "Matchday prediction handoff",
        }),
      ).getByRole("button", {
        name: "Predict Napoli vs Inter score",
      }),
    );

    expect(
      screen.getByRole("heading", { name: "Score League" }),
    ).toBeInTheDocument();
  });

  it("updates and clears a local score prediction", () => {
    render(<QuizExperience />);

    fireEvent.click(screen.getByRole("button", { name: "Leaderboard" }));
    fireEvent.change(screen.getByLabelText("Napoli score"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText("Inter score"), {
      target: { value: "1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save prediction" }));
    fireEvent.change(screen.getByLabelText("Napoli score"), {
      target: { value: "4" },
    });

    expect(screen.getByText("Unsaved changes to 4-1")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Update prediction" }));

    expect(screen.getByText("Saved 4-1 locally")).toBeInTheDocument();
    expect(
      readLocalScorePrediction(storage, "mock-serie-a-nap-int-2026-05-16")
        ?.score,
    ).toEqual({
      home: 4,
      away: 1,
    });

    fireEvent.click(screen.getByRole("button", { name: "Clear local pick" }));

    expect(screen.queryByRole("heading", { name: "You" })).toBeNull();
    expect(screen.getByLabelText("Napoli score")).toHaveValue(1);
    expect(screen.getByLabelText("Inter score")).toHaveValue(1);
    expect(
      readLocalScorePrediction(storage, "mock-serie-a-nap-int-2026-05-16"),
    ).toBeUndefined();
  });

  it("opens local settings and resets device-only progress", () => {
    render(<QuizExperience />);

    fireEvent.click(screen.getByRole("button", { name: "Cristiano Ronaldo" }));
    fireEvent.click(screen.getByRole("button", { name: "Leaderboard" }));
    fireEvent.change(screen.getByLabelText("Napoli score"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText("Inter score"), {
      target: { value: "1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save prediction" }));

    expect(readLocalQuizProgress(storage)?.answers).toEqual({
      "mock-week-1-legend": "ronaldo",
    });
    expect(
      readLocalScorePrediction(storage, "mock-serie-a-nap-int-2026-05-16")
        ?.score,
    ).toEqual({
      home: 2,
      away: 1,
    });

    fireEvent.click(screen.getByRole("button", { name: "Settings" }));

    const settingsDialog = screen.getByRole("dialog");

    expect(settingsDialog).toHaveTextContent("Controls");
    expect(screen.getByText("Mock")).toBeInTheDocument();
    expect(within(settingsDialog).getByText("NAP 2-1 INT")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reset data" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(readLocalQuizProgress(storage)).toBeUndefined();
    expect(
      readLocalScorePrediction(storage, "mock-serie-a-nap-int-2026-05-16"),
    ).toBeUndefined();
    expect(screen.getByLabelText("0% complete")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Who is this football legend?" }),
    ).toBeInTheDocument();
  });

  it("restores a locally saved score prediction on load", async () => {
    saveLocalScorePrediction(storage, {
      id: "local-mock-serie-a-nap-int-2026-05-16",
      fixtureId: "mock-serie-a-nap-int-2026-05-16",
      userId: "local-user",
      submittedAt: "2026-05-12T00:00:00.000Z",
      score: {
        home: 3,
        away: 0,
      },
    });

    render(<QuizExperience />);

    fireEvent.click(screen.getByRole("button", { name: "Leaderboard" }));

    expect(
      await screen.findByText("Restored 3-0 from this device"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Napoli score")).toHaveValue(3);
    expect(screen.getByLabelText("Inter score")).toHaveValue(0);
  });

  it("shows a restored local score prediction on the profile tab", () => {
    saveLocalScorePrediction(storage, {
      id: "local-mock-serie-a-nap-int-2026-05-16",
      fixtureId: "mock-serie-a-nap-int-2026-05-16",
      userId: "local-user",
      submittedAt: "2026-05-12T00:00:00.000Z",
      score: {
        home: 3,
        away: 0,
      },
    });

    render(<QuizExperience />);

    fireEvent.click(screen.getByRole("button", { name: "Profile" }));

    expect(screen.getByLabelText("Local prediction summary")).toHaveTextContent(
      "NAP 3-0 INT",
    );
    expect(
      screen.getByLabelText("Prediction rank Pending"),
    ).toBeInTheDocument();
  });

  it("renders a deliberate fallback when question media is missing", () => {
    render(
      <QuestionMedia
        category="Market value"
        freshness={{ label: "Mock valuation", validUntil: "Provider required" }}
        source={{ kind: "mock", label: "Local mock data" }}
      />,
    );

    expect(
      screen.getByRole("img", { name: "No question photo available" }),
    ).toHaveTextContent("Text-only question");
    expect(screen.getByText("Market value")).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "Question data status" }),
    ).toHaveTextContent("Provider required");
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
