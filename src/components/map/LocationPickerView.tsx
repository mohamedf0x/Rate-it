"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { DEFAULT_CENTER, DEFAULT_ZOOM, TILE_ATTRIBUTION, TILE_URL } from "@/lib/map";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

const pinIcon = L.divIcon({
  className: "",
  html: `<div style="background:#171717;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 1px 4px rgba(0,0,0,.4);border:2px solid #fff"></div>`,
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
      className="absolute right-3 top-3 z-[1000] rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm hover:border-neutral-400 disabled:opacity-50"
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
  const hasPin = lat !== null && lng !== null;

  return (
    <div className="relative">
      <MapContainer
        center={hasPin ? [lat, lng] : DEFAULT_CENTER}
        zoom={hasPin ? 16 : DEFAULT_ZOOM}
        scrollWheelZoom
        style={{ height: "300px", width: "100%" }}
        className="rounded-lg border border-neutral-200"
      >
        <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />
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
