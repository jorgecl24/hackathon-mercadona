import { useMemo } from "react";

import { MERCADONA_STORES } from "../data/stores";
import { estimateTravelMin, haversineKm } from "../geo";
import { closesAtToday } from "../openingHours";
import type { Availability, LatLng, MercadonaStore, StoreStock } from "../types";

/** Hash FNV-1a estable: misma clave -> mismo resultado entre sesiones. */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Reparto aproximado: 65 % ok, 20 % low, 10 % out, 5 % unknown. */
function deriveAvailability(storeId: string, query: string): Availability {
  const n = hash(`${storeId}:${query}`) % 100;
  if (n < 65) return "ok";
  if (n < 85) return "low";
  if (n < 95) return "out";
  return "unknown";
}

const AISLES = ["Pasillo 2", "Pasillo 4", "Pasillo 6", "Pasillo 8"] as const;

function enrich(store: MercadonaStore, pos: LatLng, query: string): StoreStock {
  const distanceKm = Math.round(haversineKm(pos, store) * 10) / 10;
  const availability: Availability = query
    ? deriveAvailability(store.id, query)
    : "unknown";
  const h = hash(store.id);
  return {
    ...store,
    distanceKm,
    travelMin: estimateTravelMin(distanceKm),
    closesAt: closesAtToday(store.openingHours),
    availability,
    aisle: query ? AISLES[h % AISLES.length] : undefined,
    updatedMinAgo: (h % 90) + 1,
  };
}

/**
 * Devuelve dos vistas sobre el catalogo completo:
 * - `all`: todas las tiendas enriquecidas (para pintar el mapa).
 * - `nearby`: solo las que caen dentro del radio (para la lista de tarjetas).
 *
 * Mientras `query` esta vacio, la disponibilidad es "unknown" en todas: el
 * mapa muestra ubicaciones sin pretender saber el stock. Al buscar producto,
 * se le asigna un estado deterministico (hash estable).
 */
export function useStores(query: string, pos: LatLng, radiusKm: number) {
  const q = query.trim();

  const all = useMemo<StoreStock[]>(
    () => MERCADONA_STORES.map((s) => enrich(s, pos, q)),
    [pos.lat, pos.lng, q],
  );

  const nearby = useMemo(
    () =>
      all.filter((s) => s.distanceKm <= radiusKm).sort((a, b) => a.distanceKm - b.distanceKm),
    [all, radiusKm],
  );

  return { all, nearby };
}
