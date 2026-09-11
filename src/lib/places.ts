import { z } from "zod";
import type { CurrentUser } from "@/lib/session";

export const PLACE_CATEGORIES = [
  "RESTAURANT",
  "SHOP",
  "PHARMACY",
  "GAMING_ZONE",
  "PADEL_COURT",
  "FOOTBALL_COURT",
  "OTHER",
] as const;

export type PlaceCategoryValue = (typeof PLACE_CATEGORIES)[number];

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : null));

export const placeCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  category: z.enum(PLACE_CATEGORIES),
  description: optionalText(2000),
  address: optionalText(300),
  city: optionalText(80),
  phone: optionalText(40),
  website: z
    .string()
    .trim()
    .url()
    .max(300)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null)),
  lat: z.coerce.number().min(-90).max(90).nullable().optional(),
  lng: z.coerce.number().min(-180).max(180).nullable().optional(),
});

export const placeUpdateSchema = placeCreateSchema.partial();

export const productCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: optionalText(1000),
  category: optionalText(60),
});

export const productUpdateSchema = productCreateSchema.partial();

/** Unclaimed places are community-editable; a claimed one only by its owner (or an admin). */
export function canEditPlace(user: CurrentUser, place: { ownerId: string | null }): boolean {
  if (user.role === "ADMIN") return true;
  return place.ownerId === null || place.ownerId === user.id;
}
