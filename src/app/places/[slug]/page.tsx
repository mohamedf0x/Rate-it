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
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import CategoryIcon from "@/components/ui/CategoryIcon";
import { buttonClasses } from "@/components/ui/Button";

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
  const hasReviewed = user
    ? place.reviews.some((review) => review.author.username === user.username)
    : false;
  const canReview = Boolean(user) && place.ownerId !== user?.id;
  const hasContact = place.address || place.phone || place.website;

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <CategoryIcon category={place.category} size="lg" />
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold sm:text-3xl">{place.name}</h1>
            <p className="mt-1 text-sm text-muted">
              {dict.categories[place.category]}
              {place.city ? ` · ${place.city}` : ""}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              {place.reviewCount > 0 ? (
                <StarRating value={place.avgRating} count={place.reviewCount} size="lg" />
              ) : (
                <span className="text-sm text-muted">{t.noRating}</span>
              )}
              {place.rankTier ? (
                <Badge tone="tier">{tierLabel(locale, place.rankTier.name)}</Badge>
              ) : null}
            </div>
          </div>
        </div>
        {canEdit ? (
          <Link
            href={`/places/${place.slug}/edit`}
            className={buttonClasses("secondary", "sm", "shrink-0")}
          >
            {t.detail.edit}
          </Link>
        ) : null}
      </div>

      {place.badges.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {place.badges.map(({ badge }) => (
            <li key={badge.id} title={badge.description}>
              <Badge tone="gold" icon={badge.icon ?? undefined}>
                {badgeLabel(locale, badge.code, badge.name)}
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}

      {place.description ? (
        <p className="mt-5 whitespace-pre-line leading-relaxed">{place.description}</p>
      ) : null}

      {hasContact ? (
        <Card className="mt-5 divide-y divide-border">
          {place.address ? <p className="px-4 py-3 text-sm">{place.address}</p> : null}
          {place.phone ? (
            <p dir="ltr" className="px-4 py-3 text-start text-sm tabular-nums">
              {place.phone}
            </p>
          ) : null}
          {place.website ? (
            <p className="px-4 py-3 text-sm">
              <a
                href={place.website}
                dir="ltr"
                className="inline-block text-start text-brand underline underline-offset-2"
                target="_blank"
                rel="noreferrer"
              >
                {place.website}
              </a>
            </p>
          ) : null}
        </Card>
      ) : null}

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
        <h2 className="font-display text-lg font-semibold">{t.detail.products}</h2>
        {place.products.length === 0 ? (
          <Card className="mt-3 px-4 py-5 text-sm text-muted">{t.detail.noProducts}</Card>
        ) : (
          <Card className="mt-3 divide-y divide-border">
            {place.products.map((product) => (
              <div key={product.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <Link href={`/products/${product.id}`} className="min-w-0 hover:text-brand">
                  <p className="truncate font-medium">{product.name}</p>
                  {product.description ? (
                    <p className="truncate text-sm text-muted">{product.description}</p>
                  ) : null}
                </Link>
                {product.reviewCount > 0 ? (
                  <StarRating value={product.avgRating} count={product.reviewCount} />
                ) : (
                  <span className="shrink-0 text-xs text-muted">{t.noRating}</span>
                )}
              </div>
            ))}
          </Card>
        )}
        {canEdit ? <AddProductForm locale={locale} slug={place.slug} /> : null}
      </section>

      <section className="mt-10">
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
          <ReviewForm locale={locale} target={{ placeId: place.id }} />
        ) : null}
        <ReviewList locale={locale} reviews={place.reviews} viewerId={user?.id ?? null} />
      </section>
    </main>
  );
}
