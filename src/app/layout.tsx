import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { dirForLocale } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: "Rate It",
    description: getDictionary(locale).home.subtitle,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    <html lang={locale} dir={dirForLocale(locale)}>
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        <Header />
        {children}
      </body>
    </html>
  );
}
