# MercaPredict · UI

Front de MercaPredict: mapa de disponibilidad para el cliente y (proximamente) panel del gestor de stock. Basado en la [guia de diseno](../guia-diseno.md).

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS 3 (tokens de la guia en `src/styles/globals.css`)
- Shadcn/UI (estilo), Lucide (iconos)
- Leaflet + react-leaflet (mapa, teselas CARTO Positron)

## Arranque

```bash
cd user-interface
npm install
npm run dev
```

Las ~1800 tiendas Mercadona vienen empaquetadas en `src/features/client-map/data/stores.ts` (origen: OpenStreetMap via Overpass, licencia ODbL). La disponibilidad por producto se simula client-side con un hash estable de `(id, producto)` hasta que haya backend; para apuntar a la futura API, define `VITE_API_BASE_URL`.

### Regenerar el listado de tiendas

```bash
curl -A mercapredict/0.1 -G 'https://overpass-api.de/api/interpreter' \
  --data-urlencode 'data=[out:json][timeout:90];area["ISO3166-1"="ES"][admin_level=2]->.es;(nwr["brand"="Mercadona"](area.es);nwr["name"="Mercadona"](area.es););out center tags;' \
  -o overpass-raw.json
node scripts/build-stores.mjs
```

## Scripts

- `npm run dev` — servidor de desarrollo en http://localhost:5173
- `npm run build` — build de produccion
- `npm run preview` — sirve el build
- `npm run typecheck` — comprobacion de tipos sin emitir
- `npm run lint` — ESLint

## Estructura

```
src/
  main.tsx                     entrypoint
  App.tsx                      raiz (hoy = ClientMapPage)
  styles/globals.css           tokens guia §9 + base
  lib/
    utils.ts                   cn()
    env.ts                     flags de entorno
  components/
    ui/                        shadcn (Button, ...)
  features/
    client-map/                vista cliente §10 de la guia
      pages/ClientMapPage.tsx
      components/
        StoreMap.tsx           Leaflet, teselas Esri + geolocalizacion
        MarkerCluster.tsx      agrupacion de ~1800 pins
        StoreCard.tsx          tarjeta de tienda
        StatusChip.tsx         chip de disponibilidad
      hooks/useStores.ts       enriquece el catalogo con stock derivado
      data/stores.ts           catalogo Mercadona (generado desde OSM)
      geo.ts                   Haversine + tiempo de trayecto
      openingHours.ts          parser minimo del campo opening_hours
      availability.ts          STATUS, sortStores, hasStock
      types.ts                 contratos de dominio
      index.ts                 barrel
```

Cada feature es autocontenida: tipos, hooks, componentes y mocks viven dentro. Lo transversal (Button, utils, tokens) vive en `components/ui`, `lib/` y `styles/`.

## Como anadir una vista nueva (gestor)

1. Crear `src/features/manager/` con la misma forma: `pages/`, `components/`, `hooks/`, `types.ts`.
2. Anadir una ruta cuando haya mas de una pagina (p.ej. `react-router-dom`).
3. Reusar los tokens (`bg-primary`, `text-destructive`, etc.); no introducir hex sueltos.

## Backend

Hueco reservado al lado (`/backend/`). Endpoints previstos (guia §10 y §11):

- `GET /api/stores?lat=&lng=&q=&radius=` — tiendas cercanas con estado por producto.
- `GET /api/forecast?temp=` — serie historica + prevision + factores.
- `GET /api/alerts` — mapa de calor por seccion para el resumen.
- `PATCH /api/tasks/{id}` — aceptar propuesta de pedido.

## Accesibilidad

- Estado siempre con color + icono + texto (guia §8).
- Objetivos tactiles 44x44 min, foco visible con `focus-visible:ring-primary`.
- Respeta `prefers-reduced-motion` en el vuelo del mapa.
