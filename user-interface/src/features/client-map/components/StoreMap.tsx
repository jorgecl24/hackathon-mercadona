import { useEffect } from "react";
import { CircleMarker, MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import type { LatLng, StoreStock } from "../types";
import { MarkerCluster } from "./MarkerCluster";

// Teselas claras sin API key. CARTO Positron pide clave desde 2024; Esri
// World Light Gray Canvas es gratis, cumple el estilo "grises y blancos" de
// la guia §10 y solo exige la atribucion. Soporta zoom nativo hasta 16; con
// maxNativeZoom + maxZoom dejamos acercarse mas sin pedir teselas inexistentes.
const TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}";
const ATTR =
  'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, DeLorme, NAVTEQ · ' +
  'Datos de tiendas &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

function FlyTo({ to }: { to: LatLng }) {
  const map = useMap();
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    map.flyTo([to.lat, to.lng], Math.max(map.getZoom(), 13), {
      animate: !reduce,
      duration: 0.6,
    });
  }, [to.lat, to.lng, map]);
  return null;
}

type Props = {
  user: LatLng;
  stores: StoreStock[];
  selectedId?: string;
  recommendedId?: string;
  onSelect: (id: string) => void;
  flyTarget?: LatLng;
};

export function StoreMap({
  user,
  stores,
  selectedId,
  recommendedId,
  onSelect,
  flyTarget,
}: Props) {
  return (
    <MapContainer
      center={[user.lat, user.lng]}
      zoom={13}
      maxZoom={18}
      zoomControl={false}
      className="absolute inset-0 z-0"
    >
      <TileLayer url={TILE_URL} attribution={ATTR} maxZoom={18} maxNativeZoom={16} />
      {flyTarget && <FlyTo to={flyTarget} />}
      <CircleMarker
        center={[user.lat, user.lng]}
        radius={8}
        pathOptions={{ color: "#fff", weight: 3, fillColor: "#2B2B2B", fillOpacity: 1 }}
      />
      <MarkerCluster
        stores={stores}
        selectedId={selectedId}
        recommendedId={recommendedId}
        onSelect={onSelect}
      />
    </MapContainer>
  );
}
