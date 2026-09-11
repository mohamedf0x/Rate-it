import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function HomePage() {
  const locale = await getLocale();
  const t = getDictionary(locale).home;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
      <p className="mt-3 text-neutral-600">{t.subtitle}</p>
    </main>
  );
}
