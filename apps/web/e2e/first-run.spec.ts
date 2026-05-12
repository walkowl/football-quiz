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
    page.getByRole("img", { name: /football legend/i }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Cristiano Ronaldo" }).tap();
  await expect(page.getByTestId("feedback")).toContainText("Correct");

  await page.getByRole("button", { name: /Next question/ }).tap();
  await page.getByRole("button", { name: "Bayer Leverkusen" }).tap();
  await page.getByRole("button", { name: /Next question/ }).tap();
  await page.getByRole("button", { name: "20-year-old elite winger" }).tap();
  await page.getByRole("button", { name: /Reveal profile/ }).tap();

  await expect(
    page.getByRole("heading", { name: "Advanced Fan" }),
  ).toBeVisible();
  await expect(page.getByLabel("Fan profile summary")).toContainText("100%");
  await expect(page.getByText("Next packs")).toBeVisible();
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
