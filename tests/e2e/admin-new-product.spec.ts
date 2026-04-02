import { expect, test, type Page } from "@playwright/test";

const adminEmail = "admin@chicksjewelry.com";
const adminPassword = "admin1234";

async function signInAsAdmin(page: Page) {
  await page.goto("/sign-in?next=/admin/products/new");
  await page.getByLabel("Email").fill(adminEmail);
  await page.getByLabel("Password").fill(adminPassword);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/admin\/products\/new$/);
}

test.beforeEach(async ({ page }) => {
  await signInAsAdmin(page);
});

test("persists values across step navigation and keeps step field mapping isolated", async ({ page }) => {
  await expect(page.getByText("Alapadatok")).toBeVisible();
  await expect(page.getByLabel("Termek neve")).toBeVisible();
  await expect(page.getByLabel("Ar")).toBeHidden();

  await page.getByLabel("Termek neve").fill("Persistence Product");
  await page.getByLabel("Slug").fill("persistence-product");
  await page.getByLabel("Badge cimke").fill("New");
  await page.getByLabel("Kollekcio cimke").fill("Beach");

  await page.getByRole("button", { name: "Tovabb" }).click();
  await expect(page.getByText("Kepek")).toBeVisible();
  await expect(page.getByLabel("Termek neve")).toBeHidden();

  await page.getByRole("button", { name: "Tovabb" }).click();
  await expect(page.getByLabel("Ar")).toBeVisible();
  await page.getByLabel("Ar").fill("12345");
  await page.getByLabel("Eredeti ar").fill("15000");
  await page.getByLabel("Uj termek").check();

  await page.getByRole("button", { name: "Vissza" }).click();
  await expect(page.getByText("Kepek")).toBeVisible();
  await page.getByRole("button", { name: "Vissza" }).click();
  await expect(page.getByLabel("Termek neve")).toHaveValue("Persistence Product");
  await expect(page.getByLabel("Slug")).toHaveValue("persistence-product");
  await expect(page.getByLabel("Badge cimke")).toHaveValue("New");
  await expect(page.getByLabel("Kollekcio cimke")).toHaveValue("Beach");
  await expect(page.getByLabel("Ar")).toBeHidden();

  await page.getByRole("button", { name: "Tovabb" }).click();
  await page.getByRole("button", { name: "Tovabb" }).click();
  await expect(page.getByLabel("Ar")).toHaveValue("12345");
  await expect(page.getByLabel("Eredeti ar")).toHaveValue("15000");
  await expect(page.getByLabel("Uj termek")).toBeChecked();
});

test("keeps form data contract aligned with UI state across hidden steps", async ({ page }) => {
  await page.getByLabel("Termek neve").fill("Payload Product");
  await page.getByLabel("Slug").fill("payload-product");
  await page.getByLabel("Badge cimke").fill("Payload");
  await page.getByLabel("Kollekcio cimke").fill("Drop One");

  await page.getByRole("button", { name: "Tovabb" }).click();
  await page.getByRole("button", { name: "Tovabb" }).click();

  const payload = await page.locator("form").evaluate((form) => {
    const formData = new FormData(form as HTMLFormElement);
    return {
      name: formData.get("name"),
      slug: formData.get("slug"),
      badge: formData.get("badge"),
      collectionLabel: formData.get("collectionLabel"),
      price: formData.get("price"),
    };
  });

  expect(payload).toEqual({
    name: "Payload Product",
    slug: "payload-product",
    badge: "Payload",
    collectionLabel: "Drop One",
    price: "0",
  });
});

test("blocks submit on missing required values and returns to the invalid step", async ({ page }) => {
  await page.getByRole("button", { name: "Tovabb" }).click();
  await expect(page.getByText("A termek neve kotelezo.")).toBeVisible();
  await expect(page.getByText("A slug kotelezo.")).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/products\/new$/);
  await expect(page.getByLabel("Termek neve")).toBeVisible();
});

test("submits successfully with valid required values", async ({ page }) => {
  const slug = `playwright-product-${Date.now()}`;

  await page.getByLabel("Termek neve").fill("Playwright Product");
  await page.getByLabel("Slug").fill(slug);
  await page.getByLabel("Badge cimke").fill("QA");
  await page.getByLabel("Kollekcio cimke").fill("Automation");
  await page.getByRole("button", { name: "Tovabb" }).click();
  await page.getByRole("button", { name: "Tovabb" }).click();

  await page.getByLabel("Ar").fill("149");
  await page.getByRole("button", { name: "Tovabb" }).click();

  await page.getByLabel("Rovid leiras").fill("Created by Playwright.");
  await page.getByLabel("Leiras").fill("Created by Playwright for end-to-end validation.");
  await page.getByRole("button", { name: "Tovabb" }).click();

  await page.getByRole("button", { name: "Create Product" }).click();
  await page.waitForURL(/\/admin\/products$/);
  await expect(page.getByText("Playwright Product")).toBeVisible();
});
