import { validateSupportedLanguage, type SupportedLanguage } from "@/lib/international";

export type TranslationKey =
  | "nav.home"
  | "nav.products"
  | "nav.specialPieces"
  | "nav.limitedPieces"
  | "nav.cart"
  | "nav.favourites"
  | "nav.myOrders"
  | "nav.countryLanguage"
  | "nav.login"
  | "nav.profile"
  | "nav.settings"
  | "footer.contact"
  | "footer.shipping"
  | "footer.terms"
  | "footer.privacy"
  | "footer.cookies"
  | "footer.countryLanguage"
  | "product.freeShipping"
  | "product.addToCart"
  | "product.addToFavourites"
  | "product.inStock"
  | "product.soldOut"
  | "product.notAvailableEu"
  | "product.details"
  | "product.quantity"
  | "product.description"
  | "product.category"
  | "product.collection"
  | "product.stone"
  | "product.color"
  | "product.style"
  | "product.occasion"
  | "cart.cart"
  | "cart.empty"
  | "cart.total"
  | "cart.subtotal"
  | "cart.shipping"
  | "cart.free"
  | "cart.checkout"
  | "cart.remove"
  | "checkout.contact"
  | "checkout.shipping"
  | "checkout.payment"
  | "checkout.country"
  | "checkout.address"
  | "checkout.postalCode"
  | "checkout.city"
  | "checkout.phone"
  | "checkout.shippingFree"
  | "checkout.continuePayment"
  | "checkout.orderSummary"
  | "checkout.paymentFailed"
  | "checkout.stockUnavailable"
  | "checkout.validationError"
  | "order.thankYou"
  | "order.orderNumber"
  | "order.paid"
  | "order.shippingAddress"
  | "order.total"
  | "order.myOrders"
  | "countryPopup.title"
  | "countryPopup.body"
  | "countryPopup.country"
  | "countryPopup.language"
  | "countryPopup.continue"
  | "countryPopup.note"
  | "homepage.heroTitle"
  | "homepage.heroBody"
  | "homepage.heroCta"
  | "homepage.featuredTitle"
  | "homepage.materialTitle"
  | "homepage.newsletterTitle"
  | "homepage.newsletterBody"
  | "homepage.socialBody"
  | "homepage.freeShipping";

export type Dictionary = Record<TranslationKey, string>;

const hu: Dictionary = {
  "nav.home": "Kezdőlap",
  "nav.products": "Termékek",
  "nav.specialPieces": "Különlegességek",
  "nav.limitedPieces": "Limitált darabok",
  "nav.cart": "Kosár",
  "nav.favourites": "Kedvencek",
  "nav.myOrders": "Rendeléseim",
  "nav.countryLanguage": "Ország / nyelv",
  "nav.login": "Belépés",
  "nav.profile": "Profil",
  "nav.settings": "Beállítások",
  "footer.contact": "Kapcsolat",
  "footer.shipping": "Szállítás",
  "footer.terms": "ÁSZF",
  "footer.privacy": "Adatkezelés",
  "footer.cookies": "Cookie-k",
  "footer.countryLanguage": "Ország / nyelv",
  "product.freeShipping": "Ingyenes szállítás",
  "product.addToCart": "Kosárba teszem",
  "product.addToFavourites": "Kedvencekhez adás",
  "product.inStock": "Készleten",
  "product.soldOut": "Elfogyott",
  "product.notAvailableEu": "Nem elérhető EU szállításra",
  "product.details": "Részletek",
  "product.quantity": "Mennyiség",
  "product.description": "Termékleírás",
  "product.category": "Kategória",
  "product.collection": "Kollekció",
  "product.stone": "Kő",
  "product.color": "Szín",
  "product.style": "Stílus",
  "product.occasion": "Alkalom",
  "cart.cart": "Kosár",
  "cart.empty": "Üres a kosarad",
  "cart.total": "Végösszeg",
  "cart.subtotal": "Részösszeg",
  "cart.shipping": "Szállítás",
  "cart.free": "Ingyenes",
  "cart.checkout": "Tovább a fizetéshez",
  "cart.remove": "Eltávolítás",
  "checkout.contact": "Kapcsolat",
  "checkout.shipping": "Szállítás",
  "checkout.payment": "Fizetés",
  "checkout.country": "Ország",
  "checkout.address": "Cím",
  "checkout.postalCode": "Irányítószám",
  "checkout.city": "Város",
  "checkout.phone": "Telefonszám",
  "checkout.shippingFree": "Szállítás: Ingyenes",
  "checkout.continuePayment": "Fizetés indítása",
  "checkout.orderSummary": "Rendelés összegzése",
  "checkout.paymentFailed": "A fizetés nem sikerült.",
  "checkout.stockUnavailable": "Egy vagy több termék már nincs készleten.",
  "checkout.validationError": "Kérjük, tölts ki minden szükséges mezőt.",
  "order.thankYou": "Köszönjük a rendelésed!",
  "order.orderNumber": "Rendelés száma",
  "order.paid": "Fizetve",
  "order.shippingAddress": "Szállítási cím",
  "order.total": "Végösszeg",
  "order.myOrders": "Rendeléseim",
  "countryPopup.title": "Üdv a Chicks világában",
  "countryPopup.body": "Válaszd ki, hova szállítsuk az ékszereidet, mi pedig ehhez igazítjuk az árakat, a nyelvet és a szállítási információkat.",
  "countryPopup.country": "Ország",
  "countryPopup.language": "Nyelv",
  "countryPopup.continue": "Folytatás",
  "countryPopup.note": "Később bármikor módosíthatod.",
  "homepage.heroTitle": "Ne félj extra lenni! Viseld bátran a kiegészítőket!",
  "homepage.heroBody": "Féldrágakő karkötők és nyakláncok kis szériában - outfitedhez, hangulatodhoz, évszakodhoz.",
  "homepage.heroCta": "Fedezd fel a válogatást",
  "homepage.featuredTitle": "Szerkesztett darabok.",
  "homepage.materialTitle": "Kő szerint válogatva.",
  "homepage.newsletterTitle": "Elsőként a limitált darabokról.",
  "homepage.newsletterBody": "Elsőként értesítünk az új kollekciókról, friss színekről és különleges ajánlatokról.",
  "homepage.socialBody": "Kulisszák, új kövek és viselési ötletek azoknak, akik szeretik közelről látni a részleteket.",
  "homepage.freeShipping": "Ingyenes szállítás",
};

const en: Dictionary = {
  "nav.home": "Home",
  "nav.products": "Jewelry",
  "nav.specialPieces": "Special pieces",
  "nav.limitedPieces": "Limited pieces",
  "nav.cart": "Cart",
  "nav.favourites": "Favourites",
  "nav.myOrders": "My orders",
  "nav.countryLanguage": "Country / language",
  "nav.login": "Sign in",
  "nav.profile": "Profile",
  "nav.settings": "Settings",
  "footer.contact": "Contact",
  "footer.shipping": "Shipping",
  "footer.terms": "Terms",
  "footer.privacy": "Privacy policy",
  "footer.cookies": "Cookies",
  "footer.countryLanguage": "Country / language",
  "product.freeShipping": "Free shipping",
  "product.addToCart": "Add to cart",
  "product.addToFavourites": "Add to favourites",
  "product.inStock": "In stock",
  "product.soldOut": "Sold out",
  "product.notAvailableEu": "Not available for EU delivery",
  "product.details": "Details",
  "product.quantity": "Quantity",
  "product.description": "Product details",
  "product.category": "Category",
  "product.collection": "Collection",
  "product.stone": "Stone",
  "product.color": "Color",
  "product.style": "Style",
  "product.occasion": "Occasion",
  "cart.cart": "Cart",
  "cart.empty": "Your cart is empty",
  "cart.total": "Total",
  "cart.subtotal": "Subtotal",
  "cart.shipping": "Shipping",
  "cart.free": "Free",
  "cart.checkout": "Continue to checkout",
  "cart.remove": "Remove",
  "checkout.contact": "Contact",
  "checkout.shipping": "Shipping",
  "checkout.payment": "Payment",
  "checkout.country": "Country",
  "checkout.address": "Address",
  "checkout.postalCode": "Postal code",
  "checkout.city": "City",
  "checkout.phone": "Phone number",
  "checkout.shippingFree": "Shipping: Free",
  "checkout.continuePayment": "Continue to payment",
  "checkout.orderSummary": "Order summary",
  "checkout.paymentFailed": "Payment failed.",
  "checkout.stockUnavailable": "One or more products are no longer in stock.",
  "checkout.validationError": "Please complete all required fields.",
  "order.thankYou": "Thank you for your order!",
  "order.orderNumber": "Order number",
  "order.paid": "Paid",
  "order.shippingAddress": "Shipping address",
  "order.total": "Total",
  "order.myOrders": "My orders",
  "countryPopup.title": "Welcome to Chicks Jewelry",
  "countryPopup.body": "Choose where you would like your jewelry delivered, and we'll tailor prices, language and shipping details for you.",
  "countryPopup.country": "Country",
  "countryPopup.language": "Language",
  "countryPopup.continue": "Continue",
  "countryPopup.note": "You can change this anytime.",
  "homepage.heroTitle": "Small-batch jewelry with a little extra presence.",
  "homepage.heroBody": "Gemstone bracelets and necklaces in limited runs, curated for your outfit, mood and season.",
  "homepage.heroCta": "Explore jewelry",
  "homepage.featuredTitle": "Featured pieces.",
  "homepage.materialTitle": "Shop by stone.",
  "homepage.newsletterTitle": "Be first to see limited pieces.",
  "homepage.newsletterBody": "Get early notes on new collections, fresh colors and special offers.",
  "homepage.socialBody": "Behind the scenes, new stones and styling ideas for people who love the details.",
  "homepage.freeShipping": "Free shipping",
};

export const dictionaries: Record<SupportedLanguage, Dictionary> = { hu, en };

export function getDictionary(language: unknown = "hu") {
  return dictionaries[validateSupportedLanguage(language)];
}

export function translate(language: unknown, key: TranslationKey) {
  return getDictionary(language)[key];
}

function localizedString(primary: string | null | undefined, fallback: string) {
  const normalized = typeof primary === "string" ? primary.trim() : "";
  return normalized || fallback;
}

export function getLocalizedProduct<T extends {
  name: string;
  nameEn?: string | null;
  shortDescription?: string;
  shortDescriptionEn?: string | null;
  description?: string;
  descriptionEn?: string | null;
  badge?: string;
  badgeEn?: string | null;
  collectionLabel?: string;
  collectionLabelEn?: string | null;
}>(product: T, language: unknown) {
  if (validateSupportedLanguage(language) !== "en") {
    return product;
  }

  return {
    ...product,
    name: localizedString(product.nameEn, product.name),
    shortDescription:
      product.shortDescription === undefined
        ? product.shortDescription
        : localizedString(product.shortDescriptionEn, product.shortDescription),
    description:
      product.description === undefined
        ? product.description
        : localizedString(product.descriptionEn, product.description),
    badge:
      product.badge === undefined
        ? product.badge
        : localizedString(product.badgeEn, product.badge),
    collectionLabel:
      product.collectionLabel === undefined
        ? product.collectionLabel
        : localizedString(product.collectionLabelEn, product.collectionLabel),
  };
}
