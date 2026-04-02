# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-new-product.spec.ts >> keeps form data contract aligned with UI state across hidden steps
- Location: tests\e2e\admin-new-product.spec.ts:54:5

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 4
+ Received  + 4

  Object {
-   "badge": "Payload",
-   "collectionLabel": "Drop One",
-   "name": "Payload Product",
+   "badge": "",
+   "collectionLabel": "",
+   "name": "",
    "price": "0",
-   "slug": "payload-product",
+   "slug": "",
  }
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e4]: 10 új kollekció, brand new charmokkal, most elérhető!
  - banner [ref=e5]:
    - generic [ref=e6]:
      - link "Boutique ékszer webáruház Chicks Jewelry" [ref=e7] [cursor=pointer]:
        - /url: /
        - generic [ref=e13]:
          - paragraph [ref=e14]: Boutique ékszer webáruház
          - paragraph [ref=e15]: Chicks Jewelry
      - navigation "Hasznos navigáció" [ref=e16]:
        - link "Kedvencek" [ref=e17] [cursor=pointer]:
          - /url: /favourites
          - img [ref=e19]
        - link "Kosár" [ref=e21] [cursor=pointer]:
          - /url: /cart
          - img [ref=e23]
        - button "Profil menü megnyitása" [ref=e27]:
          - generic [ref=e28]: BA
          - generic [ref=e29]:
            - generic [ref=e30]: Fiók
            - generic [ref=e31]: Admin
          - img [ref=e32]
  - navigation "Category navigation" [ref=e34]:
    - generic [ref=e35]:
      - link "Újdonságok" [ref=e36] [cursor=pointer]:
        - /url: /new-in
      - link "Limitált darabok" [ref=e37] [cursor=pointer]:
        - /url: /special-edition
      - link "Akció" [ref=e38] [cursor=pointer]:
        - /url: /sale
      - link "Nyakláncok" [ref=e39] [cursor=pointer]:
        - /url: /necklaces
      - link "Karkötők" [ref=e40] [cursor=pointer]:
        - /url: /bracelets
  - main [ref=e41]:
    - generic [ref=e42]:
      - generic [ref=e44]:
        - generic [ref=e45]:
          - paragraph [ref=e46]: Admin Atelier
          - heading "Create Product" [level=1] [ref=e47]
          - paragraph [ref=e48]: Add a new storefront product with complete merchandising, filtering, and homepage-placement metadata.
        - navigation [ref=e49]:
          - link "Dashboard" [ref=e50] [cursor=pointer]:
            - /url: /admin
          - link "Products" [ref=e51] [cursor=pointer]:
            - /url: /admin/products
          - link "New Product" [ref=e52] [cursor=pointer]:
            - /url: /admin/products/new
          - link "Announcement" [ref=e53] [cursor=pointer]:
            - /url: /admin/announcement
          - link "Special Edition" [ref=e54] [cursor=pointer]:
            - /url: /admin/special-edition
      - generic [ref=e56]:
        - generic [ref=e58]:
          - button "1. lepes Alapadatok" [ref=e59]:
            - paragraph [ref=e60]: 1. lepes
            - paragraph [ref=e61]: Alapadatok
          - button "2. lepes Kepek" [ref=e62]:
            - paragraph [ref=e63]: 2. lepes
            - paragraph [ref=e64]: Kepek
          - button "3. lepes Arazas es statusz" [ref=e65]:
            - paragraph [ref=e66]: 3. lepes
            - paragraph [ref=e67]: Arazas es statusz
          - button "4. lepes Szovegek" [ref=e68]:
            - paragraph [ref=e69]: 4. lepes
            - paragraph [ref=e70]: Szovegek
          - button "5. lepes Besorolas" [ref=e71]:
            - paragraph [ref=e72]: 5. lepes
            - paragraph [ref=e73]: Besorolas
        - generic [ref=e74]:
          - generic [ref=e75]:
            - paragraph [ref=e76]: 1. lepes
            - heading "Alapadatok" [level=2] [ref=e77]
            - paragraph [ref=e78]: A termek alap nevei es bolti cimkei.
          - generic [ref=e79]:
            - generic [ref=e80]:
              - text: Termek neve
              - textbox "Termek neve" [ref=e81]:
                - /placeholder: Pl. Aurora Ribbon Necklace
                - text: Payload Product
            - generic [ref=e82]:
              - text: Slug
              - textbox "Slug" [ref=e83]:
                - /placeholder: pl. aurora-ribbon-necklace
                - text: payload-product
            - generic [ref=e84]:
              - text: Badge cimke
              - textbox "Badge cimke" [ref=e85]:
                - /placeholder: Pl. Ujdonsag
                - text: Payload
            - generic [ref=e86]:
              - text: Kollekcio cimke
              - textbox "Kollekcio cimke" [ref=e87]:
                - /placeholder: Pl. Beach
                - text: Drop One
        - generic [ref=e89]:
          - paragraph [ref=e90]: Alapadatok
          - button "Tovabb" [active] [ref=e92]
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
  19  |   await expect(page.getByText("Alapadatok")).toBeVisible();
  20  |   await expect(page.getByLabel("Termek neve")).toBeVisible();
  21  |   await expect(page.getByLabel("Ar")).toBeHidden();
  22  | 
  23  |   await page.getByLabel("Termek neve").fill("Persistence Product");
  24  |   await page.getByLabel("Slug").fill("persistence-product");
  25  |   await page.getByLabel("Badge cimke").fill("New");
  26  |   await page.getByLabel("Kollekcio cimke").fill("Beach");
  27  | 
  28  |   await page.getByRole("button", { name: "Tovabb" }).click();
  29  |   await expect(page.getByText("Kepek")).toBeVisible();
  30  |   await expect(page.getByLabel("Termek neve")).toBeHidden();
  31  | 
  32  |   await page.getByRole("button", { name: "Tovabb" }).click();
  33  |   await expect(page.getByLabel("Ar")).toBeVisible();
  34  |   await page.getByLabel("Ar").fill("12345");
  35  |   await page.getByLabel("Eredeti ar").fill("15000");
  36  |   await page.getByLabel("Uj termek").check();
  37  | 
  38  |   await page.getByRole("button", { name: "Vissza" }).click();
  39  |   await expect(page.getByText("Kepek")).toBeVisible();
  40  |   await page.getByRole("button", { name: "Vissza" }).click();
  41  |   await expect(page.getByLabel("Termek neve")).toHaveValue("Persistence Product");
  42  |   await expect(page.getByLabel("Slug")).toHaveValue("persistence-product");
  43  |   await expect(page.getByLabel("Badge cimke")).toHaveValue("New");
  44  |   await expect(page.getByLabel("Kollekcio cimke")).toHaveValue("Beach");
  45  |   await expect(page.getByLabel("Ar")).toBeHidden();
  46  | 
  47  |   await page.getByRole("button", { name: "Tovabb" }).click();
  48  |   await page.getByRole("button", { name: "Tovabb" }).click();
  49  |   await expect(page.getByLabel("Ar")).toHaveValue("12345");
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
> 74  |   expect(payload).toEqual({
      |                   ^ Error: expect(received).toEqual(expected) // deep equality
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
  85  |   await expect(page.getByText("A termek neve kotelezo.")).toBeVisible();
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
  101 |   await page.getByLabel("Ar").fill("149");
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