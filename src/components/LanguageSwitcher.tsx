"use client";

import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const next: Locale = locale === "ar" ? "en" : "ar";

  function switchLocale() {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
    router.refresh();
  }

  return (
    <button
      onClick={switchLocale}
      aria-label={next === "ar" ? "التبديل إلى العربية" : "Switch to English"}
      className="rounded-md border border-border px-2 py-1 text-xs font-medium text-muted transition-colors hover:border-border-strong hover:text-ink"
    >
      {next === "ar" ? "العربية" : "English"}
    </button>
  );
}
