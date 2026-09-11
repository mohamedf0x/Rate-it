"use client";

import dynamic from "next/dynamic";
import type { MapPlace } from "@/lib/map";
import type { Locale } from "@/lib/i18n/config";

// Leaflet touches `window` on import, so the map only ever loads in the browser.
const PlacesMapView = dynamic(() => import("@/components/map/PlacesMapView"), {
  ssr: false,
  loading: () => <div className="h-[420px] w-full animate-pulse rounded-lg bg-neutral-200" />,
});

export default function PlacesMap(props: { locale: Locale; places: MapPlace[]; height?: string }) {
  return <PlacesMapView {...props} />;
}
