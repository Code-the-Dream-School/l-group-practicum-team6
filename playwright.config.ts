import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load backend/.env so MONGO_URI_E2E resolves here (this config runs in the
// root process; dotenv otherwise only loads inside the backend process).
dotenv.config({ path: './backend/.env' });

const e2eMongoUri = process.env.MONGO_URI_E2E ?? process.env.MONGO_URI_TEST;
if (!e2eMongoUri) {
  throw new Error('MONGO_URI_E2E (or MONGO_URI_TEST) is required for e2e — add it to backend/.env');
}

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  // E2E runs fully isolated from local dev: dedicated ports (backend 5002,
  // frontend 5174) and the dedicated E2E database. reuseExistingServer is
  // always false so the suite never reuses a dev server pointed at the real
  // DB, and the distinct ports avoid colliding with dev (backend 5001,
  // frontend 5173) running at the same time.
  webServer: [
    {
      command: 'npm run dev -w backend',
      url: 'http://localhost:5002/api/v1/health',
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        PORT: '5002',
        MONGO_URI: e2eMongoUri,
      },
    },
    {
      command: 'npm run dev -w frontend -- --port 5174',
      url: 'http://localhost:5174',
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        // Injected into the Vite dev process; vite.config.ts reads it to point
        // the /api proxy at the e2e backend (5002) instead of dev (5001).
        VITE_PROXY_TARGET: 'http://localhost:5002',
      },
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
