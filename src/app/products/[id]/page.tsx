import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getCurrentUser } from "@/lib/session";
import { reviewListArgs } from "@/lib/reviews";
import StarRating from "@/components/StarRating";
import ReviewForm from "@/components/ReviewForm";
import ReviewList from "@/components/ReviewList";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [locale, user] = await Promise.all([getLocale(), getCurrentUser()]);
  const dict = getDictionary(locale);

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      place: { select: { slug: true, name: true, ownerId: true } },
      reviews: reviewListArgs(user?.id ?? null),
    },
  });

  if (!product) notFound();

  const hasReviewed = user
    ? product.reviews.some((review) => review.author.username === user.username)
    : false;
  const canReview = Boolean(user) && product.place.ownerId !== user?.id;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href={`/places/${product.place.slug}`} className="text-sm text-neutral-500 hover:text-neutral-900">
        ← {product.place.name}
      </Link>

      <h1 className="mt-3 text-2xl font-bold tracking-tight">{product.name}</h1>
      {product.description ? <p className="mt-2 text-neutral-700">{product.description}</p> : null}
      <div className="mt-2">
        {product.reviewCount > 0 ? (
          <StarRating value={product.avgRating} count={product.reviewCount} />
        ) : (
          <span className="text-sm text-neutral-400">{dict.places.noRating}</span>
        )}
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">{dict.reviews.title}</h2>
        {!user ? (
          <p className="mt-2 text-sm text-neutral-500">
            <Link href="/login" className="underline">
              {dict.reviews.loginToReview}
            </Link>
          </p>
        ) : hasReviewed ? (
          <p className="mt-2 text-sm text-neutral-500">{dict.reviews.alreadyReviewed}</p>
        ) : canReview ? (
          <ReviewForm locale={locale} target={{ productId: product.id }} />
        ) : null}
        <ReviewList locale={locale} reviews={product.reviews} viewerId={user?.id ?? null} />
      </section>
    </main>
  );
}
