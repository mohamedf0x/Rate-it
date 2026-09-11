import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary, tierLabel } from "@/lib/i18n/dictionaries";
import { PLACE_CATEGORIES, type PlaceCategoryValue } from "@/lib/places";
import StarRating from "@/components/StarRating";

function isCategory(value: string | undefined): value is PlaceCategoryValue {
  return !!value && (PLACE_CATEGORIES as readonly string[]).includes(value);
}

export default async function BrowsePlacesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const [locale, { q, category }] = await Promise.all([getLocale(), searchParams]);
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

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.browseTitle}</h1>
          <p className="mt-1 text-sm text-neutral-600">{t.browseSubtitle}</p>
        </div>
        <Link
          href="/places/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          {t.addPlace}
        </Link>
      </div>

      <form className="mt-6 flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder={t.searchPlaceholder}
          className="min-w-48 flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
        <select
          name="category"
          defaultValue={category ?? ""}
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        >
          <option value="">{t.allCategories}</option>
          {PLACE_CATEGORIES.map((value) => (
            <option key={value} value={value}>
              {dict.categories[value]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:border-neutral-400"
        >
          {t.search}
        </button>
      </form>

      {places.length === 0 ? (
        <p className="mt-10 text-sm text-neutral-500">{t.empty}</p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {places.map((place) => (
            <li key={place.id} className="rounded-lg border border-neutral-200 bg-white p-4">
              <Link href={`/places/${place.slug}`} className="block">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold text-neutral-900">{place.name}</h2>
                  {place.rankTier ? (
                    <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                      {tierLabel(locale, place.rankTier.name)}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  {dict.categories[place.category]}
                  {place.city ? ` · ${place.city}` : ""}
                </p>
                <div className="mt-2">
                  {place.reviewCount > 0 ? (
                    <StarRating value={place.avgRating} count={place.reviewCount} />
                  ) : (
                    <span className="text-sm text-neutral-400">{t.noRating}</span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
