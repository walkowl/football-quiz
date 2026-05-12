import { defineConfig } from "@playwright/test";

export default defineConfig({
  expect: {
    timeout: 5_000,
  },
  fullyParallel: false,
  reporter: [["list"]],
  testDir: "./e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run start -- -H 127.0.0.1 -p 3100",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    url: "http://127.0.0.1:3100",
  },
  projects: [
    {
      name: "mobile-chromium",
      use: {
        browserName: "chromium",
        deviceScaleFactor: 3,
        hasTouch: true,
        isMobile: true,
        viewport: {
          height: 844,
          width: 390,
        },
      },
    },
  ],
});
