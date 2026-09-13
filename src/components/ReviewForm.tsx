"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import Card from "@/components/ui/Card";
import { buttonClasses } from "@/components/ui/Button";
import { errorClasses, inputClasses, labelClasses } from "@/components/ui/form";

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
    <Card as="form" onSubmit={handleSubmit} className="mt-4 p-4">
      <p className="font-display font-semibold">{t.writeTitle}</p>

      <div className="mt-3">
        <span className={labelClasses}>{t.ratingLabel}</span>
        <div className="mt-1 flex gap-1" dir="ltr">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-label={`${value}`}
              aria-pressed={rating === value}
              className={`text-2xl leading-none transition-transform hover:scale-110 ${value <= rating ? "text-gold" : "text-border-strong"}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3">
        <label htmlFor="review-title" className={labelClasses}>
          {t.reviewTitleLabel}
        </label>
        <input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`mt-1 ${inputClasses}`}
        />
      </div>

      <div className="mt-3">
        <label htmlFor="review-body" className={labelClasses}>
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
          className={`mt-1 ${inputClasses}`}
        />
      </div>

      {error ? <p className={`mt-2 ${errorClasses}`}>{error}</p> : null}

      <button
        type="submit"
        disabled={loading || rating === 0}
        className={buttonClasses("primary", "md", "mt-3")}
      >
        {loading ? t.submitting : t.submit}
      </button>
    </Card>
  );
}
