import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  readLocalScorePrediction,
  saveLocalScorePrediction,
} from "./localPredictionStorage";
import { readLocalQuizProgress } from "./localQuizProgressStorage";
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
    expect(screen.getByRole("button", { name: /Next question/ })).toBeEnabled();
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
    expect(screen.getAllByText("Rewards locked").length).toBeGreaterThan(0);
    expect(
      screen.queryByText(/bet|odds|wager|payout|cash/i),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Napoli score"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText("Inter score"), {
      target: { value: "1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save prediction" }));

    expect(screen.getByText("Saved 2-1 locally")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "You" })).toBeInTheDocument();
  });

  it("opens the local profile tab with quiz and prediction state", () => {
    render(<QuizExperience />);

    fireEvent.click(screen.getByRole("button", { name: "Profile" }));

    expect(
      screen.getByRole("heading", { name: "Fan Profile" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Questions 0/3")).toBeInTheDocument();
    expect(screen.getByLabelText("Local prediction summary")).toHaveTextContent(
      "No local pick saved",
    );
    expect(screen.getByRole("button", { name: "Profile" })).toHaveAttribute(
      "aria-current",
      "page",
    );
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
    expect(screen.getByLabelText("Prediction pts 0")).toBeInTheDocument();
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
