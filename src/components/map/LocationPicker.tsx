"use client";

import dynamic from "next/dynamic";
import type { Locale } from "@/lib/i18n/config";

const LocationPickerView = dynamic(() => import("@/components/map/LocationPickerView"), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse rounded-lg bg-neutral-200" />,
});

export default function LocationPicker(props: {
  locale: Locale;
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}) {
  return <LocationPickerView {...props} />;
}
