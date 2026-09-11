import type { Prisma } from "@prisma/client";

/** Awards any badge in `codes` the owner doesn't already hold. Badges are never revoked. */
export async function awardUserBadges(
  tx: Prisma.TransactionClient,
  userId: string,
  codes: string[],
) {
  if (codes.length === 0) return;

  const badges = await tx.badge.findMany({
    where: { code: { in: codes }, scope: "REVIEWER" },
    select: { id: true },
  });

  await tx.userBadge.createMany({
    data: badges.map((badge) => ({ userId, badgeId: badge.id })),
    skipDuplicates: true,
  });
}

export async function awardPlaceBadges(
  tx: Prisma.TransactionClient,
  placeId: string,
  codes: string[],
) {
  if (codes.length === 0) return;

  const badges = await tx.badge.findMany({
    where: { code: { in: codes }, scope: "PLACE" },
    select: { id: true },
  });

  await tx.placeBadge.createMany({
    data: badges.map((badge) => ({ placeId, badgeId: badge.id })),
    skipDuplicates: true,
  });
}
