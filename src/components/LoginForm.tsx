"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { buttonClasses } from "@/components/ui/Button";
import { errorClasses, inputClasses, labelClasses } from "@/components/ui/form";

export default function LoginForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const t = getDictionary(locale).auth.login;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? t.genericError);
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-sm px-5 py-14 sm:px-6">
      <h1 className="font-display text-2xl font-bold">{t.title}</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className={labelClasses}>
            {t.email}
          </label>
          <input
            id="email"
            type="email"
            required
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`mt-1 ${inputClasses}`}
          />
        </div>
        <div>
          <label htmlFor="password" className={labelClasses}>
            {t.password}
          </label>
          <input
            id="password"
            type="password"
            required
            dir="ltr"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`mt-1 ${inputClasses}`}
          />
        </div>
        {error ? <p className={errorClasses}>{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className={buttonClasses("primary", "md", "w-full")}
        >
          {loading ? t.submitting : t.submit}
        </button>
      </form>
      <p className="mt-4 text-sm text-muted">
        {t.noAccount}{" "}
        <Link href="/signup" className="font-medium text-brand underline underline-offset-2">
          {t.signupLink}
        </Link>
      </p>
    </main>
  );
}
