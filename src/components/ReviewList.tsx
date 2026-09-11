import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import StarRating from "@/components/StarRating";

export type ReviewListItem = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  isFirstReview: boolean;
  helpfulCount: number;
  createdAt: Date;
  author: { username: string; displayName: string };
};

export default function ReviewList({
  locale,
  reviews,
}: {
  locale: Locale;
  reviews: ReviewListItem[];
}) {
  const t = getDictionary(locale).reviews;

  if (reviews.length === 0) {
    return <p className="mt-3 text-sm text-neutral-500">{t.empty}</p>;
  }

  return (
    <ul className="mt-3 space-y-3">
      {reviews.map((review) => (
        <li key={review.id} className="rounded-lg border border-neutral-200 bg-white p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/u/${review.author.username}`} className="font-medium text-neutral-900">
              {review.author.displayName}
            </Link>
            <StarRating value={review.rating} />
            {review.isFirstReview ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                {t.firstBadge}
              </span>
            ) : null}
            <time
              dateTime={review.createdAt.toISOString()}
              className="text-xs text-neutral-400"
            >
              {review.createdAt.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB")}
            </time>
          </div>
          {review.title ? <p className="mt-2 font-medium">{review.title}</p> : null}
          <p className="mt-1 whitespace-pre-line text-sm text-neutral-700">{review.body}</p>
        </li>
      ))}
    </ul>
  );
}
