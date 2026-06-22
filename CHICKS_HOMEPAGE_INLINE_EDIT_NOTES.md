# Chicks Homepage Inline Edit Notes

## Bekapcsolás

Admin belépés után a `/` főoldalon megjelenik a jobb alsó lebegő `Főoldal szerkesztése` gomb. Vendég és normál user nem kap szerkesztő UI-t.

## Szerkeszthető mezők

- Hero: eyebrow, headline, subtitle, primary CTA label/href, secondary CTA label/href, kép.
- Hero feature bar: 3 feature label és text.
- Kategória blokk: section eyebrow, headline, description, promó csempe title/subtitle/href/image és `Új` badge.
- Featured slider: section eyebrow, headline, description. A termékválogatás a meglévő showcase admin logikában maradt.
- Social: Instagram szövegek, Instagram CTA, Facebook text/href, social kép, egyszerű csapattag name/role/image.
- Newsletter: eyebrow, headline, subtitle, 3 perk, note text. A feliratkozási submit logika változatlan.

## Mentés

A `Mentés` gomb a `updateHomepageContentAction` server actiont hívja. Az adatok a meglévő `HomepageContentBlock` és `HomepagePromoTile` táblákba mentődnek. Az új többmezős blokkok a `HomepageContentBlock.metadata` JSON mezőt használják.

## Képcsere

A `Kép cseréje` gomb a meglévő Vercel Blob upload route-ot használja: `/api/admin/product-images/upload`, `homepage/` prefixszel. Base64 nem kerül mentésre, csak a kapott Blob URL.

## Jogosultság

A frontend csak verified `ADMIN` usernek rendereli az edit felületet. A mentő server action újra meghívja a `requireAdminUser("/")` ellenőrzést, így nem csak kliensoldali védelem van.

## Későbbre maradt

- Featured slider termékválogatás inline módosítása.
- Teljes image picker/media library választó.
- Több csapattag vagy dinamikus feature/perk elemszám kezelése.
