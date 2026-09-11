import type { Prisma, XpEventType } from "@prisma/client";
import { earnedReviewerBadges, REVIEWER_RANKS, rankForScore } from "@/lib/gamification";
import { awardUserBadges } from "@/lib/badges";

type XpEventInput = {
  userId: string;
  type: XpEventType;
  amount: number;
  refType?: string;
  refId?: string;
};

/** Appends to the XP ledger. Call syncReviewerStats afterwards to refresh the cache. */
export async function recordXpEvent(tx: Prisma.TransactionClient, event: XpEventInput) {
  return tx.xpEvent.create({
    data: {
      userId: event.userId,
      type: event.type,
      amount: event.amount,
      refType: event.refType ?? null,
      refId: event.refId ?? null,
    },
  });
}

/** Rebuilds ReviewerStats from the ledger and review rows — XpEvent stays the source of truth. */
export async function syncReviewerStats(tx: Prisma.TransactionClient, userId: string) {
  const xpAggregate = await tx.xpEvent.aggregate({ where: { userId }, _sum: { amount: true } });
  const xp = xpAggregate._sum.amount ?? 0;

  const reviewCount = await tx.review.count({ where: { authorId: userId, status: "PUBLISHED" } });
  const firstReviewCount = await tx.review.count({
    where: { authorId: userId, status: "PUBLISHED", isFirstReview: true },
  });
  const helpfulVotesReceived = await tx.reviewVote.count({
    where: { type: "HELPFUL", review: { authorId: userId } },
  });

  const rank = rankForScore(REVIEWER_RANKS, xp);
  const rankTier = await tx.rankTier.findUnique({
    where: { scope_order: { scope: "REVIEWER", order: rank.order } },
    select: { id: true },
  });

  const stats = {
    xp,
    level: rank.order,
    rankTierId: rankTier?.id ?? null,
    reviewCount,
    firstReviewCount,
    helpfulVotesReceived,
  };

  const updated = await tx.reviewerStats.upsert({
    where: { userId },
    create: { userId, ...stats },
    update: stats,
  });

  await awardUserBadges(tx, userId, earnedReviewerBadges(stats));

  return updated;
}
