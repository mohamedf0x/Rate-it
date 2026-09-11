import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n/locale";
import { badgeLabel, getDictionary, tierLabel } from "@/lib/i18n/dictionaries";
import { getCurrentUser } from "@/lib/session";
import { canEditPlace } from "@/lib/places";
import { decodeSlug } from "@/lib/slug";
import { reviewListArgs } from "@/lib/reviews";
import StarRating from "@/components/StarRating";
import AddProductForm from "@/components/AddProductForm";
import PlacesMap from "@/components/map/PlacesMap";
import ReviewForm from "@/components/ReviewForm";
import ReviewList from "@/components/ReviewList";

export default async function PlaceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = decodeSlug((await params).slug);
  const [locale, user] = await Promise.all([getLocale(), getCurrentUser()]);
  const dict = getDictionary(locale);
  const t = dict.places;

  const place = await prisma.place.findUnique({
    where: { slug },
    include: {
      rankTier: true,
      badges: { include: { badge: true }, orderBy: { awardedAt: "desc" } },
      products: { orderBy: { createdAt: "desc" } },
      reviews: reviewListArgs(user?.id ?? null),
    },
  });

  if (!place) notFound();

  const canEdit = user ? canEditPlace(user, place) : false;
  const hasReviewed = user ? place.reviews.some((review) => review.author.username === user.username) : false;
  const canReview = Boolean(user) && place.ownerId !== user?.id;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{place.name}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {dict.categories[place.category]}
            {place.city ? ` · ${place.city}` : ""}
            {place.rankTier ? ` · ${tierLabel(locale, place.rankTier.name)}` : ""}
          </p>
          <div className="mt-2">
            {place.reviewCount > 0 ? (
              <StarRating value={place.avgRating} count={place.reviewCount} />
            ) : (
              <span className="text-sm text-neutral-400">{t.noRating}</span>
            )}
          </div>
        </div>
        {canEdit ? (
          <Link
            href={`/places/${place.slug}/edit`}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:border-neutral-400"
          >
            {t.detail.edit}
          </Link>
        ) : null}
      </div>

      {place.badges.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {place.badges.map(({ badge }) => (
            <li
              key={badge.id}
              title={badge.description}
              className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm"
            >
              <span aria-hidden>{badge.icon}</span>
              <span>{badgeLabel(locale, badge.code, badge.name)}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {place.description ? (
        <p className="mt-4 whitespace-pre-line text-neutral-700">{place.description}</p>
      ) : null}

      <dl className="mt-4 space-y-1 text-sm text-neutral-600">
        {place.address ? <dd>{place.address}</dd> : null}
        {place.phone ? <dd dir="ltr" className="text-start">{place.phone}</dd> : null}
        {place.website ? (
          <dd>
            <a href={place.website} dir="ltr" className="text-start underline" target="_blank" rel="noreferrer">
              {place.website}
            </a>
          </dd>
        ) : null}
      </dl>

      {place.lat !== null && place.lng !== null ? (
        <section className="mt-6">
          <PlacesMap
            locale={locale}
            height="280px"
            places={[
              {
                id: place.id,
                slug: place.slug,
                name: place.name,
                category: place.category,
                lat: place.lat,
                lng: place.lng,
                avgRating: place.avgRating,
                reviewCount: place.reviewCount,
              },
            ]}
          />
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-lg font-semibold">{t.detail.products}</h2>
        {place.products.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">{t.detail.noProducts}</p>
        ) : (
          <ul className="mt-3 divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
            {place.products.map((product) => (
              <li key={product.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <Link href={`/products/${product.id}`} className="min-w-0">
                  <p className="font-medium text-neutral-900">{product.name}</p>
                  {product.description ? (
                    <p className="text-sm text-neutral-500">{product.description}</p>
                  ) : null}
                </Link>
                {product.reviewCount > 0 ? (
                  <StarRating value={product.avgRating} count={product.reviewCount} />
                ) : (
                  <span className="shrink-0 text-xs text-neutral-400">{t.noRating}</span>
                )}
              </li>
            ))}
          </ul>
        )}
        {canEdit ? <AddProductForm locale={locale} slug={place.slug} /> : null}
      </section>

      <section className="mt-10">
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
          <ReviewForm locale={locale} target={{ placeId: place.id }} />
        ) : null}
        <ReviewList locale={locale} reviews={place.reviews} viewerId={user?.id ?? null} />
      </section>
    </main>
  );
}
