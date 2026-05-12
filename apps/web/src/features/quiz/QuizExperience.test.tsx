import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QuestionMedia, QuizExperience } from "./QuizExperience";

describe("QuizExperience", () => {
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
