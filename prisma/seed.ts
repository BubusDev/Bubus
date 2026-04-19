import { PrismaClient, type Prisma, type ProductOptionType } from "@prisma/client";

import { hashPassword } from "../src/lib/auth/passwords";

const prisma = new PrismaClient();

type SeedProduct = Omit<
  Prisma.ProductCreateInput,
  | "category"
  | "stoneType"
  | "color"
  | "style"
  | "occasion"
  | "availability"
  | "tone"
> & {
  category: string;
  stoneType: string;
  color: string;
  style: string;
  occasion: string;
  availability: string;
  tone: string;
  gallery: { url: string; alt: string; isCover?: boolean }[];
};

type SeedOption = {
  name: string;
  slug: string;
  showInMainNav?: boolean;
  navSortOrder?: number;
};

const optionSeeds: Record<ProductOptionType, SeedOption[]> = {
  CATEGORY: [
    { name: "Nyakl\u00e1ncok", slug: "necklaces", showInMainNav: true, navSortOrder: 30 },
    { name: "Kark\u00f6t\u0151k", slug: "bracelets", showInMainNav: true, navSortOrder: 40 },
    { name: "Anklets", slug: "anklets" },
    { name: "Earrings", slug: "earrings" },
  ],
  STONE_TYPE: [
    { name: "Pearl", slug: "pearl" },
    { name: "Crystal", slug: "crystal" },
    { name: "Opal", slug: "opal" },
    { name: "Moonstone", slug: "moonstone" },
    { name: "Rose Quartz", slug: "rose-quartz" },
    { name: "Diamond", slug: "diamond" },
  ],
  COLOR: [
    { name: "Gold", slug: "gold" },
    { name: "Silver", slug: "silver" },
    { name: "Rose Gold", slug: "rose-gold" },
  ],
  STYLE: [
    { name: "Minimal", slug: "minimal" },
    { name: "Statement", slug: "statement" },
    { name: "Romantic", slug: "romantic" },
    { name: "Layering", slug: "layering" },
    { name: "Bridal", slug: "bridal" },
  ],
  OCCASION: [
    { name: "Everyday", slug: "everyday" },
    { name: "Wedding", slug: "wedding" },
    { name: "Gift Edit", slug: "gift-edit" },
    { name: "Evening", slug: "evening" },
    { name: "Vacation", slug: "vacation" },
  ],
  AVAILABILITY: [
    { name: "In Stock", slug: "in-stock" },
    { name: "Low Stock", slug: "low-stock" },
    { name: "Preorder", slug: "preorder" },
  ],
  VISUAL_TONE: [
    { name: "Petal", slug: "petal" },
    { name: "Champagne", slug: "champagne" },
    { name: "Blush", slug: "blush" },
    { name: "Pearl", slug: "pearl" },
  ],
};

async function seedOptions() {
  const allOptions = Object.entries(optionSeeds).flatMap(([type, options]) =>
    options.map((option, index) => ({
      type: type as ProductOptionType,
      name: option.name,
      slug: option.slug,
      sortOrder: index,
      isActive: true,
      isStorefrontVisible: true,
      showInMainNav: option.showInMainNav ?? false,
      navSortOrder: option.navSortOrder ?? 0,
    })),
  );

  await prisma.productOption.createMany({
    data: allOptions,
  });
}

async function getOptionMap() {
  const options = await prisma.productOption.findMany();
  return new Map(options.map((option) => [`${option.type}:${option.slug}`, option.id]));
}

async function createProduct(
  optionMap: Map<string, string>,
  {
    gallery,
    category,
    stoneType,
    color,
    style,
    occasion,
    availability,
    tone,
    stockQuantity,
    ...product
  }: SeedProduct,
) {
  const orderedGallery = gallery.map((image, index) => ({
    ...image,
    sortOrder: index,
    isCover: image.isCover ?? index === 0,
  }));
  const coverImage = orderedGallery.find((image) => image.isCover) ?? orderedGallery[0];

  const requireOptionId = (type: ProductOptionType, slug: string) => {
    const id = optionMap.get(`${type}:${slug}`);
    if (!id) {
      throw new Error(`Missing option ${type}:${slug}`);
    }
    return id;
  };

  await prisma.product.create({
    data: {
      ...product,
      stockQuantity:
        typeof stockQuantity === "number"
          ? stockQuantity
          : availability === "low-stock"
            ? 3
            : availability === "preorder"
              ? 8
              : 12,
      category: { connect: { id: requireOptionId("CATEGORY", category) } },
      stoneType: { connect: { id: requireOptionId("STONE_TYPE", stoneType) } },
      color: { connect: { id: requireOptionId("COLOR", color) } },
      style: { connect: { id: requireOptionId("STYLE", style) } },
      occasion: { connect: { id: requireOptionId("OCCASION", occasion) } },
      availability: { connect: { id: requireOptionId("AVAILABILITY", availability) } },
      tone: { connect: { id: requireOptionId("VISUAL_TONE", tone) } },
      imageUrl: coverImage?.url,
      images: {
        create: orderedGallery,
      },
      specialties: product.specialtyKey
        ? {
            create: {
              specialty: { connect: { slug: product.specialtyKey } },
            },
          }
        : undefined,
    },
  });
}

async function main() {
  const adminPasswordHash = await hashPassword("admin1234");
  const userPasswordHash = await hashPassword("user1234");
  const emailVerifiedAt = new Date("2026-03-27T08:00:00.000Z");

  await prisma.emailVerificationToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.favourite.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productSpecialty.deleteMany();
  await prisma.product.deleteMany();
  await prisma.specialty.deleteMany();
  await prisma.productOption.deleteMany();
  await prisma.user.deleteMany();

  await seedOptions();
  await seedSpecialties();

  await prisma.user.createMany({
    data: [
      {
        name: "Borbolya Admin",
        email: "admin@chicksjewelry.com",
        passwordHash: adminPasswordHash,
        emailVerifiedAt,
        role: "ADMIN",
        phone: "+36 30 222 1144",
        defaultShippingAddress: "1024 Budapest, Margit krt. 18. 3/12.",
        newsletterSubscribed: true,
      },
      {
        name: "Ariana Bloom",
        email: "ariana@chicksjewelry.com",
        passwordHash: userPasswordHash,
        emailVerifiedAt,
        role: "USER",
        phone: "+36 20 555 0192",
        birthDate: new Date("1995-05-12T00:00:00.000Z"),
        profileImageUrl: "/seed/rose-necklace.svg",
        defaultShippingAddress: "1117 Budapest, Karinthy Frigyes út 9. 5/2.",
        newsletterSubscribed: true,
      },
      {
        name: "Lena Hart",
        email: "lena@chicksjewelry.com",
        passwordHash: userPasswordHash,
        emailVerifiedAt,
        role: "USER",
        phone: "+36 70 611 8842",
        birthDate: new Date("1998-11-03T00:00:00.000Z"),
        defaultShippingAddress: "6722 Szeged, Tisza Lajos krt. 42.",
        newsletterSubscribed: false,
      },
    ],
  });

  const optionMap = await getOptionMap();

  const galleryMap = {
    rose: "/seed/rose-necklace.svg",
    gold: "/seed/gold-earrings.svg",
    pearl: "/seed/pearl-bracelet.svg",
    moon: "/seed/moonstone-anklet.svg",
    opal: "/seed/opal-necklace.svg",
    petal: "/seed/petal-hoops.svg",
  };

  const products: SeedProduct[] = [
    {
      slug: "aurelia-ribbon-necklace",
      name: "Aurelia Ribbon Necklace",
      category: "necklaces",
      price: 82,
      shortDescription: "A ribbon-soft chain with a polished rose quartz drop.",
      description:
        "Aurelia balances a romantic silhouette with enough restraint for everyday layering. The soft pendant sits close to the collarbone for an easy quick-buy favorite.",
      badge: "Signature",
      collectionLabel: "Rose Atelier",
      stoneType: "rose-quartz",
      color: "rose-gold",
      style: "romantic",
      occasion: "gift-edit",
      availability: "in-stock",
      isNew: true,
      isGiftable: true,
      isOnSale: false,
      tone: "petal",
      homepagePlacement: "SPOTLIGHT",
      gallery: [
        { url: galleryMap.rose, alt: "Aurelia necklace cover", isCover: true },
        { url: galleryMap.petal, alt: "Aurelia necklace alternate angle" },
      ],
    },
    {
      slug: "lune-halo-earrings",
      name: "Lune Halo Earrings",
      category: "earrings",
      price: 68,
      compareAtPrice: 84,
      shortDescription: "Soft crystal halos for evening light and clean sparkle.",
      description:
        "A luminous drop earring with a refined boutique proportion. Lune gives an elevated evening finish while staying light enough for all-night wear.",
      badge: "Evening",
      collectionLabel: "Afterglow",
      stoneType: "crystal",
      color: "gold",
      style: "statement",
      occasion: "evening",
      availability: "low-stock",
      isNew: false,
      isGiftable: true,
      isOnSale: true,
      tone: "champagne",
      homepagePlacement: "NONE",
      gallery: [
        { url: galleryMap.gold, alt: "Lune earrings cover", isCover: true },
        { url: galleryMap.opal, alt: "Lune earrings styling image" },
      ],
    },
    {
      slug: "seraphine-cuff-bracelet",
      name: "Seraphine Cuff Bracelet",
      category: "bracelets",
      price: 74,
      shortDescription: "A sculpted cuff with smooth pearl-toned reflections.",
      description:
        "Seraphine is a clean, sculptural bracelet built for stacking or solo wear. Its softly rounded profile makes it feel polished without reading heavy.",
      badge: "Editors Pick",
      collectionLabel: "Maison Pearl",
      stoneType: "pearl",
      color: "silver",
      style: "minimal",
      occasion: "everyday",
      availability: "in-stock",
      isNew: true,
      isGiftable: false,
      isOnSale: false,
      specialtyKey: "napfogo",
      tone: "pearl",
      homepagePlacement: "SPOTLIGHT",
      gallery: [
        { url: galleryMap.pearl, alt: "Seraphine bracelet cover", isCover: true },
        { url: galleryMap.gold, alt: "Seraphine bracelet detail" },
      ],
    },
    {
      slug: "celeste-moonstone-anklet",
      name: "Celeste Moonstone Anklet",
      category: "anklets",
      price: 59,
      shortDescription: "A fine vacation anklet with soft moonstone shimmer.",
      description:
        "Celeste is designed for warm-weather dressing and understated movement. It sits lightly on the skin and catches light in a very controlled way.",
      badge: "Holiday",
      collectionLabel: "Summer Edit",
      stoneType: "moonstone",
      color: "gold",
      style: "layering",
      occasion: "vacation",
      availability: "in-stock",
      isNew: true,
      isGiftable: true,
      isOnSale: false,
      tone: "champagne",
      homepagePlacement: "NEW_ARRIVALS",
      gallery: [
        { url: galleryMap.moon, alt: "Celeste anklet cover", isCover: true },
        { url: galleryMap.gold, alt: "Celeste anklet detail" },
      ],
    },
    {
      slug: "odette-pearl-collar",
      name: "Odette Pearl Collar",
      category: "necklaces",
      price: 98,
      shortDescription: "Structured pearl drama with an editorial bridal edge.",
      description:
        "Odette is a stronger silhouette intended for occasion dressing. The placement and proportion are tuned to feel premium, feminine, and contemporary rather than vintage-heavy.",
      badge: "Bridal",
      collectionLabel: "Maison Pearl",
      stoneType: "pearl",
      color: "silver",
      style: "bridal",
      occasion: "wedding",
      availability: "preorder",
      isNew: false,
      isGiftable: true,
      isOnSale: false,
      tone: "pearl",
      homepagePlacement: "NONE",
      gallery: [
        { url: galleryMap.pearl, alt: "Odette pearl collar cover", isCover: true },
        { url: galleryMap.rose, alt: "Odette pearl collar lookbook" },
      ],
    },
    {
      slug: "ines-petal-hoops",
      name: "Ines Petal Hoops",
      category: "earrings",
      price: 64,
      shortDescription: "Rounded floral hoops with a boutique pink-gold finish.",
      description:
        "Ines brings a floral note into a wearable everyday hoop. It feels romantic without becoming playful or ornate.",
      badge: "Bestseller",
      collectionLabel: "Rose Atelier",
      stoneType: "opal",
      color: "rose-gold",
      style: "romantic",
      occasion: "everyday",
      availability: "in-stock",
      isNew: false,
      isGiftable: true,
      isOnSale: false,
      tone: "blush",
      homepagePlacement: "NONE",
      gallery: [
        { url: galleryMap.petal, alt: "Ines hoops cover", isCover: true },
        { url: galleryMap.rose, alt: "Ines hoops styling image" },
      ],
    },
    {
      slug: "mirren-charm-bracelet",
      name: "Mirren Charm Bracelet",
      category: "bracelets",
      price: 61,
      compareAtPrice: 76,
      shortDescription: "Collected charms with a gift-ready polished finish.",
      description:
        "Mirren is intentionally sentimental and softly detailed. It is one of the most giftable styles in the collection because the silhouette reads personal straight away.",
      badge: "Giftable",
      collectionLabel: "Keepsake Notes",
      stoneType: "diamond",
      color: "gold",
      style: "statement",
      occasion: "gift-edit",
      availability: "low-stock",
      isNew: false,
      isGiftable: true,
      isOnSale: true,
      specialtyKey: "alomfogo",
      tone: "petal",
      homepagePlacement: "NONE",
      gallery: [
        { url: galleryMap.gold, alt: "Mirren bracelet cover", isCover: true },
        { url: galleryMap.petal, alt: "Mirren bracelet close-up" },
      ],
    },
    {
      slug: "noa-halo-chain",
      name: "Noa Halo Chain",
      category: "necklaces",
      price: 72,
      shortDescription: "An airy layering chain with a brighter crystal rhythm.",
      description:
        "Noa was designed as a collection anchor for layered looks. The spacing and shine feel elevated, clean, and easy to add to bag.",
      badge: "New",
      collectionLabel: "Afterglow",
      stoneType: "crystal",
      color: "silver",
      style: "layering",
      occasion: "everyday",
      availability: "in-stock",
      isNew: true,
      isGiftable: false,
      isOnSale: false,
      tone: "blush",
      homepagePlacement: "NONE",
      gallery: [
        { url: galleryMap.opal, alt: "Noa chain cover", isCover: true },
        { url: galleryMap.gold, alt: "Noa chain detail" },
      ],
    },
    {
      slug: "mara-blossom-hoops",
      name: "Mara Blossom Hoops",
      category: "earrings",
      price: 57,
      shortDescription: "Petite hoops with a soft blossom silhouette and glow.",
      description:
        "Mara sits between stud and hoop, offering a clean floral cue in a compact scale. It is ideal for gifting and polished daily wear.",
      badge: "Just Landed",
      collectionLabel: "Garden Notes",
      stoneType: "rose-quartz",
      color: "rose-gold",
      style: "minimal",
      occasion: "gift-edit",
      availability: "in-stock",
      isNew: true,
      isGiftable: true,
      isOnSale: false,
      tone: "petal",
      homepagePlacement: "NEW_ARRIVALS",
      gallery: [
        { url: galleryMap.petal, alt: "Mara hoops cover", isCover: true },
        { url: galleryMap.rose, alt: "Mara hoops detail" },
      ],
    },
    {
      slug: "elara-layered-necklace",
      name: "Elara Layered Necklace",
      category: "necklaces",
      price: 88,
      shortDescription: "Double-chain layering with a sculpted opal focal point.",
      description:
        "Elara creates an editorial layered look without needing styling effort. The dual-chain structure gives it quick-purchase clarity on the product page.",
      badge: "Spotlight",
      collectionLabel: "Light Study",
      stoneType: "opal",
      color: "gold",
      style: "layering",
      occasion: "evening",
      availability: "in-stock",
      isNew: false,
      isGiftable: true,
      isOnSale: false,
      tone: "champagne",
      homepagePlacement: "SPOTLIGHT",
      gallery: [
        { url: galleryMap.opal, alt: "Elara necklace cover", isCover: true },
        { url: galleryMap.rose, alt: "Elara necklace editorial image" },
      ],
    },
    {
      slug: "soline-pearl-drop-earrings",
      name: "Soline Pearl Drop Earrings",
      category: "earrings",
      price: 79,
      shortDescription: "Graceful pearl drops refined for ceremony and dinner.",
      description:
        "Soline is built around balance: a visible pearl finish, a light line, and enough movement to feel special without excess drama.",
      badge: "Premium",
      collectionLabel: "Maison Pearl",
      stoneType: "pearl",
      color: "gold",
      style: "bridal",
      occasion: "wedding",
      availability: "in-stock",
      isNew: false,
      isGiftable: true,
      isOnSale: false,
      tone: "pearl",
      homepagePlacement: "SPOTLIGHT",
      gallery: [
        { url: galleryMap.pearl, alt: "Soline earrings cover", isCover: true },
        { url: galleryMap.gold, alt: "Soline earrings alternate image" },
      ],
    },
    {
      slug: "veda-stone-cuff",
      name: "Veda Stone Cuff",
      category: "bracelets",
      price: 66,
      compareAtPrice: 81,
      shortDescription: "A modern cuff softened by a centered moonstone detail.",
      description:
        "Veda carries just enough contrast between metal and stone to feel premium. It works particularly well in modern gift edits and pared-back stacks.",
      badge: "Refined",
      collectionLabel: "Light Study",
      stoneType: "moonstone",
      color: "silver",
      style: "minimal",
      occasion: "everyday",
      availability: "low-stock",
      isNew: false,
      isGiftable: true,
      isOnSale: true,
      tone: "blush",
      homepagePlacement: "NONE",
      gallery: [
        { url: galleryMap.moon, alt: "Veda cuff cover", isCover: true },
        { url: galleryMap.pearl, alt: "Veda cuff alternate image" },
      ],
    },
    {
      slug: "liora-chain-anklet",
      name: "Liora Chain Anklet",
      category: "anklets",
      price: 52,
      shortDescription: "A slim chain anklet with a clean polished holiday shine.",
      description:
        "Liora is a core warm-weather style with a reduced, minimal profile. It is intentionally easy to wear from day to dinner.",
      badge: "Vacation",
      collectionLabel: "Summer Edit",
      stoneType: "diamond",
      color: "rose-gold",
      style: "minimal",
      occasion: "vacation",
      availability: "in-stock",
      isNew: false,
      isGiftable: false,
      isOnSale: false,
      tone: "blush",
      homepagePlacement: "NONE",
      gallery: [
        { url: galleryMap.moon, alt: "Liora anklet cover", isCover: true },
        { url: galleryMap.petal, alt: "Liora anklet close-up" },
      ],
    },
    {
      slug: "vera-crystal-tennis-bracelet",
      name: "Vera Crystal Tennis Bracelet",
      category: "bracelets",
      price: 92,
      shortDescription: "An evening tennis bracelet with softened crystal light.",
      description:
        "Vera gives classic tennis-bracelet polish a slightly warmer boutique direction. It is intended to feel elegant, not formal or severe.",
      badge: "Occasion",
      collectionLabel: "Afterglow",
      stoneType: "crystal",
      color: "silver",
      style: "statement",
      occasion: "evening",
      availability: "preorder",
      isNew: true,
      isGiftable: true,
      isOnSale: false,
      specialtyKey: "napfogo",
      tone: "pearl",
      homepagePlacement: "NEW_ARRIVALS",
      gallery: [
        { url: galleryMap.gold, alt: "Vera bracelet cover", isCover: true },
        { url: galleryMap.pearl, alt: "Vera bracelet alternate image" },
      ],
    },
  ];

  for (const product of products) {
    await createProduct(optionMap, product);
  }

  const [ariana, lena] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { email: "ariana@chicksjewelry.com" } }),
    prisma.user.findUniqueOrThrow({ where: { email: "lena@chicksjewelry.com" } }),
  ]);

  const selectedProducts = await prisma.product.findMany({
    where: {
      slug: {
        in: [
          "aurelia-ribbon-necklace",
          "seraphine-cuff-bracelet",
          "soline-pearl-drop-earrings",
          "ines-petal-hoops",
          "elara-layered-necklace",
        ],
      },
    },
  });

  const productBySlug = new Map(selectedProducts.map((product) => [product.slug, product]));
  const aurelia = productBySlug.get("aurelia-ribbon-necklace");
  const seraphine = productBySlug.get("seraphine-cuff-bracelet");
  const soline = productBySlug.get("soline-pearl-drop-earrings");
  const ines = productBySlug.get("ines-petal-hoops");
  const elara = productBySlug.get("elara-layered-necklace");

  if (!aurelia || !seraphine || !soline || !ines || !elara) {
    throw new Error("Missing seeded products for account data.");
  }

  await prisma.favourite.createMany({
    data: [
      { userId: ariana.id, productId: aurelia.id },
      { userId: ariana.id, productId: soline.id },
      { userId: lena.id, productId: ines.id },
    ],
  });

  await prisma.cart.create({
    data: {
      userId: ariana.id,
      items: {
        create: [
          { productId: aurelia.id, quantity: 1 },
          { productId: seraphine.id, quantity: 2 },
        ],
      },
    },
  });

  await seedStones();
  await seedShowcaseTabs();

  await prisma.order.create({
    data: {
      userId: ariana.id,
      orderNumber: "CJ-20260325-1001",
      status: "Feldolgozás alatt",
      subtotal: aurelia.price + elara.price,
      total: aurelia.price + elara.price,
      shippingName: "Ariana Bloom",
      shippingPhone: ariana.phone ?? "",
      shippingAddress: ariana.defaultShippingAddress ?? "",
      paymentMethod: "Bankkártya",
      createdAt: new Date("2026-03-22T09:15:00.000Z"),
      items: {
        create: [
          {
            productId: aurelia.id,
            productName: aurelia.name,
            productSlug: aurelia.slug,
            imageUrl: aurelia.imageUrl,
            unitPrice: aurelia.price,
            quantity: 1,
          },
          {
            productId: elara.id,
            productName: elara.name,
            productSlug: elara.slug,
            imageUrl: elara.imageUrl,
            unitPrice: elara.price,
            quantity: 1,
          },
        ],
      },
    },
  });
}

async function seedStones() {
  const stones = [
    {
      name: "Rózsakvarc", slug: "rozsakvarc", color: "rózsaszín", colorHex: "#f9c8dc",
      shortDesc: "A feltétel nélküli szeretet köve. Megnyitja a szívet és gyengéd energiával tölt el.",
      longDesc: "A rózsakvarc évezredek óta a szeretet, a gyengédség és az önelfogadás szimbóluma. Halvány rózsaszín árnyalata a Vénusz istennőhöz köti, az ókori görögök és rómaiak egyaránt használták ékszereikben. Energiája a szív csakrát aktiválja, segít elengedni a régi sebeket és megnyílni az új kapcsolatok előtt.",
      effects: ["Szeretet", "Önelfogadás", "Gyengédség", "Érzelmi gyógyulás"],
      origin: "Brazília, Madagaszkár", chakra: "Szív csakra", sortOrder: 1,
    },
    {
      name: "Ametiszt", slug: "ametiszt", color: "lila", colorHex: "#c4a0e8",
      shortDesc: "A nyugalom és az intuíció köve. Segít lecsendesíteni az elmét és mélyíteni az önismeretet.",
      longDesc: "Az ametiszt a kvarcásványok egyik legkedveltebb tagja, jellegzetes lila-ibolya árnyalatát mangán- és vastartalmának köszönheti. Az ókori görögök szerint megvédte viselőjét a részegségtől — neve is ebből ered ('a-methystos': nem részeg). Ma az intuíció, a spiritualitás és a belső béke köveként tartják számon.",
      effects: ["Nyugalom", "Intuíció", "Spiritualitás", "Álomvilág"],
      origin: "Uruguay, Brazília", chakra: "Korona csakra", sortOrder: 2,
    },
    {
      name: "Citrin", slug: "citrin", color: "sárga-arany", colorHex: "#f5c842",
      shortDesc: "A napfény és az öröm köve. Energizál, magabiztosságot ad és vonzza a pozitivitást.",
      longDesc: "A citrin a 'napfény köve' — meleg sárga-arany tónusa már önmagában vidámságot sugároz. Ritkán fordul elő természetes formában, legtöbb kereskedelmi citrin hőkezelt ametiszt. Energiája a napfonat csakrát aktiválja, erősíti az önbizalmat, kreativitást és segít megvalósítani az álmokat.",
      effects: ["Öröm", "Magabiztosság", "Kreativitás", "Pozitivitás"],
      origin: "Brazília, Spanyolország", chakra: "Napfonat csakra", sortOrder: 3,
    },
    {
      name: "Holdkő", slug: "holdko", color: "fehéres-kék", colorHex: "#d4e8f5",
      shortDesc: "A női energia és az intuíció köve. Összeköttet a holddal, a ciklusokkal és a belső bölcsességgel.",
      longDesc: "A holdkő finom kékes-fehér fényjátéka ('adularescencia') teszi különlegessé — belső ragyogása mintha mozogna, ahogy a fény éri. Az ókori Indiában szentnek tartták, a Hold istennőjéhez kötötték. Erősíti a női intuíciót, segít eligazodni az élet változó ciklusaiban és megbékélni az érzelmekkel.",
      effects: ["Intuíció", "Női energia", "Egyensúly", "Álmodozás"],
      origin: "Srí Lanka, India", chakra: "Homlok csakra", sortOrder: 4,
    },
    {
      name: "Obszidián", slug: "obszidian", color: "fekete", colorHex: "#2a2a2a",
      shortDesc: "A védelem és az igazság köve. Erős pajzsot von viselője köré és segít szembenézni önmagunkkal.",
      longDesc: "Az obszidián vulkanikus üveg — akkor keletkezik, amikor a láva gyorsan lehűl és nincs ideje kristályosodni. Ez az azonnali, nyers keletkezés adja különleges energiáját: gyors, éles, kompromisszummentes. Megvéd a negatív energiáktól, de egyben tükröt is tart — segít szembenézni saját árnyékunkkal.",
      effects: ["Védelem", "Igazság", "Gyógyulás", "Erő"],
      origin: "Mexikó, Izland", chakra: "Gyökér csakra", sortOrder: 5,
    },
    {
      name: "Türkiz", slug: "turkiz", color: "türkiz-kék", colorHex: "#4ac8c8",
      shortDesc: "A bölcsesség és a kommunikáció köve. Erősíti az önkifejezést és védelmet nyújt utazás közben.",
      longDesc: "A türkiz az egyik legregebben használt ékszerkő — az egyiptomi fáraók, a perzsa királyok és az azték nemesek egyaránt viselték. Kék-zöld árnyalata az ég és a tenger találkozását idézi. A torok csakrához kapcsolódik, így különösen erőteljes hatást fejt ki a kommunikációra, az önkifejezésre és a belső igazság kimondására.",
      effects: ["Kommunikáció", "Bölcsesség", "Védelem", "Önkifejezés"],
      origin: "Irán, USA, Kína", chakra: "Torok csakra", sortOrder: 6,
    },
    {
      name: "Labradorit", slug: "labradorit", color: "kék-zöld játék", colorHex: "#6a9ab0",
      shortDesc: "A mágia és a transzformáció köve. Felébreszti a belső fényt és megnyitja a lehetőségek kapuit.",
      longDesc: "A labradorit titokzatos és elvarázsló — fényjátéka ('labradorescencia') kéktől zöldig, aranytól lilásig váltakozik, mintha egy másik világ fényei szűrődnének át rajta. Az inuit legendák szerint a sarki fény szorult a kőbe. Erőteljes transzformációs kő: segít átlépni régi határokat, megbízni az intuícióban és befogadni a változást.",
      effects: ["Mágia", "Transzformáció", "Intuíció", "Védelem"],
      origin: "Kanada, Finnország", chakra: "Homlok csakra", sortOrder: 7,
    },
    {
      name: "Opál", slug: "opal", color: "szivárvány", colorHex: "#f0e8f8",
      shortDesc: "A kreativitás és az érzelmek köve. Minden szögből másképp ragyog — akárcsak aki viseli.",
      longDesc: "Az opál a legegyénibb drágakő — nincs két egyforma, minden darab más színjátékot mutat. Ez a tulajdonsága ('opalescencia') teszi különlegessé és egyszerre misztikussá. Az ókori rómaiak a remény és a tisztaság kövének tartották. Erősíti a kreativitást, fokozza az érzelmi intelligenciát és segít megmutatni valódi önmagunkat.",
      effects: ["Kreativitás", "Egyéniség", "Érzelmek", "Remény"],
      origin: "Ausztrália, Etiópia", chakra: "Korona csakra", sortOrder: 8,
    },
  ];

  await prisma.stone.deleteMany();
  await prisma.stone.createMany({ data: stones });
}

async function seedSpecialties() {
  await prisma.specialty.createMany({
    data: [
      {
        name: "Napfogó",
        slug: "napfogo",
        shortDescription: "Fényjátékos, ablakba akasztható különlegességek.",
        cardTitle: "Napfogó",
        cardDescription: "Kristályos fényjátékok otthonra és ajándékba.",
        ctaLabel: "Napfogók megnyitása",
        sortOrder: 0,
        isVisible: true,
      },
      {
        name: "Álomfogó",
        slug: "alomfogo",
        shortDescription: "Finom részletekkel készült, dekoratív álomfogók.",
        cardTitle: "Álomfogó",
        cardDescription: "Lágy, kézzel készített darabok nyugodt terekhez.",
        ctaLabel: "Álomfogók megnyitása",
        sortOrder: 1,
        isVisible: true,
      },
      {
        name: "Bokaláncok",
        slug: "bokalancok",
        shortDescription: "Könnyed, szezonális bokalánc válogatás.",
        cardTitle: "Bokaláncok",
        cardDescription: "Letisztult darabok nyári és ünnepi viseletekhez.",
        ctaLabel: "Bokaláncok megnyitása",
        sortOrder: 2,
        isVisible: true,
      },
    ],
  });
}

async function seedShowcaseTabs() {
  await prisma.homeShowcaseTab.createMany({
    data: [
      { key: "new", label: "Újdonságok", sortOrder: 1, filterType: "new_arrivals", maxItems: 8 },
      { key: "necklaces", label: "Nyakláncok", sortOrder: 2, filterType: "category", filterValue: "necklaces", maxItems: 8 },
      { key: "sale", label: "Akció", sortOrder: 3, filterType: "on_sale", maxItems: 8 },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
