import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("first-run quiz can be completed on a mobile viewport", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Footy Guess" }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: /portugal footballer/i }),
  ).toBeVisible();
  const dataStatus = page.getByRole("group", {
    name: "Question data status",
  });
  await expect(dataStatus).toContainText("Mock week");
  await expect(dataStatus).toContainText("Replace before beta");

  await page.getByRole("button", { name: "Cristiano Ronaldo" }).tap();
  await expect(page.getByTestId("feedback")).toContainText("Correct");
  await expect(page.getByText("This quiz: Better than 94%")).toBeVisible();
  await expect(page.getByText(/Score:/)).toHaveCount(0);

  await page.getByRole("button", { name: /Next question/ }).tap();
  await page.getByRole("button", { name: "Bayer Leverkusen" }).tap();
  await page.getByRole("button", { name: /Next question/ }).tap();
  await expect(
    page.getByRole("img", { name: "No question photo available" }),
  ).toContainText("Text-only question");
  await page.getByRole("button", { name: "20-year-old elite winger" }).tap();
  await page.getByRole("button", { name: /Reveal profile/ }).tap();

  await expect(
    page.getByRole("heading", { name: "Advanced Fan" }),
  ).toBeVisible();
  await expect(
    page.getByText("This quiz: Better than 94% of players"),
  ).toBeVisible();
  await expect(page.getByLabel("Fan profile summary")).toContainText("100%");
  await expect(page.getByText("Next packs")).toBeVisible();

  await page.getByRole("button", { name: "Home" }).tap();
  await expect(page.getByRole("heading", { name: "Next quiz" })).toBeVisible();
  await expect(
    page.getByText("Weekly Pulse / Results, scorers, tables, form."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open Next quiz" }).tap();
  await expect(
    page.getByRole("heading", {
      name: "Who won the featured derby in this week's local pulse?",
    }),
  ).toBeVisible();

  await page.reload();
  await page.getByRole("button", { name: "Profile" }).tap();
  await expect(
    page.getByRole("region", { name: "Local profile" }),
  ).toContainText("Advanced Fan");
  await expect(page.getByLabel("Questions 3/3")).toBeVisible();
  await expect(page.getByLabel("Quiz accuracy 100%")).toBeVisible();

  await page.getByRole("button", { name: "Start Weekly Pulse" }).tap();
  await expect(
    page.getByRole("heading", {
      name: "Who won the featured derby in this week's local pulse?",
    }),
  ).toBeVisible();
  await expect(page.getByText("Question 1/3")).toBeVisible();

  await page.getByRole("button", { name: "Profile" }).tap();
  await expect(page.getByLabel("Local quiz history")).toContainText(
    "Legend Challenge / 3/3",
  );
  await expect(page.getByLabel("Questions 3/3")).toBeVisible();

  await page.getByRole("button", { name: "Play" }).tap();
  await expect(
    page.getByRole("heading", {
      name: "Who won the featured derby in this week's local pulse?",
    }),
  ).toBeVisible();
});

test("home screen has no serious accessibility violations", async ({
  page,
}) => {
  await page.goto("/");

  const results = await new AxeBuilder({ page })
    .disableRules(["color-contrast"])
    .analyze();

  expect(results.violations).toEqual([]);
});

test("prediction league saves a local score on mobile", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  await page.getByRole("button", { name: "Leaderboard" }).tap();

  await expect(
    page.getByRole("heading", { name: "Score League" }),
  ).toBeVisible();
  await expect(page.getByLabel("Prediction league status")).toContainText(
    "Rewards locked",
  );
  await expect(page.getByText("Open for picks")).toBeVisible();
  await expect(page.getByText("Locks May 16, 06:45 PM UTC")).toBeVisible();
  await expect(page.getByLabel("Standing")).toContainText("No pick");
  await expect(page.getByText("Better than 67%")).toBeVisible();

  await page.getByLabel("Napoli score").fill("2");
  await page.getByLabel("Inter score").fill("1");
  await page.getByRole("button", { name: "Save prediction" }).tap();

  await expect(page.getByText("Saved 2-1 locally")).toBeVisible();
  await expect(page.getByLabel("Standing")).toContainText("Pending");
  await expect(page.getByText("Pending result.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "You" })).toBeVisible();
  await expect(
    page.getByText(/\b(bet|betting|odds|wager|payout|cash)\b/i),
  ).toHaveCount(0);

  await page.reload();
  await page.getByRole("button", { name: "Leaderboard" }).tap();

  await expect(page.getByText("Restored 2-1 from this device")).toBeVisible();
  await expect(page.getByLabel("Napoli score")).toHaveValue("2");
  await expect(page.getByLabel("Inter score")).toHaveValue("1");

  await page.getByLabel("Napoli score").fill("3");
  await expect(page.getByText("Unsaved changes to 3-1")).toBeVisible();
  await page.getByRole("button", { name: "Update prediction" }).tap();
  await expect(page.getByText("Saved 3-1 locally")).toBeVisible();

  await page.reload();
  await page.getByRole("button", { name: "Leaderboard" }).tap();
  await expect(page.getByText("Restored 3-1 from this device")).toBeVisible();

  await page.getByRole("button", { name: "Clear local pick" }).tap();
  await expect(page.getByRole("heading", { name: "You" })).toHaveCount(0);
  await expect(page.getByLabel("Napoli score")).toHaveValue("1");
  await expect(page.getByLabel("Inter score")).toHaveValue("1");

  await page.reload();
  await page.getByRole("button", { name: "Leaderboard" }).tap();
  await expect(page.getByText("Restored 3-1 from this device")).toHaveCount(0);

  await expect(page.getByRole("button", { name: "Leaderboard" })).toBeVisible();
});

test("profile tab summarizes local quiz and prediction state", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  await page.getByRole("button", { name: "Profile" }).tap();

  await expect(
    page.getByRole("heading", { name: "Fan Profile" }),
  ).toBeVisible();
  await expect(page.getByLabel("Questions 0/3")).toBeVisible();
  await expect(page.getByLabel("Local prediction summary")).toContainText(
    "No local pick saved",
  );

  await page.getByRole("button", { name: "Leaderboard" }).tap();
  await page.getByLabel("Napoli score").fill("2");
  await page.getByLabel("Inter score").fill("1");
  await page.getByRole("button", { name: "Save prediction" }).tap();
  await page.getByRole("button", { name: "Profile" }).tap();

  await expect(page.getByLabel("Local prediction summary")).toContainText(
    "NAP 2-1 INT",
  );
  await expect(page.getByLabel("Prediction rank Pending")).toBeVisible();
});

test("local settings can reset device-only state", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  await page.getByRole("button", { name: "Cristiano Ronaldo" }).tap();
  await page.getByRole("button", { name: "Leaderboard" }).tap();
  await page.getByLabel("Napoli score").fill("2");
  await page.getByLabel("Inter score").fill("1");
  await page.getByRole("button", { name: "Save prediction" }).tap();

  await page.getByRole("button", { name: "Settings" }).tap();

  await expect(page.getByRole("dialog", { name: "Controls" })).toBeVisible();
  await expect(page.getByText("NAP 2-1 INT")).toBeVisible();
  await page.getByRole("button", { name: "Reset data" }).tap();

  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByLabel("0% complete")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Who is this football legend?" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Leaderboard" }).tap();
  await expect(page.getByText("Restored 2-1 from this device")).toHaveCount(0);
});

test("home hub routes between local mobile surfaces", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  await page.getByRole("button", { name: "Home" }).tap();

  await expect(
    page.getByRole("heading", { name: "Matchday Hub" }),
  ).toBeVisible();
  await expect(page.getByLabel("Home status")).toContainText("Mock data");
  await expect(page.getByText("Benchmark pending").first()).toBeVisible();
  await expect(page.getByText("Overall: Benchmark pending")).toBeVisible();

  await page.getByRole("button", { name: "Open Continue quiz" }).tap();
  await expect(
    page.getByRole("heading", { name: "Who is this football legend?" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Cristiano Ronaldo" }).tap();
  await page.getByRole("button", { name: "Home" }).tap();
  await expect(page.getByText("Overall: Better than 94%")).toBeVisible();

  await page.getByRole("button", { name: "Open Fan profile" }).tap();
  await expect(
    page.getByRole("heading", { name: "Fan Profile" }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Overall players Better than 94%"),
  ).toBeVisible();

  await page.getByRole("button", { name: "Home" }).tap();
  await page.getByRole("button", { name: "Open Score League" }).tap();
  await expect(
    page.getByRole("heading", { name: "Score League" }),
  ).toBeVisible();
});

test("home screen keeps the approved mobile visual direction", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.locator(".phone-frame")).toHaveScreenshot(
    "phone-home.png",
    {
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.03,
    },
  );
});
