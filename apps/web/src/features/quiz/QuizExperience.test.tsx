import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QuestionMedia, QuizExperience } from "./QuizExperience";

describe("QuizExperience", () => {
  it("lets a user answer the first question and see feedback", () => {
    render(<QuizExperience />);

    fireEvent.click(screen.getByRole("button", { name: "Cristiano Ronaldo" }));

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

  it("renders a deliberate fallback when question media is missing", () => {
    render(<QuestionMedia category="Market value" />);

    expect(
      screen.getByRole("img", { name: "No question photo available" }),
    ).toHaveTextContent("Text-only question");
    expect(screen.getByText("Market value")).toBeInTheDocument();
  });
});
