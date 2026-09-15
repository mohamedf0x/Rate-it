import type { PlaceCategoryValue } from "@/lib/places";

/** Cairo — the fallback view when nothing on screen has coordinates yet. */
export const DEFAULT_CENTER: [number, number] = [30.0444, 31.2357];
export const DEFAULT_ZOOM = 11;

// Tiles are fetched by the visitor's browser, so they cost the server nothing. Point these at
// another provider if the public tiles get rate limited.
//
// There are two tilesets because a light map on a dark page is the brightest thing on screen.
// The alternative — a CSS filter over one tileset — would invert the pins along with the map,
// dragging the --cat-* category colours with it, so the swap happens at the source instead.
export type Tileset = { url: string; attribution: string };

export const TILE_LIGHT: Tileset = {
  url: process.env.NEXT_PUBLIC_MAP_TILE_URL ?? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION ??
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
};

export const TILE_DARK: Tileset = {
  url:
    process.env.NEXT_PUBLIC_MAP_TILE_URL_DARK ??
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  attribution:
    process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION_DARK ??
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
};

// Pin colours mirror the --cat-* tokens in globals.css (light values), so a category is the
// same colour on the map as it is on its icon. Leaflet needs a plain string, which is why
// these are hex here rather than read from the stylesheet.
export const CATEGORY_PIN: Record<PlaceCategoryValue, { color: string }> = {
  RESTAURANT: { color: "#b4531b" },
  SHOP: { color: "#6d3d9b" },
  PHARMACY: { color: "#1f7a54" },
  GAMING_ZONE: { color: "#3a4fa8" },
  PADEL_COURT: { color: "#96701a" },
  FOOTBALL_COURT: { color: "#3f7a38" },
  OTHER: { color: "#556662" },
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
