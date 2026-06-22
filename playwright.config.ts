import { defineConfig, type LaunchOptions } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const shouldStartLocalServer = !process.env.E2E_BASE_URL;
const launchOptions: LaunchOptions | undefined = process.env.PLAYWRIGHT_CHROME_PATH
  ? { executablePath: process.env.PLAYWRIGHT_CHROME_PATH }
  : undefined;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL,
    browserName: "chromium",
    launchOptions,
    trace: "on-first-retry",
  },
  webServer: shouldStartLocalServer
    ? {
        command: "npm run start",
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      }
    : undefined,
});
