import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n/locale";
import { badgeLabel, getDictionary, tierLabel } from "@/lib/i18n/dictionaries";
import { REVIEWER_RANKS } from "@/lib/gamification";
import StarRating from "@/components/StarRating";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

/** How far through the current rank the reviewer is, for the progress meter. */
function rankProgress(xp: number) {
  const current = [...REVIEWER_RANKS].reverse().find((rank) => xp >= rank.minScore);
  const next = REVIEWER_RANKS.find((rank) => rank.minScore > xp);
  if (!next) return { percent: 100, gap: null };

  const floor = current?.minScore ?? 0;
  const span = next.minScore - floor;
  return { percent: Math.round(((xp - floor) / span) * 100), gap: next.minScore - xp };
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.profile;
  const dateFormat = locale === "ar" ? "ar-EG" : "en-GB";

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
  const { percent, gap } = rankProgress(xp);

  const stats = [
    { label: t.reviews, value: user.stats?.reviewCount ?? 0 },
    { label: t.firstReviews, value: user.stats?.firstReviewCount ?? 0 },
    { label: t.helpfulVotes, value: user.stats?.helpfulVotesReceived ?? 0 },
    { label: t.memberSince, value: user.createdAt.toLocaleDateString(dateFormat) },
  ];

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:px-6">
      <header className="flex items-start gap-4">
        <span
          className="grid size-14 shrink-0 place-items-center rounded-full bg-brand-soft font-display text-xl font-semibold text-brand"
          aria-hidden="true"
        >
          {user.displayName.slice(0, 1)}
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">{user.displayName}</h1>
          <p className="mt-0.5 text-sm text-muted" dir="ltr">
            @{user.username}
          </p>
        </div>
      </header>

      {user.bio ? <p className="mt-4 leading-relaxed">{user.bio}</p> : null}

      <Card className="mt-6 p-5">
        <div className="flex flex-wrap items-center gap-2.5">
          {user.stats?.rankTier ? (
            <Badge tone="tier">{tierLabel(locale, user.stats.rankTier.name)}</Badge>
          ) : null}
          <span className="text-sm text-muted">
            {t.level} {user.stats?.level ?? 1}
          </span>
          <span className="ms-auto font-display text-lg font-semibold tabular-nums text-gold">
            {xp} <span className="text-sm font-normal text-muted">{t.xp}</span>
          </span>
        </div>

        <div
          className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-2"
          role="img"
          aria-label={gap === null ? t.maxRank : `${gap} ${t.toNextRank}`}
        >
          <span
            /* The bar fills from the inline start, so the gradient has to be mirrored too —
               otherwise it runs gold-to-brand in Arabic, backwards from the intent. */
            className="block h-full rounded-full bg-gradient-to-r from-brand to-gold rtl:bg-gradient-to-l"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted">
          {gap === null ? t.maxRank : `${gap} ${t.toNextRank}`}
        </p>

        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="text-xs text-muted">{stat.label}</dt>
              <dd className="mt-0.5 font-display text-lg font-semibold tabular-nums">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold">{dict.badges.title}</h2>
        {user.badges.length === 0 ? (
          <Card className="mt-3 px-4 py-5 text-sm text-muted">{dict.badges.empty}</Card>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {user.badges.map(({ badge, awardedAt }) => (
              <li key={badge.id} title={badge.description}>
                <Badge tone="gold" icon={badge.icon ?? undefined}>
                  {badgeLabel(locale, badge.code, badge.name)}
                  <time dateTime={awardedAt.toISOString()} className="text-gold/70">
                    {awardedAt.toLocaleDateString(dateFormat)}
                  </time>
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold">{t.reviewsTitle}</h2>
        {user.reviews.length === 0 ? (
          <Card className="mt-3 px-4 py-5 text-sm text-muted">{t.noReviews}</Card>
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
                <Card as="li" key={review.id} className="p-4">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                    <StarRating value={review.rating} />
                    {target ? (
                      <Link href={target.href} className="text-sm font-medium hover:text-brand">
                        {target.name}
                      </Link>
                    ) : null}
                    <time
                      dateTime={review.createdAt.toISOString()}
                      className="text-xs text-muted"
                    >
                      {review.createdAt.toLocaleDateString(dateFormat)}
                    </time>
                  </div>
                  {review.title ? <p className="mt-2.5 font-medium">{review.title}</p> : null}
                  <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed">
                    {review.body}
                  </p>
                </Card>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
