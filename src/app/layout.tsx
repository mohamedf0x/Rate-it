import type { Metadata } from "next";
import { Readex_Pro, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { dirForLocale } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";

// Both faces cover Arabic and Latin with the same voice, so nothing is a Latin font with an
// Arabic fallback bolted on. next/font self-hosts them — no request to Google at runtime.
const display = Readex_Pro({
  subsets: ["arabic", "latin"],
  variable: "--font-display",
  display: "swap",
});

const body = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

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
    <html
      lang={locale}
      dir={dirForLocale(locale)}
      className={`${display.variable} ${body.variable}`}
    >
      <body className="min-h-screen font-sans">
        <Header />
        {children}
      </body>
    </html>
  );
}
