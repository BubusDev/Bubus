import { expect, test, type Page } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
const customerId = process.env.E2E_CUSTOMER_ID;

const missingCredentialMessage =
  "E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD are required for authenticated admin smoke.";

type AdminSmokePage = {
  path: string;
  heading: string | RegExp;
  uiCheck?: (page: Page) => Promise<void>;
};

const adminSmokePages: AdminSmokePage[] = [
  { path: "/admin", heading: "Dashboard" },
  { path: "/admin/products", heading: "Termékek" },
  {
    path: "/admin/media",
    heading: "Média",
    uiCheck: async (page) => {
      await expect(page.getByText("Összes referencia")).toBeVisible();
      await expect(page.getByRole("button", { name: "Szűrés" })).toBeVisible();
      await expect(page.getByText("Image inventory")).toBeVisible();
    },
  },
  {
    path: "/admin/customers",
    heading: "Vásárlók",
    uiCheck: async (page) => {
      await expect(page.getByText("Összes user")).toBeVisible();
      await expect(page.getByRole("button", { name: "Szűrés" })).toBeVisible();
      await expect(page.getByText(/Customer list|Nincs találat|találat \/ .* user/)).toBeVisible();
    },
  },
  { path: "/admin/content/homepage", heading: "Kezdőlap tartalom" },
  { path: "/admin/orders", heading: "Rendelések" },
];

test.describe("authenticated admin smoke", () => {
  test.skip(!adminEmail || !adminPassword, missingCredentialMessage);

  test.beforeEach(async ({ page }) => {
    await signInAsAdmin(page);
  });

  for (const adminPage of adminSmokePages) {
    test(`${adminPage.path} renders for an authenticated admin`, async ({ page }) => {
      await assertAdminPage(page, adminPage.path, adminPage.heading);
      await adminPage.uiCheck?.(page);
    });
  }

  test("customer detail renders when a customer is available", async ({ page }) => {
    const detailPath = customerId ? `/admin/customers/${customerId}` : await findFirstCustomerDetailPath(page);

    if (!detailPath) {
      test.skip(
        true,
        "Customer detail smoke skipped: set E2E_CUSTOMER_ID or provide at least one Részletek link on /admin/customers.",
      );
      return;
    }

    await assertAdminPage(page, detailPath, /Vásárló|Customer|Részletek/);
  });
});

async function signInAsAdmin(page: Page) {
  const consoleErrors = collectPageErrors(page);

  const response = await page.goto("/admin/sign-in");
  assertNonServerError(response?.status(), "/admin/sign-in");

  await page.locator('input[name="email"]').fill(adminEmail ?? "");
  await page.locator('input[name="password"]').fill(adminPassword ?? "");
  await page.getByRole("button", { name: /Bejelentkezés/ }).click();

  await page.waitForURL((url) => url.pathname.startsWith("/admin") && url.pathname !== "/admin/sign-in");

  await expect(page).not.toHaveURL(/\/admin\/sign-in/);
  await expect(page.getByText(/Érvénytelen admin e-mail-cím vagy jelszó|A bejelentkezés átmenetileg nem elérhető/)).toHaveCount(0);
  expect(consoleErrors(), "console/page errors during admin sign-in").toEqual([]);
}

async function assertAdminPage(page: Page, path: string, heading: string | RegExp) {
  const consoleErrors = collectPageErrors(page);
  const response = await page.goto(path);
  assertNonServerError(response?.status(), path);

  await expect(page).not.toHaveURL(/\/admin\/sign-in/);
  await expect(page.getByText("Admin felület")).toBeVisible();
  await expect(page.getByText("Chicks Jewelry")).toBeVisible();
  await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  expect(consoleErrors(), `console/page errors on ${path}`).toEqual([]);
}

async function findFirstCustomerDetailPath(page: Page) {
  await assertAdminPage(page, "/admin/customers", "Vásárlók");

  const detailsLink = page.getByRole("link", { name: "Részletek" }).first();
  if ((await detailsLink.count()) === 0) return null;

  const href = await detailsLink.getAttribute("href");
  return href?.startsWith("/admin/customers/") ? href : null;
}

function collectPageErrors(page: Page) {
  const errors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    errors.push(error.message);
  });

  return () => errors;
}

function assertNonServerError(status: number | undefined, path: string) {
  expect(status, `${path} should return an HTTP response`).toBeDefined();
  expect(status, `${path} should not return HTTP 5xx`).toBeLessThan(500);
}
