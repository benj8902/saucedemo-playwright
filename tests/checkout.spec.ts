import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { STANDARD_USER, PASSWORD } from '../test-data/users';

const BACKPACK = 'Sauce Labs Backpack';
const BIKE_LIGHT = 'Sauce Labs Bike Light';

test.describe('Checkout', () => {
  let inventoryPage: InventoryPage;
  let checkoutPage: CheckoutPage;

  // Log in, add two products, and go to the "Your Information" screen.
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(STANDARD_USER, PASSWORD);

    inventoryPage = new InventoryPage(page);
    await inventoryPage.addToCart(BACKPACK);
    await inventoryPage.addToCart(BIKE_LIGHT);

    const cartPage = new CartPage(page);
    await cartPage.open();
    await cartPage.checkout();

    checkoutPage = new CheckoutPage(page);
  });

  test('user can complete a purchase', async ({ page }) => {
    await checkoutPage.fillInformation('Test', 'User', '12345');
    await expect(page).toHaveURL(/checkout-step-two/);
    await expect(checkoutPage.items).toHaveCount(2);

    await checkoutPage.finish();
    await expect(page).toHaveURL(/checkout-complete/);
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');

    await checkoutPage.backHomeButton.click();
    await expect(page).toHaveURL(/inventory/);
    await expect(inventoryPage.cartBadge).toBeHidden();
  });

  test('overview totals add up', async () => {
    await checkoutPage.fillInformation('Test', 'User', '12345');

    const subtotal = await checkoutPage.amount(checkoutPage.subtotal);
    const tax = await checkoutPage.amount(checkoutPage.tax);
    const total = await checkoutPage.amount(checkoutPage.total);

    // Backpack $29.99 + Bike Light $9.99
    expect(subtotal).toBeCloseTo(39.98, 2);
    expect(total).toBeCloseTo(subtotal + tax, 2);
  });

  test('first name is required', async () => {
    await checkoutPage.fillInformation('', 'User', '12345');
    await expect(checkoutPage.error).toContainText('First Name is required');
  });

  test('last name is required', async () => {
    await checkoutPage.fillInformation('Test', '', '12345');
    await expect(checkoutPage.error).toContainText('Last Name is required');
  });

  test('postal code is required', async () => {
    await checkoutPage.fillInformation('Test', 'User', '');
    await expect(checkoutPage.error).toContainText('Postal Code is required');
  });

  test('cancel returns to the cart', async ({ page }) => {
    await checkoutPage.cancel();
    await expect(page).toHaveURL(/cart/);
  });
});
