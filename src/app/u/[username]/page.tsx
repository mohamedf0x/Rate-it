import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n/locale";
import { badgeLabel, getDictionary, tierLabel } from "@/lib/i18n/dictionaries";
import { REVIEWER_RANKS } from "@/lib/gamification";
import StarRating from "@/components/StarRating";

function nextRankGap(xp: number) {
  const next = REVIEWER_RANKS.find((rank) => rank.minScore > xp);
  return next ? next.minScore - xp : null;
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.profile;

  const user = await prisma.user.findUnique({
    where: { username: decodeURIComponent(username) },
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      createdAt: true,
      stats: { include: { rankTier: true } },
      badges: { include: { badge: true }, orderBy: { awardedAt: "desc" } },
      reviews: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          place: { select: { slug: true, name: true } },
          product: { select: { id: true, name: true } },
          skillListing: { select: { id: true, title: true } },
        },
      },
    },
  });

  if (!user) notFound();

  const xp = user.stats?.xp ?? 0;
  const gap = nextRankGap(xp);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{user.displayName}</h1>
        <p className="mt-1 text-sm text-neutral-500" dir="ltr">
          @{user.username}
        </p>
        {user.bio ? <p className="mt-3 text-neutral-700">{user.bio}</p> : null}
      </header>

      <section className="mt-6 rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          {user.stats?.rankTier ? (
            <span className="rounded-full bg-neutral-900 px-3 py-1 text-sm font-medium text-white">
              {tierLabel(locale, user.stats.rankTier.name)}
            </span>
          ) : null}
          <span className="text-sm text-neutral-600">
            {t.level} {user.stats?.level ?? 1}
          </span>
          <span className="text-sm font-medium text-neutral-900">
            {xp} {t.xp}
          </span>
          <span className="text-sm text-neutral-500">
            {gap === null ? t.maxRank : `${gap} ${t.toNextRank}`}
          </span>
        </div>

        <dl className="mt-4 flex flex-wrap gap-6 text-sm">
          <div>
            <dt className="text-neutral-500">{t.reviews}</dt>
            <dd className="text-lg font-semibold">{user.stats?.reviewCount ?? 0}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">{t.firstReviews}</dt>
            <dd className="text-lg font-semibold">{user.stats?.firstReviewCount ?? 0}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">{t.helpfulVotes}</dt>
            <dd className="text-lg font-semibold">{user.stats?.helpfulVotesReceived ?? 0}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">{t.memberSince}</dt>
            <dd className="text-lg font-semibold">
              {user.createdAt.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB")}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">{dict.badges.title}</h2>
        {user.badges.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">{dict.badges.empty}</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {user.badges.map(({ badge, awardedAt }) => (
              <li
                key={badge.id}
                title={badge.description}
                className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm"
              >
                <span aria-hidden>{badge.icon}</span>
                <span>{badgeLabel(locale, badge.code, badge.name)}</span>
                <time dateTime={awardedAt.toISOString()} className="text-xs text-neutral-400">
                  {awardedAt.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB")}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">{t.reviewsTitle}</h2>
        {user.reviews.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">{t.noReviews}</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {user.reviews.map((review) => {
              const target = review.place
                ? { href: `/places/${review.place.slug}`, name: review.place.name }
                : review.product
                  ? { href: `/products/${review.product.id}`, name: review.product.name }
                  : review.skillListing
                    ? { href: `/u/${user.username}`, name: review.skillListing.title }
                    : null;

              return (
                <li key={review.id} className="rounded-lg border border-neutral-200 bg-white p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <StarRating value={review.rating} />
                    {target ? (
                      <Link href={target.href} className="text-sm font-medium text-neutral-900">
                        {target.name}
                      </Link>
                    ) : null}
                    <time dateTime={review.createdAt.toISOString()} className="text-xs text-neutral-400">
                      {review.createdAt.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB")}
                    </time>
                  </div>
                  {review.title ? <p className="mt-2 font-medium">{review.title}</p> : null}
                  <p className="mt-1 whitespace-pre-line text-sm text-neutral-700">{review.body}</p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
