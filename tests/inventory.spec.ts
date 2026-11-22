import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { PASSWORD, STANDARD_USER } from '../test-data/users';

test.describe('Inventory', () => {
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(STANDARD_USER, PASSWORD);
    inventoryPage = new InventoryPage(page);
  });

  test('sorting price low to high orders prices ascending', async () => {
    await inventoryPage.sortBy('lohi');
    const prices = await inventoryPage.getPrices();
    const expected = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(expected);
  });

  test('sorting price high to low orders prices descending', async () => {
    await inventoryPage.sortBy('hilo');
    const prices = await inventoryPage.getPrices();
    const expected = [...prices].sort((a, b) => b - a);
  });

  test('cart badge updates when adding and removing an item', async ({ page }) => {
    const badge = page.getByTestId('shopping-cart-badge');

    await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
    await expect(badge).toHaveText('1');

    await page.getByTestId('remove-sauce-labs-backpack').click();
    await expect(badge).toBeHidden();
  });
});