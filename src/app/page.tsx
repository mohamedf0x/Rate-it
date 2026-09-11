import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { PLACE_CATEGORIES } from "@/lib/places";
import { CATEGORY_PIN } from "@/lib/map";
import { buttonClasses } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Lattice from "@/components/ui/Lattice";

export default async function HomePage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.home;

  const [placeCount, reviewCount, reviewerCount] = await Promise.all([
    prisma.place.count(),
    prisma.review.count({ where: { status: "PUBLISHED" } }),
    prisma.user.count({ where: { reviews: { some: { status: "PUBLISHED" } } } }),
  ]);

  const stats = [
    { value: placeCount, label: t.statsPlaces },
    { value: reviewCount, label: t.statsReviews },
    { value: reviewerCount, label: t.statsReviewers },
  ];

  return (
    <main>
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-brand-soft to-bg">
        <Lattice className="pointer-events-none absolute -top-1/3 end-[-8%] aspect-square w-[min(55%,420px)] text-brand opacity-20" />
        <div className="relative mx-auto max-w-5xl px-5 py-14 sm:px-6 sm:py-20">
          <p className="text-sm text-muted">{t.heroEyebrow}</p>
          <h1 className="mt-3 max-w-[18ch] text-balance font-display text-4xl font-bold leading-tight sm:text-5xl">
            {t.heroTitle}
          </h1>
          <p className="mt-4 max-w-[46ch] text-base leading-relaxed text-muted sm:text-lg">
            {t.heroLede}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/places" className={buttonClasses("primary")}>
              {t.browseCta}
            </Link>
            <Link href="/places/new" className={buttonClasses("secondary")}>
              {t.addCta}
            </Link>
          </div>

          <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-baseline gap-2">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-display text-2xl font-semibold tabular-nums">{stat.value}</dd>
                <span className="text-sm text-muted">{stat.label}</span>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-6">
        <h2 className="font-display text-xl font-semibold">{t.categoriesTitle}</h2>
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {PLACE_CATEGORIES.map((category) => {
            const pin = CATEGORY_PIN[category];
            return (
              <li key={category}>
                <Link href={`/places?category=${category}`} className="block rounded-card">
                  <Card interactive className="flex items-center gap-3 p-4">
                    <span
                      className="grid size-10 shrink-0 place-items-center rounded-full text-lg"
                      style={{ backgroundColor: `${pin.color}1a` }}
                      aria-hidden="true"
                    >
                      {pin.emoji}
                    </span>
                    <span className="font-medium">{dict.categories[category]}</span>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Not a Card: this one carries its own tint, and Card's own background would be
          competing with it for the same Tailwind property. */}
      <section className="mx-auto max-w-5xl px-5 pb-16 sm:px-6">
        <div className="flex flex-col gap-4 rounded-card border border-gold/20 bg-gold-soft/70 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">{t.coldStartTitle}</h2>
            <p className="mt-1 max-w-[52ch] text-sm text-muted">{t.coldStartBody}</p>
          </div>
          <Link href="/places/new" className={buttonClasses("primary", "md", "shrink-0")}>
            {t.addCta}
          </Link>
        </div>
      </section>
    </main>
  );
}
