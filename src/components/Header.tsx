import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import LogoutButton from "@/components/LogoutButton";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default async function Header() {
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale()]);
  const t = getDictionary(locale).header;

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Rate It
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/places" className="text-neutral-600 hover:text-neutral-900">
            {t.browse}
          </Link>
          {user ? (
            <>
              <Link href={`/u/${user.username}`} className="font-medium text-neutral-900">
                {user.displayName}
                {user.stats ? (
                  <span className="text-xs font-normal text-neutral-500">
                    {" "}
                    · {user.stats.xp} {t.xp}
                  </span>
                ) : null}
              </Link>
              <LogoutButton locale={locale} />
            </>
          ) : (
            <>
              <Link href="/login" className="text-neutral-600 hover:text-neutral-900">
                {t.login}
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-neutral-900 px-3 py-1.5 font-medium text-white hover:bg-neutral-700"
              >
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
