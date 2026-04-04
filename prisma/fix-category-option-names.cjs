const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const updates = [
    {
      name: "Nyakl\u00e1ncok",
      desiredSlug: "necklaces",
      knownSlugs: ["necklaces", "nyaklancok", "nyakl-ncok"],
    },
    {
      name: "Kark\u00f6t\u0151k",
      desiredSlug: "bracelets",
      knownSlugs: ["bracelets", "karkotok", "kark-t-k"],
    },
  ];

  for (const update of updates) {
    await prisma.productOption.updateMany({
      where: {
        type: "CATEGORY",
        OR: [
          { slug: { in: update.knownSlugs } },
          { name: update.name },
        ],
      },
      data: {
        name: update.name,
        slug: update.desiredSlug,
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
