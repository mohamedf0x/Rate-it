"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

type Target = { placeId: string } | { productId: string } | { skillListingId: string };

export default function ReviewForm({ locale, target }: { locale: Locale; target: Target }) {
  const router = useRouter();
  const t = getDictionary(locale).reviews;
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...target, rating, title, body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? t.genericError);
        return;
      }
      setRating(0);
      setTitle("");
      setBody("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 rounded-lg border border-neutral-200 bg-white p-4">
      <p className="font-medium text-neutral-900">{t.writeTitle}</p>

      <div className="mt-3">
        <span className="block text-sm font-medium text-neutral-700">{t.ratingLabel}</span>
        <div className="mt-1 flex gap-1" dir="ltr">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-label={`${value}`}
              aria-pressed={rating === value}
              className={`text-2xl leading-none ${value <= rating ? "text-amber-500" : "text-neutral-300"} hover:text-amber-400`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3">
        <label htmlFor="review-title" className="block text-sm font-medium text-neutral-700">
          {t.reviewTitleLabel}
        </label>
        <input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
      </div>

      <div className="mt-3">
        <label htmlFor="review-body" className="block text-sm font-medium text-neutral-700">
          {t.bodyLabel}
        </label>
        <textarea
          id="review-body"
          required
          minLength={10}
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t.bodyPlaceholder}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
      </div>

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={loading || rating === 0}
        className="mt-3 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        {loading ? t.submitting : t.submit}
      </button>
    </form>
  );
}
