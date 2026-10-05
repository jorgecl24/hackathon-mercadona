export type Availability = "ok" | "low" | "out" | "unknown";

export type LatLng = { lat: number; lng: number };

/** Datos estaticos de una tienda (sin estado de stock). Ver data/stores.ts. */
export interface MercadonaStore {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  postcode?: string;
  openingHours?: string;
  website?: string;
}

/**
 * Vista enriquecida de una tienda para un cliente concreto y una consulta.
 * Contrato que, en produccion, servira GET /api/stores?lat=&lng=&q=&radius=
 * (guia seccion 10). Solo estado de disponibilidad, nunca stock exacto.
 */
export interface StoreStock extends MercadonaStore {
  distanceKm: number;
  travelMin: number;
  /** "21:30" o null si esta cerrada ahora. */
  closesAt: string | null;
  availability: Availability;
  /** Solo expuesto en "Ver detalle". */
  aisle?: string;
  updatedMinAgo: number;
}

export type StoresRequestStatus = "idle" | "loading" | "ready" | "offline";
