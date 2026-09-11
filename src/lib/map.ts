import type { PlaceCategoryValue } from "@/lib/places";

/** Cairo — the fallback view when nothing on screen has coordinates yet. */
export const DEFAULT_CENTER: [number, number] = [30.0444, 31.2357];
export const DEFAULT_ZOOM = 11;

// Tiles are fetched by the visitor's browser, so they cost the server nothing. Point these at
// another provider if OpenStreetMap's public tiles get rate limited.
export const TILE_URL =
  process.env.NEXT_PUBLIC_MAP_TILE_URL ?? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const TILE_ATTRIBUTION =
  process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION ??
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

export const CATEGORY_PIN: Record<PlaceCategoryValue, { emoji: string; color: string }> = {
  RESTAURANT: { emoji: "🍽️", color: "#ea580c" },
  SHOP: { emoji: "🛍️", color: "#7c3aed" },
  PHARMACY: { emoji: "💊", color: "#059669" },
  GAMING_ZONE: { emoji: "🎮", color: "#2563eb" },
  PADEL_COURT: { emoji: "🎾", color: "#ca8a04" },
  FOOTBALL_COURT: { emoji: "⚽", color: "#16a34a" },
  OTHER: { emoji: "📍", color: "#525252" },
};

export type MapPlace = {
  id: string;
  slug: string;
  name: string;
  category: PlaceCategoryValue;
  lat: number;
  lng: number;
  avgRating: number;
  reviewCount: number;
};
