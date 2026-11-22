import { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly items: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.items = page.getByTestId('inventory-item');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
    this.checkoutButton = page.getByTestId('checkout');
  }

  async goto() { await this.page.goto('/cart.html'); }

  /** Opens the cart by clicking the cart icon in the header. */
  async open() { await this.cartLink.click(); }

  /** Returns the cart row whose title matches `name`. */
  item(name: string): Locator {
    return this.items.filter({
      has: this.page.getByTestId('inventory-item-name').getByText(name, { exact: true }),
    });
  }

  price(name: string): Locator { return this.item(name).getByTestId('inventory-item-price'); }
  quantity(name: string): Locator { return this.item(name).getByTestId('item-quantity'); }

  async remove(name: string) {
    await this.item(name).getByRole('button', { name: 'Remove' }).click();
  }

  async continueShopping() { await this.continueShoppingButton.click(); }
  async checkout() { await this.checkoutButton.click(); }
}
