import type { Prisma, PointEventType } from "@prisma/client";

type PointEventInput = {
  userId: string;
  type: PointEventType;
  amount: number;
  reason?: string;
  refType?: string;
  refId?: string;
};

/** Appends to the points ledger. Call syncPointsBalance afterwards to refresh the cache. */
export async function recordPointEvent(tx: Prisma.TransactionClient, event: PointEventInput) {
  return tx.pointEvent.create({
    data: {
      userId: event.userId,
      type: event.type,
      amount: event.amount,
      reason: event.reason ?? null,
      refType: event.refType ?? null,
      refId: event.refId ?? null,
    },
  });
}

/** Rebuilds the cached balance from the ledger — PointEvent stays the source of truth. */
export async function syncPointsBalance(tx: Prisma.TransactionClient, userId: string) {
  const balance = await tx.pointEvent.aggregate({ where: { userId }, _sum: { amount: true } });
  const earned = await tx.pointEvent.aggregate({
    where: { userId, amount: { gt: 0 } },
    _sum: { amount: true },
  });

  const stats = {
    pointsBalance: balance._sum.amount ?? 0,
    pointsLifetime: earned._sum.amount ?? 0,
  };

  return tx.reviewerStats.upsert({
    where: { userId },
    create: { userId, ...stats },
    update: stats,
  });
}
