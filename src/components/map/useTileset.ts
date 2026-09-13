"use client";

import { useSyncExternalStore } from "react";
import { TILE_DARK, TILE_LIGHT, type Tileset } from "@/lib/map";

/**
 * Picks the tileset from the viewer's colour scheme. This has to happen in JS rather than
 * CSS: the tile URL is a prop Leaflet fetches from, not something a stylesheet can reach.
 *
 * prefers-color-scheme is an external store, so it is subscribed to rather than mirrored
 * into state from an effect — that keeps the value correct on the very first paint and
 * re-renders when the viewer switches theme with the map already open.
 */
const QUERY = "(prefers-color-scheme: dark)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

/** These views are loaded with ssr:false, so this is only a formality for the hook's contract. */
function getServerSnapshot() {
  return false;
}

export function useTileset(): Tileset {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return dark ? TILE_DARK : TILE_LIGHT;
}
