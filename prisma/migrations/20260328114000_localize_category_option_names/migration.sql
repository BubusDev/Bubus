UPDATE "ProductOption"
SET "name" = 'Nyakláncok',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "type" = 'CATEGORY'
  AND "slug" = 'necklaces'
  AND "name" <> 'Nyakláncok';

UPDATE "ProductOption"
SET "name" = 'Karkötők',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "type" = 'CATEGORY'
  AND "slug" = 'bracelets'
  AND "name" <> 'Karkötők';
