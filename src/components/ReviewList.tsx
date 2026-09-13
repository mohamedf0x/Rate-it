import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import StarRating from "@/components/StarRating";
import ReviewVoteButtons from "@/components/ReviewVoteButtons";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export type ReviewListItem = {
  id: string;
  authorId: string;
  rating: number;
  title: string | null;
  body: string;
  isFirstReview: boolean;
  helpfulCount: number;
  unhelpfulCount: number;
  createdAt: Date;
  author: { username: string; displayName: string };
  votes: { type: "HELPFUL" | "UNHELPFUL" }[];
};

export default function ReviewList({
  locale,
  reviews,
  viewerId,
}: {
  locale: Locale;
  reviews: ReviewListItem[];
  viewerId: string | null;
}) {
  const t = getDictionary(locale).reviews;

  if (reviews.length === 0) {
    return <Card className="mt-3 px-4 py-5 text-sm text-muted">{t.empty}</Card>;
  }

  return (
    <ul className="mt-3 space-y-3">
      {reviews.map((review) => (
        <Card as="li" key={review.id} className="p-4">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
            <Link
              href={`/u/${review.author.username}`}
              className="font-medium hover:text-brand"
            >
              {review.author.displayName}
            </Link>
            <StarRating value={review.rating} />
            {review.isFirstReview ? <Badge tone="gold">{t.firstBadge}</Badge> : null}
            <time dateTime={review.createdAt.toISOString()} className="text-xs text-muted">
              {review.createdAt.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB")}
            </time>
          </div>
          {review.title ? <p className="mt-2.5 font-medium">{review.title}</p> : null}
          <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed">{review.body}</p>
          {viewerId && viewerId !== review.authorId ? (
            <ReviewVoteButtons
              locale={locale}
              reviewId={review.id}
              helpfulCount={review.helpfulCount}
              unhelpfulCount={review.unhelpfulCount}
              myVote={review.votes[0]?.type ?? null}
            />
          ) : review.helpfulCount > 0 ? (
            <p className="mt-3 text-xs text-muted">
              {t.helpful} ({review.helpfulCount})
            </p>
          ) : null}
        </Card>
      ))}
    </ul>
  );
}
