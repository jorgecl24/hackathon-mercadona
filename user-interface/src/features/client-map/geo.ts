import type { LatLng } from "./types";

const R_KM = 6371;

/** Distancia Haversine en km entre dos puntos (lat/lng en grados). */
export function haversineKm(a: LatLng, b: LatLng): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R_KM * Math.asin(Math.sqrt(s));
}

/** Minutos de trayecto estimados (velocidad urbana media ~30 km/h). */
export const estimateTravelMin = (distanceKm: number) =>
  Math.max(1, Math.round(distanceKm * 2));
