"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { buttonClasses } from "@/components/ui/Button";
import { errorClasses, inputClasses } from "@/components/ui/form";

export default function AddProductForm({ locale, slug }: { locale: Locale; slug: string }) {
  const router = useRouter();
  const t = getDictionary(locale).places.detail;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/places/${slug}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Error");
        return;
      }
      setName("");
      setDescription("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 rounded-card border border-dashed border-border-strong p-4">
      <p className="text-sm font-medium">{t.addProduct}</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.productName}
          className={`min-w-48 flex-1 ${inputClasses}`}
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t.productDescription}
          className={`min-w-48 flex-1 ${inputClasses}`}
        />
        <button
          type="submit"
          disabled={loading}
          className={buttonClasses("primary")}
        >
          {t.submitProduct}
        </button>
      </div>
      {error ? <p className={`mt-2 ${errorClasses}`}>{error}</p> : null}
    </form>
  );
}
