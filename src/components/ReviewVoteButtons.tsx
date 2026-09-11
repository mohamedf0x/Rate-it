"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

export default function ReviewVoteButtons({
  locale,
  reviewId,
  helpfulCount,
  unhelpfulCount,
  myVote,
}: {
  locale: Locale;
  reviewId: string;
  helpfulCount: number;
  unhelpfulCount: number;
  myVote: "HELPFUL" | "UNHELPFUL" | null;
}) {
  const router = useRouter();
  const t = getDictionary(locale).reviews;
  const [loading, setLoading] = useState(false);

  async function vote(type: "HELPFUL" | "UNHELPFUL") {
    setLoading(true);
    try {
      await fetch(`/api/reviews/${reviewId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const buttonClass = (active: boolean) =>
    `rounded-md border px-2 py-1 text-xs ${
      active
        ? "border-neutral-900 bg-neutral-900 text-white"
        : "border-neutral-300 text-neutral-600 hover:border-neutral-400"
    } disabled:opacity-50`;

  return (
    <div className="mt-3 flex gap-2">
      <button
        type="button"
        disabled={loading}
        onClick={() => vote("HELPFUL")}
        className={buttonClass(myVote === "HELPFUL")}
      >
        {t.helpful} {helpfulCount > 0 ? `(${helpfulCount})` : ""}
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => vote("UNHELPFUL")}
        className={buttonClass(myVote === "UNHELPFUL")}
      >
        {t.unhelpful} {unhelpfulCount > 0 ? `(${unhelpfulCount})` : ""}
      </button>
    </div>
  );
}
