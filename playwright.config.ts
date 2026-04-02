import { defineConfig } from "@playwright/test";

const chromeExecutable =
  process.env.PLAYWRIGHT_CHROME_PATH ??
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: "http://127.0.0.1:3000",
    browserName: "chromium",
    launchOptions: {
      executablePath: chromeExecutable,
    },
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run start",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
