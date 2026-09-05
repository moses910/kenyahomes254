import { useEffect, useRef } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PIN_ICON } from "@/lib/map";

interface PropertyMapProps {
  latitude: number;
  longitude: number;
}

export default function PropertyMap({ latitude, longitude }: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Initialise the map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [latitude, longitude],
      zoom: 15,
      scrollWheelZoom: false,
      dragging: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the pin and view in sync when navigating between properties.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const latlng: L.LatLngExpression = [latitude, longitude];
    if (markerRef.current) {
      markerRef.current.setLatLng(latlng);
    } else {
      markerRef.current = L.marker(latlng, { icon: PIN_ICON }).addTo(map);
    }
    map.setView(latlng, 15);
  }, [latitude, longitude]);

  return (
    <div className="overflow-hidden rounded-lg border">
      <div ref={containerRef} className="h-64 w-full" />
      <p className="px-3 py-2 text-xs text-muted-foreground">
        {latitude.toFixed(5)}, {longitude.toFixed(5)}
      </p>
    </div>
  );
}
