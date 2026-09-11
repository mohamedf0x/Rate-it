import type { Locale } from "@/lib/i18n/config";
import ar from "./ar";
import en from "./en";

const dictionaries = { ar, en };

/** Pure lookup — safe to call from both server and client components. */
export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

/** Tiers are DB rows an admin can add to, so fall back to the stored name. */
export function tierLabel(locale: Locale, name: string): string {
  const tiers: Record<string, string> = dictionaries[locale].tiers;
  return tiers[name] ?? name;
}

/** Same for badges, which are looked up by their catalog code. */
export function badgeLabel(locale: Locale, code: string, fallback: string): string {
  const badges: Record<string, string> = dictionaries[locale].badges;
  return badges[code] ?? fallback;
}
