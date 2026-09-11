import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  computePlaceQualityScore,
  PLACE_TIERS,
  rankForScore,
  XP_AWARDS,
} from "@/lib/gamification";
import { recordXpEvent, syncReviewerStats } from "@/lib/xp";

export const reviewCreateSchema = z
  .object({
    placeId: z.string().min(1).optional(),
    productId: z.string().min(1).optional(),
    skillListingId: z.string().min(1).optional(),
    rating: z.coerce.number().int().min(1).max(5),
    title: z
      .string()
      .trim()
      .max(120)
      .optional()
      .transform((value) => (value ? value : null)),
    body: z.string().trim().min(10).max(4000),
  })
  .refine(
    (data) =>
      [data.placeId, data.productId, data.skillListingId].filter(Boolean).length === 1,
    { message: "A review must target exactly one place, product or skill listing" },
  );

export type ReviewInput = z.infer<typeof reviewCreateSchema>;

export type ReviewTarget =
  | { kind: "place"; id: string }
  | { kind: "product"; id: string }
  | { kind: "skillListing"; id: string };

export function targetFromInput(input: ReviewInput): ReviewTarget {
  if (input.placeId) return { kind: "place", id: input.placeId };
  if (input.productId) return { kind: "product", id: input.productId };
  return { kind: "skillListing", id: input.skillListingId! };
}

/** Review list shape for detail pages: author plus the viewer's own vote (none when logged out). */
export function reviewListArgs(viewerId: string | null) {
  return {
    where: { status: "PUBLISHED" as const },
    orderBy: [{ helpfulCount: "desc" as const }, { createdAt: "desc" as const }],
    include: {
      author: { select: { username: true, displayName: true } },
      votes: { where: { userId: viewerId ?? "" }, select: { type: true } },
    },
  };
}

export class ReviewError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/** Recomputes avgRating/reviewCount from the rows themselves so the cache can't drift. */
export async function refreshTargetRollups(tx: Prisma.TransactionClient, target: ReviewTarget) {
  const where = {
    status: "PUBLISHED" as const,
    ...(target.kind === "place" ? { placeId: target.id } : {}),
    ...(target.kind === "product" ? { productId: target.id } : {}),
    ...(target.kind === "skillListing" ? { skillListingId: target.id } : {}),
  };

  const aggregate = await tx.review.aggregate({
    where,
    _avg: { rating: true },
    _count: { _all: true },
  });

  const avgRating = aggregate._avg.rating ?? 0;
  const reviewCount = aggregate._count._all;

  if (target.kind === "place") {
    // A place's tier tracks its quality score, which weighs rating against volume.
    const qualityScore = computePlaceQualityScore(avgRating, reviewCount);
    const tier = rankForScore(PLACE_TIERS, qualityScore);
    const rankTier = await tx.rankTier.findUnique({
      where: { scope_order: { scope: "PLACE", order: tier.order } },
      select: { id: true },
    });

    await tx.place.update({
      where: { id: target.id },
      data: { avgRating, reviewCount, qualityScore, rankTierId: rankTier?.id ?? null },
    });
  } else if (target.kind === "product") {
    await tx.product.update({ where: { id: target.id }, data: { avgRating, reviewCount } });
  } else {
    await tx.skillListing.update({ where: { id: target.id }, data: { avgRating, reviewCount } });
  }

  return { avgRating, reviewCount };
}

/** Throws if the target is missing or the author would be reviewing their own listing. */
async function assertReviewable(
  tx: Prisma.TransactionClient,
  target: ReviewTarget,
  authorId: string,
) {
  if (target.kind === "place") {
    const place = await tx.place.findUnique({
      where: { id: target.id },
      select: { id: true, ownerId: true },
    });
    if (!place) throw new ReviewError("Place not found", 404);
    if (place.ownerId === authorId) throw new ReviewError("You can't review your own place", 403);
    return;
  }

  if (target.kind === "product") {
    const product = await tx.product.findUnique({
      where: { id: target.id },
      select: { id: true, place: { select: { ownerId: true } } },
    });
    if (!product) throw new ReviewError("Product not found", 404);
    if (product.place.ownerId === authorId) {
      throw new ReviewError("You can't review your own product", 403);
    }
    return;
  }

  const listing = await tx.skillListing.findUnique({
    where: { id: target.id },
    select: { id: true, userId: true },
  });
  if (!listing) throw new ReviewError("Skill listing not found", 404);
  if (listing.userId === authorId) {
    throw new ReviewError("You can't review your own skill listing", 403);
  }
}

export async function createReview(input: ReviewInput, authorId: string) {
  const target = targetFromInput(input);

  return prisma.$transaction(async (tx) => {
    await assertReviewable(tx, target, authorId);

    const duplicate = await tx.review.findFirst({
      where: {
        authorId,
        placeId: input.placeId ?? null,
        productId: input.productId ?? null,
        skillListingId: input.skillListingId ?? null,
      },
      select: { id: true },
    });
    if (duplicate) throw new ReviewError("You already reviewed this", 409);

    const existingCount = await tx.review.count({
      where: {
        status: "PUBLISHED",
        placeId: input.placeId ?? null,
        productId: input.productId ?? null,
        skillListingId: input.skillListingId ?? null,
      },
    });

    const review = await tx.review.create({
      data: {
        authorId,
        placeId: input.placeId ?? null,
        productId: input.productId ?? null,
        skillListingId: input.skillListingId ?? null,
        rating: input.rating,
        title: input.title,
        body: input.body,
        isFirstReview: existingCount === 0,
      },
    });

    await refreshTargetRollups(tx, target);

    await recordXpEvent(tx, {
      userId: authorId,
      type: "REVIEW_WRITTEN",
      amount: XP_AWARDS.REVIEW_WRITTEN,
      refType: "review",
      refId: review.id,
    });

    if (review.isFirstReview) {
      await recordXpEvent(tx, {
        userId: authorId,
        type: "FIRST_TO_REVIEW",
        amount: XP_AWARDS.FIRST_TO_REVIEW,
        refType: "review",
        refId: review.id,
      });
    }

    await syncReviewerStats(tx, authorId);

    return review;
  });
}
