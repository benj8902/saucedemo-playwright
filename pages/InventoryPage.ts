import { Page, Locator, expect } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly items: Locator;
  readonly titles: Locator;
  readonly descriptions: Locator;
  readonly prices: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.items = page.getByTestId('inventory-item');
    this.titles = page.getByTestId('inventory-item-name');
    this.descriptions = page.getByTestId('inventory-item-desc');
    this.prices = page.getByTestId('inventory-item-price');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
  }

  async goto() { await this.page.goto('/inventory.html'); }

  async sortBy(option: 'az' | 'za' | 'lohi' | 'hilo') {
    await this.page.getByTestId('product-sort-container').selectOption(option);
  }

  async getPrices(): Promise<number[]> {
    const texts = await this.page.getByTestId('inventory-item-price').allTextContents();
    return texts.map((t) => Number(t.replace('$', '')));
  }

  /** Returns the product card whose title matches `name`. */
  item(name: string): Locator {
    return this.items.filter({
      has: this.page.getByTestId('inventory-item-name').getByText(name, { exact: true }),
    });
  }

  title(name: string): Locator { return this.item(name).getByTestId('inventory-item-name'); }
  description(name: string): Locator { return this.item(name).getByTestId('inventory-item-desc'); }
  price(name: string): Locator { return this.item(name).getByTestId('inventory-item-price'); }
  addToCartButton(name: string): Locator {
    return this.item(name).getByRole('button', { name: 'Add to cart' });
  }

  async addToCart(name: string) {
    await this.addToCartButton(name).click();
  }

  /** Checks there are 6 products and each has a title, description, price and Add to cart button. */
  async expectAllProductsComplete() {
    await expect(this.items).toHaveCount(6);
    for (const item of await this.items.all()) {
      await expect(item.getByTestId('inventory-item-name')).not.toBeEmpty();
      await expect(item.getByTestId('inventory-item-desc')).not.toBeEmpty();
      await expect(item.getByTestId('inventory-item-price')).toHaveText(/^\$\d+\.\d{2}$/);
      await expect(item.getByRole('button', { name: 'Add to cart' })).toBeVisible();
    }
  }
}
