import { redirect } from "next/navigation";
import PlaceForm from "@/components/PlaceForm";
import { getLocale } from "@/lib/i18n/locale";
import { getCurrentUser } from "@/lib/session";

export default async function NewPlacePage() {
  const [locale, user] = await Promise.all([getLocale(), getCurrentUser()]);
  if (!user) redirect("/login");

  return <PlaceForm locale={locale} />;
}
