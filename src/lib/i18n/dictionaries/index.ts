import type { Locale } from "@/lib/i18n/config";
import ar from "./ar";
import en from "./en";

const dictionaries = { ar, en };

/** Pure lookup — safe to call from both server and client components. */
export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
