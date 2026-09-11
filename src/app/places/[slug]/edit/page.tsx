import { notFound, redirect } from "next/navigation";
import PlaceForm, { type PlaceFormValues } from "@/components/PlaceForm";
import { getLocale } from "@/lib/i18n/locale";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { canEditPlace } from "@/lib/places";
import { decodeSlug } from "@/lib/slug";

export default async function EditPlacePage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = decodeSlug((await params).slug);
  const [locale, user] = await Promise.all([getLocale(), getCurrentUser()]);
  if (!user) redirect("/login");

  const place = await prisma.place.findUnique({ where: { slug } });
  if (!place) notFound();
  if (!canEditPlace(user, place)) redirect(`/places/${slug}`);

  const initialValues: PlaceFormValues = {
    name: place.name,
    category: place.category,
    description: place.description ?? "",
    address: place.address ?? "",
    city: place.city ?? "",
    phone: place.phone ?? "",
    website: place.website ?? "",
    lat: place.lat,
    lng: place.lng,
  };

  return <PlaceForm locale={locale} slug={slug} initialValues={initialValues} />;
}
