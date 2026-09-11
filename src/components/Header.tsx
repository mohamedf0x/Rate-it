import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import LogoutButton from "@/components/LogoutButton";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { buttonClasses } from "@/components/ui/Button";

export default async function Header() {
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale()]);
  const t = getDictionary(locale).header;

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-3 sm:px-6">
        <Link href="/" className="shrink-0 whitespace-nowrap font-display text-lg font-bold">
          Rate It
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/places"
            className="whitespace-nowrap text-muted transition-colors hover:text-ink"
          >
            {t.browse}
          </Link>
          {user ? (
            <>
              <Link
                href={`/u/${user.username}`}
                className="flex items-center gap-1.5 font-medium transition-colors hover:text-brand"
              >
                <span className="max-w-28 truncate">{user.displayName}</span>
                {user.stats ? (
                  <span className="rounded-md bg-gold-soft px-1.5 py-0.5 text-xs font-semibold tabular-nums text-gold">
                    {user.stats.xp} {t.xp}
                  </span>
                ) : null}
              </Link>
              <LogoutButton locale={locale} />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="whitespace-nowrap text-muted transition-colors hover:text-ink"
              >
                {t.login}
              </Link>
              <Link href="/signup" className={buttonClasses("primary", "sm")}>
                {t.signup}
              </Link>
            </>
          )}
          <LanguageSwitcher locale={locale} />
        </nav>
      </div>
    </header>
  );
}
