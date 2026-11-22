import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { STANDARD_USER, PASSWORD } from '../test-data/users';

const BACKPACK = 'Sauce Labs Backpack';
const BIKE_LIGHT = 'Sauce Labs Bike Light';

test.describe('Cart', () => {
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(STANDARD_USER, PASSWORD);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
  });

  test('cart is empty when nothing has been added', async () => {
    await cartPage.open();
    await expect(cartPage.items).toHaveCount(0);
    await expect(cartPage.cartBadge).toBeHidden();
  });

  test('added products show in the cart with their price', async () => {
    const backpackPrice = await inventoryPage.price(BACKPACK).textContent();
    await inventoryPage.addToCart(BACKPACK);
    await inventoryPage.addToCart(BIKE_LIGHT);
    await expect(cartPage.cartBadge).toHaveText('2');

    await cartPage.open();
    await expect(cartPage.items).toHaveCount(2);
    await expect(cartPage.price(BACKPACK)).toHaveText(backpackPrice!);
    await expect(cartPage.quantity(BACKPACK)).toHaveText('1');
    await expect(cartPage.item(BIKE_LIGHT)).toBeVisible();
  });

  test('removing a product takes it out of the cart', async () => {
    await inventoryPage.addToCart(BACKPACK);
    await inventoryPage.addToCart(BIKE_LIGHT);
    await cartPage.open();

    await cartPage.remove(BACKPACK);
    await expect(cartPage.item(BACKPACK)).toHaveCount(0);
    await expect(cartPage.items).toHaveCount(1);
    await expect(cartPage.cartBadge).toHaveText('1');
  });

  test('continue shopping returns to the inventory page', async ({ page }) => {
    await cartPage.open();
    await cartPage.continueShopping();
    await expect(page).toHaveURL(/inventory/);
  });

  test('checkout button opens the checkout page', async ({ page }) => {
    await inventoryPage.addToCart(BACKPACK);
    await cartPage.open();
    await cartPage.checkout();
    await expect(page).toHaveURL(/checkout-step-one/);
  });
});
