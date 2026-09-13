"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { DEFAULT_CENTER, DEFAULT_ZOOM } from "@/lib/map";
import { useTileset } from "@/components/map/useTileset";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

const pinIcon = L.divIcon({
  className: "",
  html: `<div style="background:rgb(var(--brand));width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 1px 4px rgba(0,0,0,.4);border:2px solid rgb(var(--surface))"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

function ClickToPlace({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

function LocateButton({
  label,
  onPick,
}: {
  label: string;
  onPick: (lat: number, lng: number) => void;
}) {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  function locate() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onPick(latitude, longitude);
        map.setView([latitude, longitude], 16);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  // Pinned physically right, not to the text-direction end: Leaflet's zoom control is always
  // top-left, so a flipping offset would collide with it in RTL.
  return (
    <button
      type="button"
      onClick={locate}
      disabled={locating}
      className="absolute right-3 top-3 z-[1000] rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink shadow-sm transition-colors hover:border-border-strong disabled:opacity-50"
    >
      {label}
    </button>
  );
}

export default function LocationPickerView({
  locale,
  lat,
  lng,
  onChange,
}: {
  locale: Locale;
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}) {
  const t = getDictionary(locale).map;
  const tiles = useTileset();
  const hasPin = lat !== null && lng !== null;

  return (
    <div className="relative">
      <MapContainer
        center={hasPin ? [lat, lng] : DEFAULT_CENTER}
        zoom={hasPin ? 16 : DEFAULT_ZOOM}
        scrollWheelZoom
        style={{ height: "300px", width: "100%" }}
        className="rounded-card border border-border"
      >
        <TileLayer key={tiles.url} attribution={tiles.attribution} url={tiles.url} />
        <ClickToPlace onPick={onChange} />
        <LocateButton label={t.useMyLocation} onPick={onChange} />
        {hasPin ? (
          <Marker
            position={[lat, lng]}
            icon={pinIcon}
            draggable
            eventHandlers={{
              dragend: (event) => {
                const position = event.target.getLatLng();
                onChange(position.lat, position.lng);
              },
            }}
          />
        ) : null}
      </MapContainer>
    </div>
  );
}
