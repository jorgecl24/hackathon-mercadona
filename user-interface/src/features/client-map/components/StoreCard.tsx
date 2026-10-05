import { useState } from "react";
import { Clock, Navigation } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { StoreStock } from "../types";
import { StatusChip } from "./StatusChip";

type Props = {
  store: StoreStock;
  selected: boolean;
  recommended: boolean;
  onSelect: () => void;
};

export function StoreCard({ store: s, selected, recommended, onSelect }: Props) {
  const [detail, setDetail] = useState(false);

  return (
    <article
      tabIndex={0}
      aria-current={selected}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      className={cn(
        "space-y-3 rounded-xl border bg-background p-4 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary",
        selected ? "border-primary ring-1 ring-primary" : "border-border",
      )}
    >
      <div>
        {recommended && (
          <p className="mb-1 text-sm font-semibold text-primary">Tu mejor opcion</p>
        )}
        <h3 className="text-xl font-semibold">{s.name}</h3>
        <p className="text-sm text-muted-foreground">{s.address}</p>
      </div>

      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-base">
        <span className="tabular-nums">
          {s.distanceKm.toLocaleString("es-ES")} km · {s.travelMin} min
        </span>
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Clock className="size-4" aria-hidden />
          {s.closesAt ? `Abierto hasta las ${s.closesAt}` : "Cerrado ahora"}
        </span>
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <StatusChip a={s.availability} />
        <span className="text-sm text-muted-foreground">
          Actualizado hace {s.updatedMinAgo} min
        </span>
      </div>

      {detail && (
        <p className="rounded-lg bg-muted px-3 py-2 text-base">
          {s.aisle
            ? `Lo encontraras en el ${s.aisle.toLowerCase()}.`
            : "Aun no tenemos el pasillo de este producto."}
        </p>
      )}

      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        <Button asChild size="lg" className="flex-1">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`}
            target="_blank"
            rel="noreferrer"
          >
            <Navigation className="size-5" aria-hidden />
            Como llegar
          </a>
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => setDetail((v) => !v)}
          aria-expanded={detail}
          className="flex-1"
        >
          {detail ? "Ocultar detalle" : "Ver detalle"}
        </Button>
      </div>
    </article>
  );
}
