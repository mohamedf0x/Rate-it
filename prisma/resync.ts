/**
 * Replays the cached game state from the source-of-truth rows: reviewer stats and badges
 * from the XP ledger and reviews, place rollups/tiers/badges from their reviews. Run it
 * after tuning anything in src/lib/gamification.ts, or if a cache is ever suspected to drift.
 */
import { PrismaClient } from "@prisma/client";
import { syncReviewerStats } from "../src/lib/xp";
import { refreshTargetRollups } from "../src/lib/reviews";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true } });
  for (const user of users) {
    await prisma.$transaction((tx) => syncReviewerStats(tx, user.id));
  }

  const places = await prisma.place.findMany({ select: { id: true } });
  for (const place of places) {
    await prisma.$transaction((tx) => refreshTargetRollups(tx, { kind: "place", id: place.id }));
  }

  const products = await prisma.product.findMany({ select: { id: true } });
  for (const product of products) {
    await prisma.$transaction((tx) => refreshTargetRollups(tx, { kind: "product", id: product.id }));
  }

  const listings = await prisma.skillListing.findMany({ select: { id: true } });
  for (const listing of listings) {
    await prisma.$transaction((tx) =>
      refreshTargetRollups(tx, { kind: "skillListing", id: listing.id }),
    );
  }

  console.log(
    `resynced ${users.length} users, ${places.length} places, ${products.length} products, ${listings.length} skill listings`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
