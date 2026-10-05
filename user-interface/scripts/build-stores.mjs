// Convierte el JSON crudo de Overpass en un listado tipado de tiendas
// Mercadona listo para empaquetar con el front. Deduplica el nodo + way +
// relation que OSM suele tener por tienda y conserva el registro con mas tags.
//
// Uso:
//   node scripts/build-stores.mjs [input.json] [output.ts]
//
// El fichero crudo se obtiene con:
//   curl -A ua -G 'https://overpass-api.de/api/interpreter' \
//     --data-urlencode 'data=[out:json][timeout:90];
//       area["ISO3166-1"="ES"][admin_level=2]->.es;
//       (nwr["brand"="Mercadona"](area.es);
//        nwr["name"="Mercadona"](area.es););
//       out center tags;'

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const INPUT = resolve(here, "..", process.argv[2] ?? "overpass-raw.json");
const OUTPUT = resolve(
  here,
  "..",
  process.argv[3] ?? "src/features/client-map/data/stores.ts",
);

/** @typedef {{ id: string; name: string; lat: number; lng: number;
 *             address: string; postcode?: string; openingHours?: string;
 *             website?: string }} Store */

const raw = JSON.parse(readFileSync(INPUT, "utf8"));

/** Elimina acentos y pasa a minusculas para dedup. */
const norm = (s) =>
  s
    ?.toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim() ?? "";

const tagScore = (tags = {}) => Object.keys(tags).length;

/** @type {Map<string, Store & { _score: number }>} */
const byKey = new Map();

for (const el of raw.elements) {
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (lat == null || lng == null) continue;

  const tags = el.tags ?? {};
  // Filtra entradas que no son supermercado (p.ej. parkings con brand=Mercadona).
  if (tags.shop && tags.shop !== "supermarket") continue;

  const street = norm(tags["addr:street"]);
  const number = norm(tags["addr:housenumber"]);
  const postcode = tags["addr:postcode"];
  const addressKey = street && number ? `${street}|${number}|${postcode ?? ""}` : "";
  // Clave de dedup: direccion si existe; si no, coordenadas redondeadas a ~11 m.
  const key =
    addressKey ||
    `${lat.toFixed(4)}|${lng.toFixed(4)}`;

  const addressParts = [
    tags["addr:street"] &&
      (tags["addr:housenumber"]
        ? `${tags["addr:street"]} ${tags["addr:housenumber"]}`
        : tags["addr:street"]),
    tags["addr:city"] ?? tags["addr:town"] ?? tags["addr:village"],
    postcode,
  ].filter(Boolean);

  const store = {
    id: `osm-${el.type}-${el.id}`,
    name: tags["name"] ?? "Mercadona",
    lat,
    lng,
    address: addressParts.join(", "),
    postcode: postcode ?? undefined,
    openingHours: tags["opening_hours"] ?? undefined,
    website: tags["website"] ?? undefined,
    _score: tagScore(tags),
  };

  const prev = byKey.get(key);
  if (!prev || store._score > prev._score) byKey.set(key, store);
}

const stores = [...byKey.values()]
  .map(({ _score, ...rest }) => rest)
  .sort((a, b) => a.lat - b.lat);

const header = `// Generado por scripts/build-stores.mjs a partir de OpenStreetMap (Overpass API).
// No editar a mano: ejecutar \`node scripts/build-stores.mjs\` para regenerar.
// Datos (c) contribuidores de OpenStreetMap, licencia ODbL.

import type { MercadonaStore } from "../types";

export const MERCADONA_STORES: readonly MercadonaStore[] = ${JSON.stringify(stores, null, 2)};
`;

writeFileSync(OUTPUT, header);
console.log(`Escritas ${stores.length} tiendas en ${OUTPUT}`);
