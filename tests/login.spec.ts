import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  
  test('standard user can log in', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('username').fill('standard_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();
  await expect(page).toHaveURL(/inventory/);
  });

  test('locked out user cannot log in', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('username').fill('locked_out_user');
    await page.getByTestId('password').fill('secret_sauce');
    await page.getByTestId('login-button').click();
    await expect(page.getByTestId('error'));
  });

  test('empty username gives error', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('username').fill('');
    await page.getByTestId('password').fill('secret_sauce');
    await page.getByTestId('login-button').click();
    await expect(page.getByTestId('error'));
  })

  test('empty password gives error', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('username').fill('standard_user');
    await page.getByTestId('password').fill('');
    await page.getByTestId('login-button').click();
    await expect(page.getByTestId('error'));
  })

  test('empty fields give error', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('username').fill('');
    await page.getByTestId('password').fill('');
    await page.getByTestId('login-button').click();
    await expect(page.getByTestId('error'));
  })
})
