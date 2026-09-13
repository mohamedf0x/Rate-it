import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getCurrentUser } from "@/lib/session";
import { reviewListArgs } from "@/lib/reviews";
import StarRating from "@/components/StarRating";
import ReviewForm from "@/components/ReviewForm";
import ReviewList from "@/components/ReviewList";
import CategoryIcon from "@/components/ui/CategoryIcon";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [locale, user] = await Promise.all([getLocale(), getCurrentUser()]);
  const dict = getDictionary(locale);

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      place: { select: { slug: true, name: true, ownerId: true, category: true } },
      reviews: reviewListArgs(user?.id ?? null),
    },
  });

  if (!product) notFound();

  const hasReviewed = user
    ? product.reviews.some((review) => review.author.username === user.username)
    : false;
  const canReview = Boolean(user) && product.place.ownerId !== user?.id;

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:px-6">
      <Link
        href={`/places/${product.place.slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
      >
        {/* Back points the other way in Arabic, so the arrow is mirrored rather than swapped. */}
        <ArrowLeft size={15} className="rtl:rotate-180" aria-hidden="true" />
        {product.place.name}
      </Link>

      <div className="mt-4 flex items-start gap-3">
        <CategoryIcon category={product.place.category} size="lg" />
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">{product.name}</h1>
          <div className="mt-2">
            {product.reviewCount > 0 ? (
              <StarRating value={product.avgRating} count={product.reviewCount} size="lg" />
            ) : (
              <span className="text-sm text-muted">{dict.places.noRating}</span>
            )}
          </div>
        </div>
      </div>

      {product.description ? (
        <p className="mt-4 whitespace-pre-line leading-relaxed">{product.description}</p>
      ) : null}

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold">{dict.reviews.title}</h2>
        {!user ? (
          <p className="mt-3 text-sm text-muted">
            <Link href="/login" className="text-brand underline underline-offset-2">
              {dict.reviews.loginToReview}
            </Link>
          </p>
        ) : hasReviewed ? (
          <p className="mt-3 text-sm text-muted">{dict.reviews.alreadyReviewed}</p>
        ) : canReview ? (
          <ReviewForm locale={locale} target={{ productId: product.id }} />
        ) : null}
        <ReviewList locale={locale} reviews={product.reviews} viewerId={user?.id ?? null} />
      </section>
    </main>
  );
}
