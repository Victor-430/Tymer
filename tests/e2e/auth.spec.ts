import { test, expect, type Page, type Route } from "@playwright/test";
import { loginResponse } from "../fixtures/auth";

const browserErrors = new WeakMap<Page, string[]>();

test.beforeEach(({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && /hydration|hydrating|server rendered HTML|unstable value/i.test(message.text())) {
      errors.push(message.text());
    }
  });
});

test.afterEach(({ page }) => {
  expect(browserErrors.get(page), "No runtime or hydration errors").toEqual([]);
});

async function mockLogin(page: Page, body: unknown, status = 200) {
  await page.route("**/admin/login", (route: Route) => route.fulfill({
    status, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(body),
  }));
}

async function fillLogin(page: Page, password = " existing password ") {
  await page.getByLabel("Email address").fill(" admin@example.com ");
  await page.getByLabel("Password", { exact: true }).fill(password);
}

test("redirects guests, validates accessibly, and supports keyboard login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText("Email is required.")).toBeVisible();
  await expect(page.getByText("Password is required.")).toBeVisible();
  await expect(page.getByLabel("Email address")).toHaveAttribute("aria-invalid", "true");
  await page.getByLabel("Email address").fill("bad-email");
  await page.getByLabel("Password", { exact: true }).fill("x");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  await mockLogin(page, loginResponse());
  await fillLogin(page);
  await page.getByLabel("Password", { exact: true }).press("Enter");
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("trims submitted email, preserves password, shows the employee, and logs out", async ({ page }) => {
  const requests: unknown[] = [];
  await page.route("**/admin/login", async (route) => {
    requests.push(route.request().postDataJSON());
    expect(route.request().headers().authorization).toBeUndefined();
    await route.fulfill({ json: loginResponse(), headers: { "access-control-allow-origin": "*" } });
  });
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
  await fillLogin(page);
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Hide password" }).click();
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Welcome, Test." })).toBeVisible();
  expect(requests).toEqual([{ email: "admin@example.com", password: " existing password " }]);
  // Navigate through Next's Link so the existing provider and in-memory auth survive.
  await page.getByRole("link", { name: "Tymer home" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Welcome, Test." })).toBeVisible();
  expect(await page.evaluate(() => [sessionStorage.length, localStorage.length])).toEqual([0, 0]);
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => [sessionStorage.length, localStorage.length])).toEqual([0, 0]);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
});

test("maps HTTP 422 errors to matching inputs", async ({ page }) => {
  await mockLogin(page, { detail: [{ loc: ["body", "email"], msg: "Email not accepted" }, { loc: ["body", "password"], msg: "Password not accepted" }] }, 422);
  await page.goto("/login");
  await fillLogin(page);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText("Email not accepted", { exact: true })).toBeVisible();
  await expect(page.getByText("Password not accepted", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

for (const scenario of [
  { name: "business failure", body: { responseCode: "01", responseMessage: "Invalid credentials" }, status: 200, message: "Invalid credentials" },
  { name: "invalid success response", body: { responseCode: "00", responseMessage: "OK", data: {} }, status: 200, message: "The server returned invalid login data. Please try again." },
  { name: "empty access token", body: { ...loginResponse(), data: { ...loginResponse().data, access_token: " " } }, status: 200, message: "The server returned invalid login data. Please try again." },
  { name: "missing employee", body: { ...loginResponse(), data: { ...loginResponse().data, employee: {} } }, status: 200, message: "The server returned invalid login data. Please try again." },
  { name: "rejected credentials", body: { detail: "Invalid email or password" }, status: 401, message: "Invalid email or password" },
]) {
  test(`keeps ${scenario.name} on the login page`, async ({ page }) => {
    await mockLogin(page, scenario.body, scenario.status);
    await page.goto("/login");
    await fillLogin(page);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page.getByRole("form", { name: "Admin login" }).getByRole("alert")).toHaveText(scenario.message);
    await expect(page).toHaveURL(/\/login$/);
  });
}

test("shows a recoverable network error", async ({ page }) => {
  await page.route("**/admin/login", (route) => route.abort("failed"));
  await page.goto("/login");
  await fillLogin(page);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("form", { name: "Admin login" }).getByRole("alert")).toContainText("Check your connection");
  await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeEnabled();
});

test("prevents duplicate submissions while a request is pending", async ({ page }) => {
  let requests = 0;
  let release!: () => void;
  const pending = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/admin/login", async (route) => {
    requests++;
    await pending;
    await route.fulfill({ json: loginResponse(), headers: { "access-control-allow-origin": "*" } });
  });
  await page.goto("/login");
  await fillLogin(page);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect.poll(() => requests).toBe(1);
  await expect(page.getByRole("button", { name: "Signing in…" })).toBeDisabled();
  await page.getByRole("form", { name: "Admin login" }).evaluate((form) => {
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
  release();
  await expect(page).toHaveURL(/\/dashboard$/);
  expect(requests).toBe(1);
});

test("requires login again after refreshing the dashboard", async ({ page }) => {
  await mockLogin(page, loginResponse());
  await page.goto("/login");
  await fillLogin(page);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Welcome, Test." })).toBeVisible();
  await page.reload();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Sign in to Tymer" })).toBeVisible();
  expect(await page.evaluate(() => [sessionStorage.length, localStorage.length])).toEqual([0, 0]);
});

test("fits mobile screens and uses IBM Plex Sans", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Sign in to Tymer" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(await page.getByLabel("Email address").evaluate((input) => getComputedStyle(input).fontFamily)).toContain("IBM Plex Sans");
  await page.screenshot({ path: testInfo.outputPath("login-mobile.png"), fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: testInfo.outputPath("login-desktop.png"), fullPage: true });
  await mockLogin(page, loginResponse());
  await fillLogin(page);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.screenshot({ path: testInfo.outputPath("dashboard-desktop.png"), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
