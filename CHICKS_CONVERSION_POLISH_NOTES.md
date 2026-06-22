# Chicks Conversion Polish Notes

## Product detail
- Erősebb above-the-fold hierarchia: név, rövid leírás, ár, akciós jelzés, készletállapot és CTA.
- Készlet microcopy: készleten, kevés darab, elfogyott állapotok.
- CTA körüli trust copy: biztonságos Stripe fizetés, 2-4 munkanapos szállítás, 14 napos visszaküldés nem egyedi darabokra.
- Termékadatok rövidebb, strukturáltabb megjelenítése: kategória, kollekció, kő, szín, stílus, alkalom, elérhetőség.

## Cart, checkout, confirmation, order status
- Cart üres állapot prémiumabb copyval és egyértelmű CTA-val.
- Cart summary pontosabb fizetés/szállítás magyarázattal és trust sorokkal.
- Checkout shell, form lépések, loading/disabled állapotok és magyar hibaüzenet környezet finomítva.
- Order confirmation következő lépésekkel: email visszaigazolás, rendeléskövetés, support.
- Order status empty state és státuszmagyarázat vásárlóbarátabb lett.

## Nem érintett business logic
- Nem módosult Stripe/payment intent/payment status logika.
- Nem módosult inventory reservation vagy készletszámítás.
- Nem módosult checkout API, order creation számítás vagy cart business logika.
- Nem módosult auth/password reset/rate-limit vagy admin funkció.

## Kézi ellenőrzési útvonalak
- `/product/[active-slug]`
- `/cart`
- `/checkout`
- `/checkout/confirmation/[orderId]`
- `/order-status`
- Mobil nézetben product, cart és checkout.
