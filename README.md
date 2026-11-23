# Saucedemo Playwright Test Suite

![Playwright Tests](https://github.com/benj8902/saucedemo-playwright/actions/workflows/playwright.yml/badge.svg)

End-to-end UI and API test automation for [saucedemo.com](https://www.saucedemo.com), a practice e-commerce site, and [Restful Booker](https://restful-booker.herokuapp.com), a practice booking API. Built with Playwright and TypeScript, using the Page Object Model and running in GitHub Actions on every push.

**31 tests · 85 runs per push** (27 UI tests × Chromium, Firefox and WebKit, plus 4 API tests) · **7 real defects found and documented**

![HTML test report](docs/report.png)

## Tech stack

- **Playwright** for UI and API testing
- **TypeScript**
- **Page Object Model** for maintainable UI tests
- **GitHub Actions** for CI on every push and pull request

## What's covered

| Area | Tests | What they check |
| --- | --- | --- |
| Login | 6 | Valid login, locked-out user, wrong password, empty username, empty password, empty fields |
| Inventory | 3 | Sorting by price (both directions) and the cart badge updating on add and remove |
| Cart | 5 | Empty cart, added items and prices, removing items, continue shopping, going to checkout |
| Checkout | 6 | Full purchase, order totals adding up, required first name, last name and postal code, cancel |
| Known bugs | 7 | Defects found through exploratory testing as `problem_user` (see below) |
| API | 4 | GET a booking, create and read back a booking, authenticated update, update without a token is rejected (403) |

## Bugs found

I explored the site as `problem_user` side by side with `standard_user` and found these defects. Each one has a test that checks for the *correct* behavior and is marked with `test.fail()`, so the suite stays green while the bug exists and flags it automatically once it's fixed.

| # | Bug | Severity |
| --- | --- | --- |
| 1 | Last Name field overwrites First Name at checkout, so checkout can't be completed | High: blocks purchases |
| 2 | Some products can't be added to the cart (e.g. Bolt T-Shirt) | High |
| 3 | "Remove" on the inventory page does nothing | Medium |
| 4 | Product name links open the wrong product | Medium |
| 5 | Fleece Jacket page shows "ITEM NOT FOUND" with a price of √-1 | Medium |
| 6 | Sorting has no effect | Medium |
| 7 | Every product shows the same placeholder image | Low |

## How to run it

Requires Node.js 20 or newer.

```bash
git clone https://github.com/benj8902/saucedemo-playwright.git
cd saucedemo-playwright
npm ci
npx playwright install --with-deps
```

```bash
npx playwright test                    # everything: UI in 3 browsers + API
npx playwright test --project=chromium # UI tests in one browser
npx playwright test --project=api      # API tests only
npx playwright test --ui               # interactive UI mode
npx playwright show-report             # open the HTML report
```

## Project structure

```
pages/              Page objects: locators and actions for each page
  LoginPage.ts
  InventoryPage.ts
  CartPage.ts
  CheckoutPage.ts
tests/
  login.spec.ts
  inventory.spec.ts
  cart.spec.ts
  checkout.spec.ts
  known-bugs.spec.ts  Defects found as problem_user, marked test.fail()
  api/
    booking.spec.ts   Restful Booker API tests
test-data/
  users.ts          Test accounts
playwright.config.ts
.github/workflows/playwright.yml
```

## Design decisions

- **Page Object Model.** Each page's locators and actions live in one class, so a UI change means editing one file instead of every test. Page objects *do* things; every assertion stays in the test files.
- **`data-test` locators.** The config sets `testIdAttribute: 'data-test'`, so tests use `getByTestId(...)` against attributes meant for testing rather than CSS classes or text that may change.
- **No fixed waits.** Tests rely on Playwright's auto-waiting assertions instead of `waitForTimeout`. Methods that don't auto-wait (`count`, `allTextContents`, `evaluateAll`) are only called after waiting for the elements to render.
- **Guarding against false passes.** Any test that reads a list first asserts the list isn't empty, because "all items are sorted" or "all images are unique" is trivially true for zero items. Sorting tests compare against a sorted *copy*, since `.sort()` changes the original array.
- **Known bugs tracked with `test.fail()`.** Defects are documented in code without turning CI red, and a fix shows up immediately as an unexpected pass.
- **A separate API project.** API tests run once rather than once per browser, and the browser projects ignore `tests/api`.
- **Independent API tests on shared data.** Restful Booker is a public sandbox that other people change and that resets regularly. Tests never hard-code IDs: each one looks up a real booking or creates its own through a helper, so tests don't affect each other or anyone else's data.

## Lessons learned

- **A flaky test that passed by accident.** The "every product shows its own image" check failed only in Chromium during full runs. `evaluateAll` doesn't wait for elements, so it sometimes read an empty list before the images rendered, and the uniqueness check passed on zero images. Fixed by waiting for the products to render, requiring one image per product and asserting the list isn't empty. Verified stable with `--repeat-each=10`.
- **Confirm a bug against a baseline before reporting it.** One product name that looked like a bug for `problem_user` turned out to be real data that `standard_user` sees too.
