"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { PLACE_CATEGORIES, type PlaceCategoryValue } from "@/lib/places";
import LocationPicker from "@/components/map/LocationPicker";

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
    <main className="mx-auto max-w-lg px-6 py-12">
      <h1 className="text-2xl font-bold tracking-tight">{isEdit ? t.editTitle : t.createTitle}</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
            {t.name}
          </label>
          <input
            id="name"
            required
            minLength={2}
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-neutral-700">
            {t.category}
          </label>
          <select
            id="category"
            value={values.category}
            onChange={(e) => update("category", e.target.value as PlaceCategoryValue)}
            className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          >
            {PLACE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {dict.categories[category]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-neutral-700">
            {t.description}
          </label>
          <textarea
            id="description"
            rows={3}
            value={values.description}
            onChange={(e) => update("description", e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-neutral-700">
              {t.city}
            </label>
            <input
              id="city"
              value={values.city}
              onChange={(e) => update("city", e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-neutral-700">
              {t.phone}
            </label>
            <input
              id="phone"
              dir="ltr"
              value={values.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-neutral-700">
            {t.address}
          </label>
          <input
            id="address"
            value={values.address}
            onChange={(e) => update("address", e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-neutral-700">
            {t.website}
          </label>
          <input
            id="website"
            type="url"
            dir="ltr"
            placeholder="https://"
            value={values.website}
            onChange={(e) => update("website", e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          />
        </div>
        <div>
          <span className="block text-sm font-medium text-neutral-700">{mapT.pickLocation}</span>
          <p className="mt-1 text-xs text-neutral-500">{mapT.pickHint}</p>
          <div className="mt-2">
            <LocationPicker
              locale={locale}
              lat={values.lat}
              lng={values.lng}
              onChange={(lat, lng) => setValues((current) => ({ ...current, lat, lng }))}
            />
          </div>
          {values.lat !== null && values.lng !== null ? (
            <div className="mt-2 flex items-center gap-3 text-xs text-neutral-500">
              <span dir="ltr">
                {values.lat.toFixed(5)}, {values.lng.toFixed(5)}
              </span>
              <button
                type="button"
                onClick={() => setValues((current) => ({ ...current, lat: null, lng: null }))}
                className="underline hover:text-neutral-900"
              >
                {mapT.clearLocation}
              </button>
            </div>
          ) : null}
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {loading ? t.submitting : isEdit ? t.submitEdit : t.submitCreate}
        </button>
      </form>
    </main>
  );
}
