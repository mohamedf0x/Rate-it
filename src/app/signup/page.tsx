import SignupForm from "@/components/SignupForm";
import { getLocale } from "@/lib/i18n/locale";

export default async function SignupPage() {
  const locale = await getLocale();
  return <SignupForm locale={locale} />;
}
