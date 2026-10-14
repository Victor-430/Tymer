import { test, expect, type Page } from "@playwright/test";
import { DEMO_EMAIL, DEMO_PASSWORD } from "../../mock/shared";

const failures = new WeakMap<Page, string[]>();
const backendCalls = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const errors: string[] = [], calls: string[] = [];
  failures.set(page, errors); backendCalls.set(page, calls);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error" && /hydration|hydrating|server rendered HTML/i.test(message.text())) errors.push(message.text()); });
  await page.route("**/*", (route) => {
    const request = route.request(), url = new URL(request.url());
    if (["fetch", "xhr"].includes(request.resourceType()) && !url.pathname.startsWith("/_next/") && !url.searchParams.has("_rsc")) { calls.push(request.url()); return route.abort(); }
    return route.continue();
  });
});
test.afterEach(({ page }) => { expect(failures.get(page)).toEqual([]); expect(backendCalls.get(page)).toEqual([]); });

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(DEMO_EMAIL);
  await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test("overview metrics, accessible charts and navigation cover every domain", async ({ page }) => {
  await login(page);
  await expect(page.getByRole("link", { name: /Attendance today: 4\/5/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Patrols completed: 1\/2/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Tasks completed: 1\/5/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Visitors inside: 1\. 2 visits today/ })).toBeVisible();
  await expect(page.getByRole("figure", { name: "Employee attendance", exact: true })).toBeVisible();
  await expect(page.getByRole("figure", { name: "Today’s task sessions", exact: true })).toBeVisible();
  expect(await page.locator("main > section").first().evaluate((e) => e.getBoundingClientRect().width)).toBeGreaterThan(800);
  await expect(page.getByRole("figure", { name: "Employee attendance", exact: true })).toHaveAttribute("class", /figure/);
  await page.screenshot({ path: "test-results/dashboard-desktop.png", fullPage: true });
  const names = ["Employees", "Locations", "Attendance", "Patrols", "Tasks", "Visitors", "Organization"];
  for (const name of names) {
    await page.getByRole("navigation", { name: "Workspace navigation" }).getByRole("link", { name, exact: true }).click();
    await expect(page.getByRole("heading", { name, exact: true, level: 1 })).toBeVisible();
    await expect(page.getByRole("navigation").getByRole("link", { name, exact: true })).toHaveAttribute("aria-current", "page");
    await expect(page.locator('table[data-slot="table"]:visible')).toBeVisible();
  }
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
});

test("shared tables search, filter, sort, show empty states and inspect related records", async ({ page }) => {
  await login(page);
  await page.getByRole("link", { name: "Employees", exact: true }).click();
  await page.getByLabel("Search Employee directory", { exact: true }).fill("aDA");
  await expect(page.locator('table[data-slot="table"]:visible').getByText("Ada Okafor", { exact: true })).toBeVisible();
  await expect(page.locator('table[data-slot="table"]:visible').getByText("Maya Cole", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "View Employee directory record 2", exact: true }).click();
  const sheet = page.getByRole("dialog");
  await expect(sheet.getByRole("heading", { name: "Employee directory details" })).toBeVisible();
  await expect(sheet.getByText("Head Office · ALL · Active", { exact: true })).toBeVisible();
  await sheet.getByRole("button", { name: "Close", exact: true }).click();
  await expect(page.getByRole("button", { name: "View Employee directory record 2", exact: true })).toBeFocused();
  await page.getByLabel("Search Employee directory", { exact: true }).fill("");
  await page.getByLabel("Filter Employee directory by status").selectOption("INACTIVE");
  await expect(page.locator('table[data-slot="table"]:visible').getByText("Zoe Lane", { exact: true })).toBeVisible();
  await expect(page.locator('table[data-slot="table"]:visible').getByText("Ada Okafor", { exact: true })).toHaveCount(0);
  await page.getByLabel("Filter Employee directory by status").selectOption("");
  await page.getByRole("button", { name: "Sort Employee directory by Employee", exact: true }).click();
  await expect(page.locator('table[data-slot="table"]:visible').locator("tbody tr").first()).toContainText("Ada Okafor");
  await page.getByRole("button", { name: "Sort Employee directory by Employee", exact: true }).click();
  await expect(page.locator('table[data-slot="table"]:visible').locator("tbody tr").first()).toContainText("Zoe Lane");
  await expect(page.getByRole("button", { name: "Next", exact: true })).toBeDisabled();
  await page.getByLabel("Search Employee directory", { exact: true }).fill("no such employee");
  await expect(page.getByText("No matching records", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.locator('table[data-slot="table"]:visible').locator("tbody tr")).toHaveCount(6);
});

test("date validation and filters update sessions without treating waiting states as completed", async ({ page }) => {
  await login(page);
  await page.getByRole("link", { name: "Tasks", exact: true }).click();
  await expect(page.locator('table[data-slot="table"]:visible').getByText("Awaiting Task Evidence", { exact: true })).toBeVisible();
  await expect(page.locator('table[data-slot="table"]:visible').getByText("Awaiting Facial Verification", { exact: true })).toBeVisible();
  await page.getByLabel("From", { exact: true }).fill("2026-10-13");
  await page.getByLabel("To", { exact: true }).fill("2026-10-12");
  await page.getByRole("button", { name: "Apply dates" }).click();
  await expect(page.locator('main [role="alert"]')).toHaveText("End date must be on or after the start date.");
  await page.getByLabel("From", { exact: true }).fill("2026-10-12");
  await page.getByRole("button", { name: "Apply dates" }).click();
  await expect(page.locator('table[data-slot="table"]:visible').locator("tbody tr")).toHaveCount(1);
  await expect(page.locator('table[data-slot="table"]:visible').getByText("Not Completed", { exact: true })).toBeVisible();
  await page.getByLabel("From", { exact: true }).fill("2026-10-14");
  await page.getByLabel("To", { exact: true }).fill("2026-10-14");
  await page.getByRole("button", { name: "Apply dates" }).click();
  await expect(page.locator('table[data-slot="table"]:visible').getByText("No records available", { exact: true })).toBeVisible();
});

test("related dataset tabs expose location tags, patrol reports and task analytics", async ({ page }) => {
  await login(page);
  await page.getByRole("link", { name: "Locations", exact: true }).click();
  await page.getByRole("tab", { name: "NFC tags", exact: true }).click();
  await expect(page.locator('table[data-slot="table"]:visible').getByText("TAG-3", { exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "Recorded access", exact: true }).click();
  await expect(page.locator('table[data-slot="table"]:visible').locator("tbody tr")).toHaveCount(2);
  await page.getByRole("link", { name: "Patrols", exact: true }).click();
  await page.getByRole("tab", { name: "Reports", exact: true }).click();
  await expect(page.locator('table[data-slot="table"]:visible').getByText("Main gate light needs replacement.", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Tasks", exact: true }).click();
  await page.getByRole("tab", { name: "Analytics", exact: true }).click();
  const dateForm = page.getByRole("form", { name: "Date range" });
  await dateForm.getByText("From", { exact: true }).click();
  await expect(dateForm.getByLabel("From", { exact: true })).toBeFocused();
  expect(await page.locator('input[type="date"]').evaluateAll((inputs) => new Set(inputs.map((input) => input.id)).size === inputs.length)).toBe(true);
  await expect(page.getByRole("heading", { name: "Daily task analytics", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Activity by hour", exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "Subtasks", exact: true }).click();
  await expect(page.locator('table[data-slot="table"]:visible').getByText("Check emergency exits", { exact: true })).toBeVisible();
});

test("mobile navigation, keyboard sheets and responsive charts fit the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await login(page);
  await expect(page.getByRole("link", { name: /Attendance today: 4\/5/ })).toBeVisible();
  await page.screenshot({ path: "test-results/dashboard-mobile.png", fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("dialog").getByRole("link", { name: "Visitors", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Visitors", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "View Visitor logs record 5001", exact: true }).click();
  await expect(page.getByRole("dialog").getByText("Project meeting", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole("button", { name: "Log out", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("fixture failures show a safe error and retry recovers the workspace", async ({ page }) => {
  // Simulate a fixture construction failure, without adding production test controls.
  await page.addInitScript(() => {
    const OriginalBlob = window.Blob;
    Reflect.set(window, "restoreFixtureBlob", () => { window.Blob = OriginalBlob; });
    window.Blob = class extends OriginalBlob {
      constructor(parts?: BlobPart[], options?: BlobPropertyBag) { super(parts, options); throw new Error("Sensitive fixture failure"); }
    };
  });
  await login(page);
  await expect(page.locator('main [role="alert"]')).toContainText("Unable to load workspace records. Please try again.");
  await expect(page.getByText("Sensitive fixture failure")).toHaveCount(0);
  await page.evaluate(() => { const restore: unknown = Reflect.get(window, "restoreFixtureBlob"); if (typeof restore === "function") restore(); });
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.getByRole("link", { name: /Attendance today: 4\/5/ })).toBeVisible();
});
