import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { PASSWORD, PROBLEM_USER } from '../test-data/users';

test.describe('Known bugs: problem_user', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(PROBLEM_USER, PASSWORD);
  });

  test('every product shows its own image', async ({ page }) => {
    // BUG: every product shows the same dog-with-ball placeholder image.
    test.fail();
  
    const items = page.getByTestId('inventory-item');
    await expect(items.first()).toBeVisible();     // wait until products have rendered
    const productCount = await items.count();      // however many there are today
  
    const images = page.locator('img.inventory_item_img');
    await expect(images).toHaveCount(productCount); // one image per product
  
    const srcs = await images.evaluateAll((imgs) => imgs.map((img) => img.getAttribute('src')));
    expect(srcs.length).toBeGreaterThan(0);         // guard: never pass on an empty list
    expect(new Set(srcs).size).toBe(srcs.length);
  });

  test('remove button on the inventory page removes the item', async ({ page }) => {
    // BUG: "Remove" on the inventory page does nothing; the item stays in the cart.
    test.fail();

    const badge = page.getByTestId('shopping-cart-badge');
    await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
    await page.getByTestId('remove-sauce-labs-backpack').click();
    await expect(badge).toBeHidden();
  });

  test('product name link opens that product', async ({ page }) => {
    // BUG: clicking a product name opens a different product.
    test.fail();

    await page.getByText('Sauce Labs Backpack', { exact: true }).click();
    await expect(page.getByTestId('inventory-item-name')).toHaveText('Sauce Labs Backpack');
  });

  test('every product can be added to the cart', async ({ page }) => {
    // BUG: some products ignore "Add to cart" (e.g. the Bolt T-Shirt).
    test.fail();

    await page.getByTestId('add-to-cart-sauce-labs-bolt-t-shirt').click();
    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
  });

  test('sorting by price low to high reorders products', async ({ page }) => {
    // BUG: choosing a sort option leaves the list unchanged.
    test.fail();

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.sortBy('lohi');
    const prices = await inventoryPage.getPrices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('fleece jacket page shows the product', async ({ page }) => {
    // BUG: the Fleece Jacket link shows "ITEM NOT FOUND" with a price of √-1.
    test.fail();

    await page.getByText('Sauce Labs Fleece Jacket', { exact: true }).click();
    await expect(page.getByTestId('inventory-item-name')).toHaveText('Sauce Labs Fleece Jacket');
  });

  test('last name field keeps its own value at checkout', async ({ page }) => {
    // BUG: typing in Last Name overwrites First Name and leaves Last Name empty.
    test.fail();

    await page.goto('/checkout-step-one.html');
    await page.getByTestId('firstName').fill('Ben');
    await page.getByTestId('lastName').fill('Jacobs');
    await expect(page.getByTestId('firstName')).toHaveValue('Ben');
    await expect(page.getByTestId('lastName')).toHaveValue('Jacobs');
  });
});