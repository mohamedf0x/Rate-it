import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary, tierLabel } from "@/lib/i18n/dictionaries";
import { PLACE_CATEGORIES, type PlaceCategoryValue } from "@/lib/places";
import type { MapPlace } from "@/lib/map";
import StarRating from "@/components/StarRating";
import PlacesMap from "@/components/map/PlacesMap";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import CategoryIcon from "@/components/ui/CategoryIcon";
import { buttonClasses } from "@/components/ui/Button";
import { inputClasses } from "@/components/ui/form";

function isCategory(value: string | undefined): value is PlaceCategoryValue {
  return !!value && (PLACE_CATEGORIES as readonly string[]).includes(value);
}

export default async function BrowsePlacesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const [locale, { q, category }] = await Promise.all([
    getLocale(),
    searchParams,
  ]);
  const dict = getDictionary(locale);
  const t = dict.places;

  const places = await prisma.place.findMany({
    where: {
      ...(isCategory(category) ? { category } : {}),
      ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
    },
    orderBy: [{ qualityScore: "desc" }, { createdAt: "desc" }],
    take: 50,
    include: { rankTier: true },
  });

  const mapPlaces: MapPlace[] = places
    .filter((place) => place.lat !== null && place.lng !== null)
    .map((place) => ({
      id: place.id,
      slug: place.slug,
      name: place.name,
      category: place.category,
      lat: place.lat!,
      lng: place.lng!,
      avgRating: place.avgRating,
      reviewCount: place.reviewCount,
    }));

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            {t.browseTitle}
          </h1>
          <p className="mt-1.5 text-sm text-muted">{t.browseSubtitle}</p>
        </div>
        <Link href="/places/new" className={buttonClasses("primary")}>
          {t.addPlace}
        </Link>
      </div>

      <form className="mt-6 flex flex-wrap gap-2.5">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder={t.searchPlaceholder}
          className={`min-w-48 flex-1 ${inputClasses}`}
        />
        <select
          name="category"
          defaultValue={category ?? ""}
          className={`w-auto ${inputClasses}`}
        >
          <option value="">{t.allCategories}</option>
          {PLACE_CATEGORIES.map((value) => (
            <option key={value} value={value}>
              {dict.categories[value]}
            </option>
          ))}
        </select>
        <button type="submit" className={buttonClasses("secondary")}>
          {t.search}
        </button>
      </form>

      <section className="mt-6">
        {mapPlaces.length === 0 ? (
          <Card className="px-5 py-4 text-sm text-muted">
            {dict.map.noPlacesWithLocation}
          </Card>
        ) : (
          <PlacesMap locale={locale} places={mapPlaces} />
        )}
      </section>

      {places.length === 0 ? (
        <Card className="mt-6 flex flex-col items-start gap-4 p-8 text-center sm:items-center">
          <span
            className="grid size-12 place-items-center rounded-full bg-brand-soft text-xl"
            aria-hidden="true"
          >
            📍
          </span>
          <p className="max-w-[40ch] text-sm text-muted sm:text-center">
            {t.empty}
          </p>
          <Link href="/places/new" className={buttonClasses("primary")}>
            {t.addPlace}
          </Link>
        </Card>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {places.map((place) => (
            <li key={place.id}>
              <Link
                href={`/places/${place.slug}`}
                className="block rounded-card"
              >
                <Card interactive className="h-full p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <CategoryIcon category={place.category} />
                      <div className="min-w-0">
                        <h2 className="truncate font-display font-semibold">
                          {place.name}
                        </h2>
                        <p className="mt-0.5 truncate text-xs text-muted">
                          {dict.categories[place.category]}
                          {place.city ? ` · ${place.city}` : ""}
                        </p>
                      </div>
                    </div>
                    {place.rankTier ? (
                      <Badge tone="tier" className="shrink-0">
                        {tierLabel(locale, place.rankTier.name)}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="mt-3">
                    {place.reviewCount > 0 ? (
                      <StarRating
                        value={place.avgRating}
                        count={place.reviewCount}
                      />
                    ) : (
                      <span className="text-sm text-muted">{t.noRating}</span>
                    )}
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
