import { Page, Locator } from '@playwright/test';

/** Covers all three checkout screens: your information, overview, and complete. */
export class CheckoutPage {
  readonly page: Page;

  // Step one: your information
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly error: Locator;

  // Step two: overview
  readonly items: Locator;
  readonly subtotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;
  readonly finishButton: Locator;

  // Complete
  readonly completeHeader: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.firstName = page.getByTestId('firstName');
    this.lastName = page.getByTestId('lastName');
    this.postalCode = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.cancelButton = page.getByTestId('cancel');
    this.error = page.getByTestId('error');

    this.items = page.getByTestId('inventory-item');
    this.subtotal = page.getByTestId('subtotal-label');
    this.tax = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');

    this.completeHeader = page.getByTestId('complete-header');
    this.backHomeButton = page.getByTestId('back-to-products');
  }

  async fillInformation(first: string, last: string, postal: string) {
    await this.firstName.fill(first);
    await this.lastName.fill(last);
    await this.postalCode.fill(postal);
    await this.continueButton.click();
  }

  async cancel() { await this.cancelButton.click(); }
  async finish() { await this.finishButton.click(); }

  /** Reads a dollar amount from a label like "Item total: $29.99". */
  async amount(label: Locator): Promise<number> {
    const text = await label.textContent();
    const match = text?.match(/\$(\d+\.\d{2})/);
    if (!match) throw new Error(`No dollar amount in "${text}"`);
    return Number(match[1]);
  }
}
