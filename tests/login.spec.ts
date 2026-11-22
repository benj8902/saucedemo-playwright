import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { STANDARD_USER, PASSWORD, LOCKED_OUT_USER } from '../test-data/users';


test.describe('Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('standard user can log in', async ({ page }) => {
    await loginPage.login(STANDARD_USER, PASSWORD);
    await expect(page).toHaveURL(/inventory/);
  });

  test('locked out user gets error', async () => {
    await loginPage.login(LOCKED_OUT_USER, PASSWORD);
    await expect(loginPage.error).toContainText('locked out');
  });

  test('empty username gives error', async () => {
    await loginPage.login('', PASSWORD);
    await expect(loginPage.error).toContainText('Username is required');
  });

  test('empty password gives error', async () => {
    await loginPage.login(STANDARD_USER, '');
    await expect(loginPage.error).toContainText('Password is required');
  });

  test('empty fields give error', async () => {
    await loginPage.login('', '');
    await expect(loginPage.error).toContainText('Username is required');
  });
});



// test.describe('Login', () => {
  
//   test('standard user can log in', async ({ page }) => {
//   await page.goto('/');
//   await page.getByTestId('username').fill('standard_user');
//   await page.getByTestId('password').fill('secret_sauce');
//   await page.getByTestId('login-button').click();
//   await expect(page).toHaveURL(/inventory/);
//   });

//   test('locked out user cannot log in', async ({ page }) => {
//     await page.goto('/');
//     await page.getByTestId('username').fill('locked_out_user');
//     await page.getByTestId('password').fill('secret_sauce');
//     await page.getByTestId('login-button').click();
//     await expect(page.getByTestId('error'));
//   });

//   test('empty username gives error', async ({ page }) => {
//     await page.goto('/');
//     await page.getByTestId('username').fill('');
//     await page.getByTestId('password').fill('secret_sauce');
//     await page.getByTestId('login-button').click();
//     await expect(page.getByTestId('error'));
//   })

//   test('empty password gives error', async ({ page }) => {
//     await page.goto('/');
//     await page.getByTestId('username').fill('standard_user');
//     await page.getByTestId('password').fill('');
//     await page.getByTestId('login-button').click();
//     await expect(page.getByTestId('error'));
//   })

//   test('empty fields give error', async ({ page }) => {
//     await page.goto('/');
//     await page.getByTestId('username').fill('');
//     await page.getByTestId('password').fill('');
//     await page.getByTestId('login-button').click();
//     await expect(page.getByTestId('error'));
//   })
// })


