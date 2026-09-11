import { PrismaClient } from "@prisma/client";
import {
  REVIEWER_RANKS,
  PLACE_TIERS,
  REVIEWER_BADGES,
  PLACE_BADGES,
} from "../src/lib/gamification";

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

  for (const badge of REVIEWER_BADGES) {
    await prisma.badge.upsert({
      where: { code: badge.code },
      update: { ...badge, scope: "REVIEWER" },
      create: { ...badge, scope: "REVIEWER" },
    });
  }

  for (const badge of PLACE_BADGES) {
    await prisma.badge.upsert({
      where: { code: badge.code },
      update: { ...badge, scope: "PLACE" },
      create: { ...badge, scope: "PLACE" },
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
