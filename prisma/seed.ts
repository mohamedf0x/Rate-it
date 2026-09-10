import { PrismaClient } from "@prisma/client";
import { REVIEWER_RANKS, PLACE_TIERS } from "../src/lib/gamification";

const prisma = new PrismaClient();

async function main() {
  for (const tier of REVIEWER_RANKS) {
    await prisma.rankTier.upsert({
      where: { scope_order: { scope: "REVIEWER", order: tier.order } },
      update: { name: tier.name, minScore: tier.minScore },
      create: { scope: "REVIEWER", ...tier },
    });
  }

  for (const tier of PLACE_TIERS) {
    await prisma.rankTier.upsert({
      where: { scope_order: { scope: "PLACE", order: tier.order } },
      update: { name: tier.name, minScore: tier.minScore },
      create: { scope: "PLACE", ...tier },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
