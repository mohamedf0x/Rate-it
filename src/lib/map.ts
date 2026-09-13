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

// Pin colours mirror the --cat-* tokens in globals.css (light values), so a category is the
// same colour on the map as it is on its icon. Leaflet needs a plain string, which is why
// these are hex here rather than read from the stylesheet.
export const CATEGORY_PIN: Record<PlaceCategoryValue, { emoji: string; color: string }> = {
  RESTAURANT: { emoji: "🍽️", color: "#b4531b" },
  SHOP: { emoji: "🛍️", color: "#6d3d9b" },
  PHARMACY: { emoji: "💊", color: "#1f7a54" },
  GAMING_ZONE: { emoji: "🎮", color: "#3a4fa8" },
  PADEL_COURT: { emoji: "🎾", color: "#96701a" },
  FOOTBALL_COURT: { emoji: "⚽", color: "#3f7a38" },
  OTHER: { emoji: "📍", color: "#556662" },
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
