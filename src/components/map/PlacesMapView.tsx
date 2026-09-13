"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { CATEGORY_PIN, DEFAULT_CENTER, DEFAULT_ZOOM, type MapPlace } from "@/lib/map";
import { useTileset } from "@/components/map/useTileset";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

/** Leaflet's default marker images break under bundlers, so pins are inline markup instead. */
function pinIcon(category: MapPlace["category"]) {
  const { emoji, color } = CATEGORY_PIN[category];
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,.4);border:2px solid rgb(var(--surface))">
             <span style="transform:rotate(45deg);font-size:14px;line-height:1">${emoji}</span>
           </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
}

/** Keeps every pin in view when the set of places changes (filters, new place added). */
function FitToPlaces({ places }: { places: MapPlace[] }) {
  const map = useMap();

  useEffect(() => {
    if (places.length === 0) return;
    if (places.length === 1) {
      map.setView([places[0].lat, places[0].lng], 15);
      return;
    }
    map.fitBounds(L.latLngBounds(places.map((place) => [place.lat, place.lng])), {
      padding: [40, 40],
      maxZoom: 16,
    });
  }, [map, places]);

  return null;
}

export default function PlacesMapView({
  locale,
  places,
  height = "420px",
}: {
  locale: Locale;
  places: MapPlace[];
  height?: string;
}) {
  const dict = getDictionary(locale);
  const tiles = useTileset();

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom
      style={{ height, width: "100%" }}
      className="rounded-card border border-border"
    >
      {/* Keyed so a theme change swaps the tileset instead of leaving stale tiles. */}
      <TileLayer key={tiles.url} attribution={tiles.attribution} url={tiles.url} />
      <FitToPlaces places={places} />
      {places.map((place) => (
        <Marker key={place.id} position={[place.lat, place.lng]} icon={pinIcon(place.category)}>
          <Popup>
            <span className="block font-semibold">{place.name}</span>
            <span className="block text-xs text-muted">{dict.categories[place.category]}</span>
            <span className="block text-xs">
              {place.reviewCount > 0
                ? `★ ${place.avgRating.toFixed(1)} (${place.reviewCount})`
                : dict.places.noRating}
            </span>
            <Link href={`/places/${place.slug}`} className="mt-1 block text-brand underline underline-offset-2">
              {dict.map.openPlace}
            </Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
