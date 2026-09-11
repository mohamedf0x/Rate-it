import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { XP_AWARDS } from "@/lib/gamification";
import { recordXpEvent, syncReviewerStats } from "@/lib/xp";

const voteSchema = z.object({ type: z.enum(["HELPFUL", "UNHELPFUL"]) });

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = voteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { type } = parsed.data;

  const review = await prisma.review.findUnique({
    where: { id },
    select: { id: true, authorId: true, status: true },
  });
  if (!review || review.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }
  if (review.authorId === user.id) {
    return NextResponse.json({ error: "You can't vote on your own review" }, { status: 403 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.reviewVote.findUnique({
      where: { reviewId_userId: { reviewId: review.id, userId: user.id } },
      select: { id: true, type: true },
    });

    // Clicking the same button again clears the vote.
    if (existing?.type === type) {
      await tx.reviewVote.delete({ where: { id: existing.id } });
    } else if (existing) {
      await tx.reviewVote.update({ where: { id: existing.id }, data: { type } });
    } else {
      await tx.reviewVote.create({ data: { reviewId: review.id, userId: user.id, type } });
    }

    const helpfulCount = await tx.reviewVote.count({
      where: { reviewId: review.id, type: "HELPFUL" },
    });
    const unhelpfulCount = await tx.reviewVote.count({
      where: { reviewId: review.id, type: "UNHELPFUL" },
    });
    await tx.review.update({ where: { id: review.id }, data: { helpfulCount, unhelpfulCount } });

    // Mirror the change in the ledger so XP can't be farmed by toggling a vote.
    const wasHelpful = existing?.type === "HELPFUL";
    const isHelpfulNow = type === "HELPFUL" && existing?.type !== "HELPFUL";
    if (!wasHelpful && isHelpfulNow) {
      await recordXpEvent(tx, {
        userId: review.authorId,
        type: "REVIEW_GOT_UPVOTED",
        amount: XP_AWARDS.REVIEW_GOT_UPVOTED,
        refType: "review",
        refId: review.id,
      });
    } else if (wasHelpful && !isHelpfulNow) {
      await recordXpEvent(tx, {
        userId: review.authorId,
        type: "REVIEW_GOT_UPVOTED",
        amount: -XP_AWARDS.REVIEW_GOT_UPVOTED,
        refType: "review",
        refId: review.id,
      });
    }

    await syncReviewerStats(tx, review.authorId);

    const myVote = existing?.type === type ? null : type;
    return { helpfulCount, unhelpfulCount, myVote };
  });

  return NextResponse.json(result);
}
