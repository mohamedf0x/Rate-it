"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

export default function LogoutButton({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const t = getDictionary(locale).header;

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="text-neutral-500 hover:text-neutral-900 disabled:opacity-50"
    >
      {t.logout}
    </button>
  );
}
