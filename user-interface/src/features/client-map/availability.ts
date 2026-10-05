import { Check, Minus, TriangleAlert, X, type LucideIcon } from "lucide-react";

import type { Availability, StoreStock } from "./types";

/**
 * Color + icono + texto por estado: nunca solo color (guia secciones 2 y 8).
 * El naranja va con texto oscuro; el resto, texto blanco.
 */
export const STATUS: Record<
  Availability,
  { label: string; color: string; fg: string; glyph: string; icon: LucideIcon }
> = {
  ok: { label: "Hay stock", color: "#3F7D2B", fg: "#FFFFFF", glyph: "✓", icon: Check },
  low: {
    label: "Quedan pocas unidades",
    color: "#FFA102",
    fg: "#2B2B2B",
    glyph: "!",
    icon: TriangleAlert,
  },
  out: { label: "Sin stock", color: "#D32F2F", fg: "#FFFFFF", glyph: "✕", icon: X },
  unknown: { label: "Sin datos", color: "#6B6B66", fg: "#FFFFFF", glyph: "–", icon: Minus },
};

export const hasStock = (s: StoreStock) =>
  s.availability === "ok" || s.availability === "low";

const RANK: Record<Availability, number> = { ok: 0, low: 0, unknown: 1, out: 2 };

/** Primero las que tienen stock, de mas cerca a mas lejos. */
export const sortStores = (list: StoreStock[]) =>
  [...list].sort(
    (a, b) => RANK[a.availability] - RANK[b.availability] || a.distanceKm - b.distanceKm,
  );
