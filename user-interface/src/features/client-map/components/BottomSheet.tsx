import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
  type PropsWithChildren,
} from "react";

import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptic";

export type SheetSnap = "peek" | "mid" | "full";

/** Porcentajes de altura visible por snap, relativos al contenedor padre. */
const SNAP_PCT: Record<SheetSnap, number> = { peek: 20, mid: 50, full: 85 };
/** La hoja mide siempre esto (del padre); los snaps mueven cuanto se ve. */
const SHEET_PCT = 85;

type Props = PropsWithChildren<{
  snap: SheetSnap;
  onSnap: (next: SheetSnap) => void;
  /** Etiqueta accesible del handle. */
  label?: string;
}>;

/**
 * Hoja inferior arrastrable con snap points estilo Google Maps.
 * Se engancha a la altura del padre, por lo que el padre debe tener una
 * altura explicita (p.ej. `h-dvh` o `h-full` dentro de un contenedor con
 * dimensiones). react-leaflet no interfiere porque la hoja esta por encima
 * en z-index.
 */
export function BottomSheet({ snap, onSnap, label, children }: Props) {
  const sheetRef = useRef<HTMLElement | null>(null);
  const [parentH, setParentH] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragDy, setDragDy] = useState(0);
  const startY = useRef(0);

  useLayoutEffect(() => {
    const parent = sheetRef.current?.parentElement;
    if (!parent) return;
    const update = () => setParentH(parent.getBoundingClientRect().height);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(parent);
    return () => ro.disconnect();
  }, []);

  const sheetHeightPx = parentH * (SHEET_PCT / 100);
  const visiblePx = parentH * (SNAP_PCT[snap] / 100);
  // Clamp del arrastre al rango peek..full para evitar que se vaya fuera.
  const maxVisiblePx = parentH * (SNAP_PCT.full / 100);
  const minVisiblePx = parentH * (SNAP_PCT.peek / 100);
  const clampedDy = Math.max(
    visiblePx - maxVisiblePx,
    Math.min(visiblePx - minVisiblePx, dragDy),
  );
  const translatePx = sheetHeightPx - visiblePx + clampedDy;

  const onPointerDown = useCallback((e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    startY.current = e.clientY;
    setDragging(true);
  }, []);

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLButtonElement>) => {
      if (!dragging) return;
      setDragDy(e.clientY - startY.current);
    },
    [dragging],
  );

  const onPointerUp = useCallback(
    (e: PointerEvent<HTMLButtonElement>) => {
      if (!dragging) return;
      e.currentTarget.releasePointerCapture(e.pointerId);
      setDragging(false);

      const finalVisible = visiblePx - clampedDy;
      const finalPct = parentH ? (finalVisible / parentH) * 100 : SNAP_PCT[snap];
      const next = (Object.entries(SNAP_PCT) as [SheetSnap, number][])
        .map(([k, v]) => ({ k, d: Math.abs(v - finalPct) }))
        .sort((a, b) => a.d - b.d)[0].k;

      setDragDy(0);
      if (next !== snap) {
        haptic(6);
        onSnap(next);
      }
    },
    [dragging, visiblePx, clampedDy, parentH, snap, onSnap],
  );

  return (
    <section
      ref={sheetRef}
      aria-label="Tiendas"
      style={{
        height: sheetHeightPx || undefined,
        transform: parentH ? `translateY(${translatePx}px)` : undefined,
        transition: dragging
          ? "none"
          : "transform 280ms cubic-bezier(0.2, 0.9, 0.3, 1)",
      }}
      className={cn(
        "absolute inset-x-0 bottom-0 z-[1100] flex flex-col rounded-t-2xl border-t border-border bg-muted shadow-lg will-change-transform",
        parentH === 0 && "invisible",
      )}
    >
      <button
        type="button"
        aria-label={label ?? "Arrastra para ajustar la hoja"}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="grid h-7 shrink-0 touch-none place-items-center outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <span className="h-1.5 w-10 rounded-full bg-border" />
      </button>
      <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
    </section>
  );
}
