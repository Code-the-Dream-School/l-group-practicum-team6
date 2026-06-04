import { execSync } from 'node:child_process';
import { expect, test, type Page } from '@playwright/test';

const password = 'password123';
const runId = Date.now();

function buildUser(index: number) {
  return {
    name: `E2E User ${index}`,
    email: `e2e-user-${runId}-${index}@example.com`,
    password,
  };
}

async function registerUser(page: Page, user: ReturnType<typeof buildUser>) {
  await page.goto('/signup');

  await page.getByLabel('Full Name').fill(user.name);
  await page.getByLabel('Email Address').fill(user.email);
  await page.getByLabel('Password', { exact: true }).fill(user.password);
  await page.getByLabel('Confirm Password').fill(user.password);

  await page.getByRole('button', { name: 'Sign Up' }).click();

  await expect(page).toHaveURL(/\/explore$/);
  await expect(page.getByRole('heading', { name: 'Explore Visuals' })).toBeVisible();
}

async function logout(page: Page) {
  await page.getByRole('button', { name: 'User menu' }).click();
  await page.getByRole('menuitem', { name: 'Log Out' }).click();

  await expect(page).toHaveURL('/');
  await expect(page.getByRole('link', { name: 'Log In' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Sign Up' })).toBeVisible();
}

test.beforeAll(() => {
  execSync('npm run seed:e2e -w backend', { stdio: 'inherit' });
});

test.describe('critical user journeys', () => {
  test('register and onboard', async ({ page }) => {
    const user = buildUser(1);

    await registerUser(page, user);

    await expect(page.getByRole('button', { name: 'User menu' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Explore' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'My Visuals' })).toBeVisible();
  });

  test('login and logout', async ({ page }) => {
    const user = buildUser(2);

    await registerUser(page, user);
    await logout(page);

    await page.goto('/login');

    await page.locator('#login-email').fill(user.email);
    await page.locator('#login-password').fill(user.password);
    await page.getByRole('button', { name: 'Log In' }).click();

    await expect(page).toHaveURL(/\/explore$/);
    await expect(page.getByRole('button', { name: 'User menu' })).toBeVisible();

    await logout(page);
  });

  test('explore and save visualizer', async ({ page }) => {
    const user = buildUser(3);

    await registerUser(page, user);

    const saveButton = page.getByRole('button', { name: /^Save / }).first();
    const saveButtonLabel = await saveButton.getAttribute('aria-label');
    const visualName = saveButtonLabel?.replace(/^Save /, '');

    expect(visualName).toBeTruthy();

    await saveButton.click();

    await expect(page.getByRole('button', { name: `Unsave ${visualName}` })).toBeVisible();

    await page.getByRole('link', { name: 'My Visuals' }).click();

    await expect(page).toHaveURL(/\/my-visuals$/);
    await expect(page.getByRole('heading', { name: 'My Favorites' })).toBeVisible();
    await expect(page.getByRole('heading', { name: visualName! })).toBeVisible();
  });

  test('demo player renders canvas', async ({ page }) => {
    await page.goto('/visualizer/demo');

    const canvas = page.locator('canvas').first();

    await expect(canvas).toBeVisible();

    const canvasWidth = await canvas.evaluate((element) => (element as HTMLCanvasElement).width);

    expect(canvasWidth).toBeGreaterThan(0);
  });

  test('protected route redirects logged-out user to login', async ({ page }) => {
    await page.goto('/my-visuals');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  });
});
