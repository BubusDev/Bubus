# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-new-product.spec.ts >> blocks submit on missing required values and returns to the invalid step
- Location: tests/e2e/admin-new-product.spec.ts:83:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('A termek neve kotelezo.')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText('A termek neve kotelezo.')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "Boutique ékszer webáruház Chicks Jewelry" [ref=e4] [cursor=pointer]:
        - /url: /
        - generic [ref=e10]:
          - paragraph [ref=e11]: Boutique ékszer webáruház
          - paragraph [ref=e12]: Chicks Jewelry
      - navigation "Hasznos navigáció" [ref=e13]:
        - link "Kedvencek" [ref=e14] [cursor=pointer]:
          - /url: /favourites
          - img [ref=e16]
        - link "Kosár" [ref=e18] [cursor=pointer]:
          - /url: /cart
          - img [ref=e20]
        - button "Profil menü megnyitása" [ref=e24]:
          - generic [ref=e25]: BA
          - generic [ref=e26]:
            - generic [ref=e27]: Fiók
            - generic [ref=e28]: Admin
          - img [ref=e29]
  - navigation "Category navigation" [ref=e31]:
    - generic [ref=e32]:
      - link "Újdonságok" [ref=e33] [cursor=pointer]:
        - /url: /new-in
      - link "Akció" [ref=e34] [cursor=pointer]:
        - /url: /sale
      - link "Nyakláncok" [ref=e35] [cursor=pointer]:
        - /url: /necklaces
      - link "Karkötők" [ref=e36] [cursor=pointer]:
        - /url: /bracelets
  - main [ref=e37]:
    - generic [ref=e38]:
      - generic [ref=e40]:
        - generic [ref=e41]:
          - paragraph [ref=e42]: Admin Atelier
          - heading "Create Product" [level=1] [ref=e43]
          - paragraph [ref=e44]: Add a new storefront product with complete merchandising, filtering, and homepage-placement metadata.
        - navigation [ref=e45]:
          - link "Dashboard" [ref=e46] [cursor=pointer]:
            - /url: /admin
          - link "Products" [ref=e47] [cursor=pointer]:
            - /url: /admin/products
          - link "New Product" [ref=e48] [cursor=pointer]:
            - /url: /admin/products/new
          - link "Announcement" [ref=e49] [cursor=pointer]:
            - /url: /admin/announcement
          - link "Special Edition" [ref=e50] [cursor=pointer]:
            - /url: /admin/special-edition
      - generic [ref=e52]:
        - generic [ref=e54]:
          - button "1. lepes Alapadatok" [ref=e55]:
            - paragraph [ref=e56]: 1. lepes
            - paragraph [ref=e57]: Alapadatok
          - button "2. lepes Kepek" [ref=e58]:
            - paragraph [ref=e59]: 2. lepes
            - paragraph [ref=e60]: Kepek
          - button "3. lepes Arazas es statusz" [ref=e61]:
            - paragraph [ref=e62]: 3. lepes
            - paragraph [ref=e63]: Arazas es statusz
          - button "4. lepes Szovegek" [ref=e64]:
            - paragraph [ref=e65]: 4. lepes
            - paragraph [ref=e66]: Szovegek
          - button "5. lepes Besorolas" [ref=e67]:
            - paragraph [ref=e68]: 5. lepes
            - paragraph [ref=e69]: Besorolas
        - generic [ref=e70]:
          - generic [ref=e71]:
            - paragraph [ref=e72]: 1. lepes
            - heading "Alapadatok" [level=2] [ref=e73]
            - paragraph [ref=e74]: A termek alap nevei es bolti cimkei.
          - generic [ref=e75]:
            - generic [ref=e76]:
              - text: Termek neve
              - textbox "Termek neve" [ref=e77]:
                - /placeholder: Pl. Aurora Ribbon Necklace
            - generic [ref=e78]:
              - text: Slug
              - textbox "Slug" [ref=e79]:
                - /placeholder: pl. aurora-ribbon-necklace
            - generic [ref=e80]:
              - text: Badge cimke
              - textbox "Badge cimke" [ref=e81]:
                - /placeholder: Pl. Ujdonsag
            - generic [ref=e82]:
              - text: Kollekcio cimke
              - textbox "Kollekcio cimke" [ref=e83]:
                - /placeholder: Pl. Beach
        - generic [ref=e85]:
          - paragraph [ref=e86]: Alapadatok
          - button "Tovabb" [active] [ref=e88]
```

# Test source

```ts
  1   | import { expect, test, type Page } from "@playwright/test";
  2   | 
  3   | const adminEmail = "admin@chicksjewelry.com";
  4   | const adminPassword = "admin1234";
  5   | 
  6   | async function signInAsAdmin(page: Page) {
  7   |   await page.goto("/sign-in?next=/admin/products/new");
  8   |   await page.getByLabel("Email").fill(adminEmail);
  9   |   await page.getByLabel("Password").fill(adminPassword);
  10  |   await page.getByRole("button", { name: "Sign in" }).click();
  11  |   await page.waitForURL(/\/admin\/products\/new$/);
  12  | }
  13  | 
  14  | test.beforeEach(async ({ page }) => {
  15  |   await signInAsAdmin(page);
  16  | });
  17  | 
  18  | test("persists values across step navigation and keeps step field mapping isolated", async ({ page }) => {
  19  |   await expect(page.getByRole("heading", { name: "Alapadatok" })).toBeVisible();
  20  |   await expect(page.getByLabel("Termek neve")).toBeVisible();
  21  |   await expect(page.getByLabel("Ar", { exact: true })).toBeHidden();
  22  | 
  23  |   await page.getByLabel("Termek neve").fill("Persistence Product");
  24  |   await page.getByLabel("Slug").fill("persistence-product");
  25  |   await page.getByLabel("Badge cimke").fill("New");
  26  |   await page.getByLabel("Kollekcio cimke").fill("Beach");
  27  | 
  28  |   await page.getByRole("button", { name: "Tovabb" }).click();
  29  |   await expect(page.getByRole("heading", { name: "Kepek" })).toBeVisible();
  30  |   await expect(page.getByLabel("Termek neve")).toBeHidden();
  31  | 
  32  |   await page.getByRole("button", { name: "Tovabb" }).click();
  33  |   await expect(page.getByLabel("Ar", { exact: true })).toBeVisible();
  34  |   await page.getByLabel("Ar", { exact: true }).fill("12345");
  35  |   await page.getByLabel("Eredeti ar").fill("15000");
  36  |   await page.getByLabel("Uj termek").check();
  37  | 
  38  |   await page.getByRole("button", { name: "Vissza" }).click();
  39  |   await expect(page.getByRole("heading", { name: "Kepek" })).toBeVisible();
  40  |   await page.getByRole("button", { name: "Vissza" }).click();
  41  |   await expect(page.getByLabel("Termek neve")).toHaveValue("Persistence Product");
  42  |   await expect(page.getByLabel("Slug")).toHaveValue("persistence-product");
  43  |   await expect(page.getByLabel("Badge cimke")).toHaveValue("New");
  44  |   await expect(page.getByLabel("Kollekcio cimke")).toHaveValue("Beach");
  45  |   await expect(page.getByLabel("Ar", { exact: true })).toBeHidden();
  46  | 
  47  |   await page.getByRole("button", { name: "Tovabb" }).click();
  48  |   await page.getByRole("button", { name: "Tovabb" }).click();
  49  |   await expect(page.getByLabel("Ar", { exact: true })).toHaveValue("12345");
  50  |   await expect(page.getByLabel("Eredeti ar")).toHaveValue("15000");
  51  |   await expect(page.getByLabel("Uj termek")).toBeChecked();
  52  | });
  53  | 
  54  | test("keeps form data contract aligned with UI state across hidden steps", async ({ page }) => {
  55  |   await page.getByLabel("Termek neve").fill("Payload Product");
  56  |   await page.getByLabel("Slug").fill("payload-product");
  57  |   await page.getByLabel("Badge cimke").fill("Payload");
  58  |   await page.getByLabel("Kollekcio cimke").fill("Drop One");
  59  | 
  60  |   await page.getByRole("button", { name: "Tovabb" }).click();
  61  |   await page.getByRole("button", { name: "Tovabb" }).click();
  62  | 
  63  |   const payload = await page.locator("form").evaluate((form) => {
  64  |     const formData = new FormData(form as HTMLFormElement);
  65  |     return {
  66  |       name: formData.get("name"),
  67  |       slug: formData.get("slug"),
  68  |       badge: formData.get("badge"),
  69  |       collectionLabel: formData.get("collectionLabel"),
  70  |       price: formData.get("price"),
  71  |     };
  72  |   });
  73  | 
  74  |   expect(payload).toEqual({
  75  |     name: "Payload Product",
  76  |     slug: "payload-product",
  77  |     badge: "Payload",
  78  |     collectionLabel: "Drop One",
  79  |     price: "0",
  80  |   });
  81  | });
  82  | 
  83  | test("blocks submit on missing required values and returns to the invalid step", async ({ page }) => {
  84  |   await page.getByRole("button", { name: "Tovabb" }).click();
> 85  |   await expect(page.getByText("A termek neve kotelezo.")).toBeVisible();
      |                                                           ^ Error: expect(locator).toBeVisible() failed
  86  |   await expect(page.getByText("A slug kotelezo.")).toBeVisible();
  87  |   await expect(page).toHaveURL(/\/admin\/products\/new$/);
  88  |   await expect(page.getByLabel("Termek neve")).toBeVisible();
  89  | });
  90  | 
  91  | test("submits successfully with valid required values", async ({ page }) => {
  92  |   const slug = `playwright-product-${Date.now()}`;
  93  | 
  94  |   await page.getByLabel("Termek neve").fill("Playwright Product");
  95  |   await page.getByLabel("Slug").fill(slug);
  96  |   await page.getByLabel("Badge cimke").fill("QA");
  97  |   await page.getByLabel("Kollekcio cimke").fill("Automation");
  98  |   await page.getByRole("button", { name: "Tovabb" }).click();
  99  |   await page.getByRole("button", { name: "Tovabb" }).click();
  100 | 
  101 |   await page.getByLabel("Ar", { exact: true }).fill("149");
  102 |   await page.getByRole("button", { name: "Tovabb" }).click();
  103 | 
  104 |   await page.getByLabel("Rovid leiras").fill("Created by Playwright.");
  105 |   await page.getByLabel("Leiras").fill("Created by Playwright for end-to-end validation.");
  106 |   await page.getByRole("button", { name: "Tovabb" }).click();
  107 | 
  108 |   await page.getByRole("button", { name: "Create Product" }).click();
  109 |   await page.waitForURL(/\/admin\/products$/);
  110 |   await expect(page.getByText("Playwright Product")).toBeVisible();
  111 | });
  112 | 
```