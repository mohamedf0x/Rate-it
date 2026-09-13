"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { PLACE_CATEGORIES, type PlaceCategoryValue } from "@/lib/places";
import LocationPicker from "@/components/map/LocationPicker";
import { buttonClasses } from "@/components/ui/Button";
import CategoryIcon from "@/components/ui/CategoryIcon";
import { errorClasses, inputClasses, labelClasses } from "@/components/ui/form";

export type PlaceFormValues = {
  name: string;
  category: PlaceCategoryValue;
  description: string;
  address: string;
  city: string;
  phone: string;
  website: string;
  lat: number | null;
  lng: number | null;
};

const emptyValues: PlaceFormValues = {
  name: "",
  category: "RESTAURANT",
  description: "",
  address: "",
  city: "",
  phone: "",
  website: "",
  lat: null,
  lng: null,
};

export default function PlaceForm({
  locale,
  slug,
  initialValues,
}: {
  locale: Locale;
  slug?: string;
  initialValues?: PlaceFormValues;
}) {
  const router = useRouter();
  const dict = getDictionary(locale);
  const t = dict.places.form;
  const mapT = dict.map;
  const isEdit = Boolean(slug);

  const [values, setValues] = useState<PlaceFormValues>(initialValues ?? emptyValues);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof PlaceFormValues>(key: K, value: PlaceFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(isEdit ? `/api/places/${slug}` : "/api/places", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? t.genericError);
        return;
      }
      router.push(`/places/${data.place.slug}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg px-5 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold">{isEdit ? t.editTitle : t.createTitle}</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className={labelClasses}>
            {t.name}
          </label>
          <input
            id="name"
            required
            minLength={2}
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            className={`mt-1 ${inputClasses}`}
          />
        </div>
        <div>
          <label htmlFor="category" className={labelClasses}>
            {t.category}
          </label>
          {/* A native <option> cannot hold an SVG, so the icon sits beside the select and
              follows the selection rather than being repeated down the list. Keeping the
              native control preserves its keyboard and mobile behaviour. */}
          <div className="mt-1 flex items-center gap-2.5">
            <CategoryIcon category={values.category} size="lg" />
            <select
              id="category"
              value={values.category}
              onChange={(e) => update("category", e.target.value as PlaceCategoryValue)}
              className={inputClasses}
            >
              {PLACE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {dict.categories[category]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="description" className={labelClasses}>
            {t.description}
          </label>
          <textarea
            id="description"
            rows={3}
            value={values.description}
            onChange={(e) => update("description", e.target.value)}
            className={`mt-1 ${inputClasses}`}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="city" className={labelClasses}>
              {t.city}
            </label>
            <input
              id="city"
              value={values.city}
              onChange={(e) => update("city", e.target.value)}
              className={`mt-1 ${inputClasses}`}
            />
          </div>
          <div>
            <label htmlFor="phone" className={labelClasses}>
              {t.phone}
            </label>
            <input
              id="phone"
              dir="ltr"
              value={values.phone}
              onChange={(e) => update("phone", e.target.value)}
              className={`mt-1 ${inputClasses}`}
            />
          </div>
        </div>
        <div>
          <label htmlFor="address" className={labelClasses}>
            {t.address}
          </label>
          <input
            id="address"
            value={values.address}
            onChange={(e) => update("address", e.target.value)}
            className={`mt-1 ${inputClasses}`}
          />
        </div>
        <div>
          <label htmlFor="website" className={labelClasses}>
            {t.website}
          </label>
          <input
            id="website"
            type="url"
            dir="ltr"
            placeholder="https://"
            value={values.website}
            onChange={(e) => update("website", e.target.value)}
            className={`mt-1 ${inputClasses}`}
          />
        </div>
        <div>
          <span className={labelClasses}>{mapT.pickLocation}</span>
          <p className="mt-1 text-xs text-muted">{mapT.pickHint}</p>
          <div className="mt-2">
            <LocationPicker
              locale={locale}
              lat={values.lat}
              lng={values.lng}
              onChange={(lat, lng) => setValues((current) => ({ ...current, lat, lng }))}
            />
          </div>
          {values.lat !== null && values.lng !== null ? (
            <div className="mt-2 flex items-center gap-3 text-xs text-muted">
              <span dir="ltr">
                {values.lat.toFixed(5)}, {values.lng.toFixed(5)}
              </span>
              <button
                type="button"
                onClick={() => setValues((current) => ({ ...current, lat: null, lng: null }))}
                className="underline hover:text-ink"
              >
                {mapT.clearLocation}
              </button>
            </div>
          ) : null}
        </div>

        {error ? <p className={errorClasses}>{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className={buttonClasses("primary", "md", "w-full")}
        >
          {loading ? t.submitting : isEdit ? t.submitEdit : t.submitCreate}
        </button>
      </form>
    </main>
  );
}
