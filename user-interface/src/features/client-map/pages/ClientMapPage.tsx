import { useEffect, useMemo, useState } from "react";
import { LocateFixed, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { haptic } from "@/lib/haptic";
import { cn } from "@/lib/utils";

import { hasStock, sortStores } from "../availability";
import { BottomSheet, type SheetSnap } from "../components/BottomSheet";
import { StoreCard } from "../components/StoreCard";
import { StoreMap } from "../components/StoreMap";
import { useStores } from "../hooks/useStores";
import type { LatLng } from "../types";

const SUGGESTIONS = [
  "Leche entera Hacendado",
  "Hielo",
  "Agua mineral",
  "Yogures naturales",
  "Pan de molde",
];

/** Centro por defecto (Valencia) hasta que se concede la geolocalizacion. */
const DEFAULT_POS: LatLng = { lat: 39.4699, lng: -0.3763 };

export function ClientMapPage() {
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [focus, setFocus] = useState(false);
  const [openNow, setOpenNow] = useState(false);
  const [near, setNear] = useState(false);
  const [radius, setRadius] = useState(5);
  const [pos, setPos] = useState<LatLng>(DEFAULT_POS);
  const [flyTarget, setFlyTarget] = useState<LatLng | undefined>();
  const [noLocation, setNoLocation] = useState(false);
  const [selectedId, setSelectedId] = useState<string>();
  const [snap, setSnap] = useState<SheetSnap>("mid");

  useEffect(() => {
    if (!navigator.geolocation) {
      setNoLocation(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const next = { lat: p.coords.latitude, lng: p.coords.longitude };
        setPos(next);
        setFlyTarget(next);
      },
      () => setNoLocation(true),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
    );
  }, []);

  const { all, nearby } = useStores(query, pos, radius);

  const visibleCards = useMemo(() => {
    const base = query ? sortStores(nearby) : nearby;
    return base.filter((s) => (!openNow || s.closesAt) && (!near || s.distanceKm < 2));
  }, [nearby, query, openNow, near]);

  const recommendedId = visibleCards.find(hasStock)?.id;
  const activeId = selectedId ?? recommendedId;
  const sel = all.find((s) => s.id === activeId);

  useEffect(() => {
    if (sel) setFlyTarget({ lat: sel.lat, lng: sel.lng });
  }, [sel?.id]);

  const matches = SUGGESTIONS.filter(
    (x) => draft && x.toLowerCase().includes(draft.toLowerCase()) && x !== draft,
  ).slice(0, 4);

  const search = (q: string) => {
    haptic(6);
    setDraft(q);
    setQuery(q.trim());
    setSelectedId(undefined);
    setFocus(false);
    setSnap("mid");
  };

  const locate = () => {
    haptic(8);
    navigator.geolocation?.getCurrentPosition(
      (p) => {
        const next = { lat: p.coords.latitude, lng: p.coords.longitude };
        setPos(next);
        setFlyTarget(next);
        setNoLocation(false);
      },
      () => setNoLocation(true),
    );
  };

  const chip = (on: boolean) =>
    cn(
      "min-h-11 shrink-0 rounded-full border px-4 text-base font-medium shadow-sm",
      on
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-background",
    );

  return (
    <div className="relative h-full w-full overflow-hidden bg-muted text-foreground">
      <StoreMap
        user={pos}
        stores={all}
        selectedId={activeId}
        recommendedId={recommendedId}
        onSelect={(id) => {
          haptic(5);
          setSelectedId(id);
          setSnap((s) => (s === "peek" ? "mid" : s));
        }}
        flyTarget={flyTarget}
      />

      {/* Chrome superior: buscador + filtros */}
      <div className="absolute inset-x-0 top-0 z-[1100] px-safe pt-safe">
        <div className="flex flex-col gap-2 p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              search(draft);
            }}
            role="search"
            className="relative"
          >
            <div className="flex h-12 items-center gap-2 rounded-full border border-border bg-background pl-4 pr-1 shadow-md">
              <Search className="size-5 text-muted-foreground" aria-hidden />
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                placeholder="¿Que producto buscas?"
                aria-label="Buscar producto"
                className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={locate}
                aria-label="Usar mi ubicacion"
                className="grid size-11 place-items-center rounded-full text-primary hover:bg-muted"
              >
                <LocateFixed className="size-5" aria-hidden />
              </button>
            </div>

            {focus && matches.length > 0 && (
              <ul className="absolute inset-x-0 top-14 overflow-hidden rounded-xl border border-border bg-background shadow-md">
                {matches.map((m) => (
                  <li key={m}>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        search(m);
                      }}
                      className="min-h-11 w-full px-4 text-left text-base hover:bg-muted"
                    >
                      {m}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </form>

          {noLocation && (
            <p className="rounded-xl bg-background px-4 py-2 text-sm shadow-sm">
              No podemos leer tu ubicacion. Pulsa el icono para reintentar o
              busca por codigo postal.
              {/* TODO: input CP + geocodificacion en backend */}
            </p>
          )}

          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              aria-pressed={openNow}
              onClick={() => {
                haptic(5);
                setOpenNow((v) => !v);
              }}
              className={chip(openNow)}
            >
              Abierto ahora
            </button>
            <button
              aria-pressed={near}
              onClick={() => {
                haptic(5);
                setNear((v) => !v);
              }}
              className={chip(near)}
            >
              Menos de 2 km
            </button>
          </div>
        </div>
      </div>

      <BottomSheet snap={snap} onSnap={setSnap}>
        <div className="space-y-3 px-4 pt-1 pb-safe">
          {!query && (
            <div className="space-y-3 py-2">
              <p className="text-lg font-semibold">¿Donde lo encuentro cerca?</p>
              <p className="text-base text-muted-foreground">
                Hay {all.length.toLocaleString("es-ES")} Mercadonas en el mapa.
                Busca un producto para ver donde esta disponible.
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.slice(0, 3).map((s) => (
                  <button key={s} onClick={() => search(s)} className={chip(false)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && visibleCards.length === 0 && (
            <p className="py-2 text-base">
              No hay tiendas en {radius} km. Prueba a ampliar la busqueda.
            </p>
          )}

          {query &&
            visibleCards.length > 0 &&
            !visibleCards.some(hasStock) && (
              <div className="space-y-3 rounded-xl bg-warning-soft p-4">
                <p className="text-base">
                  Ahora mismo no hay stock cerca. Amplia la busqueda a 10 km.
                </p>
                {radius < 10 && (
                  <Button onClick={() => setRadius(10)} size="lg">
                    Ampliar a 10 km
                  </Button>
                )}
              </div>
            )}

          {query &&
            visibleCards.map((s) => (
              <StoreCard
                key={s.id}
                store={s}
                selected={s.id === activeId}
                recommended={s.id === recommendedId}
                onSelect={() => {
                  haptic(5);
                  setSelectedId(s.id);
                }}
              />
            ))}
        </div>
      </BottomSheet>
    </div>
  );
}
