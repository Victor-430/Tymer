import { test, expect } from "@playwright/test";
import { DEMO_EMAIL, DEMO_PASSWORD } from "../../mock/shared";

test("demo login, navigation, refresh, and logout work without backend requests", async ({ page }) => {
  const apiRequests: string[] = [];
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && /hydration|hydrating|server rendered HTML/i.test(message.text())) errors.push(message.text());
  });
  // Catch all browser fetch/XHR attempts, including accidental calls to a configured URL.
  await page.route("**/*", (route) => {
    const request = route.request();
    if (["fetch", "xhr"].includes(request.resourceType()) && !new URL(request.url()).pathname.startsWith("/_next/") && !new URL(request.url()).searchParams.has("_rsc")) {
      apiRequests.push(request.url());
      return route.abort();
    }
    return route.continue();
  });
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText("Email is required.")).toBeVisible();
  await page.getByLabel("Email address").fill(DEMO_EMAIL);
  await page.getByLabel("Password", { exact: true }).fill("incorrect");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("form", { name: "Admin login" }).getByRole("alert")).toHaveText("The email or password is incorrect.");
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel("Email address").fill(` ${DEMO_EMAIL} `);
  await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByLabel("Password", { exact: true }).press("Enter");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Welcome, Demo." })).toBeVisible();
  await expect(page.getByText(DEMO_EMAIL, { exact: true })).toBeVisible();
  await expect(page.getByText("TYMER-DEMO", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Tymer home" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Welcome, Demo." })).toBeVisible();
  expect(await page.evaluate(() => [sessionStorage.length, localStorage.length])).toEqual([0, 0]);
  await page.reload();
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel("Email address").fill(DEMO_EMAIL);
  await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.getByRole("button", { name: "Log out", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => [sessionStorage.length, localStorage.length])).toEqual([0, 0]);
  expect(apiRequests).toEqual([]);
  expect(errors).toEqual([]);
});
