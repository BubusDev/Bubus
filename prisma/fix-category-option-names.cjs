const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const updates = [
    { slug: "necklaces", name: "Nyakl\u00e1ncok" },
    { slug: "bracelets", name: "Kark\u00f6t\u0151k" },
  ];

  for (const update of updates) {
    await prisma.productOption.updateMany({
      where: {
        type: "CATEGORY",
        slug: update.slug,
        name: { not: update.name },
      },
      data: {
        name: update.name,
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
