import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import { STATUS } from "../availability";
import type { StoreStock } from "../types";

type Props = {
  stores: StoreStock[];
  selectedId?: string;
  recommendedId?: string;
  onSelect: (id: string) => void;
};

/** Marcador circular con color + glifo; la tienda recomendada es mas grande. */
function pin(s: StoreStock, big: boolean, selected: boolean) {
  const st = STATUS[s.availability];
  const d = big ? 46 : 32;
  return L.divIcon({
    className: "",
    iconSize: [d, d],
    iconAnchor: [d / 2, d / 2],
    html: `<div style="width:${d}px;height:${d}px;box-sizing:border-box;border-radius:50%;background:${st.color};color:${st.fg};border:${selected ? 4 : 3}px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.28);display:grid;place-items:center;font:700 ${big ? 22 : 15}px system-ui">${st.glyph}</div>`,
  });
}

/**
 * Agrupa los ~1800 pins con leaflet.markercluster para que el mapa no se
 * ahogue al abrir Espana entera. react-leaflet no cubre clustering, asi que
 * nos enganchamos al mapa con useMap() y gestionamos el layer en imperativo.
 */
export function MarkerCluster({ stores, selectedId, recommendedId, onSelect }: Props) {
  const map = useMap();
  const groupRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    const group = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 60,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
    });
    groupRef.current = group;
    map.addLayer(group);
    return () => {
      map.removeLayer(group);
      groupRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    group.clearLayers();
    const markers = stores.map((s) => {
      const marker = L.marker([s.lat, s.lng], {
        icon: pin(s, s.id === recommendedId, s.id === selectedId),
        title: `${s.name}: ${STATUS[s.availability].label}`,
      });
      marker.on("click", () => onSelect(s.id));
      return marker;
    });
    group.addLayers(markers);
  }, [stores, selectedId, recommendedId, onSelect]);

  return null;
}
