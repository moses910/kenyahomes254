import { useEffect, useRef } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAIROBI_CENTER, PIN_ICON, type LatLng } from "@/lib/map";

interface LocationPickerProps {
  value: LatLng | null;
  onChange: (value: LatLng | null) => void;
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Initialise the map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initial: L.LatLngExpression = value
      ? [value.lat, value.lng]
      : NAIROBI_CENTER;

    const map = L.map(containerRef.current, {
      center: initial,
      zoom: value ? 15 : 12,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // The map is intentionally created once; value/onChange are read from refs at mount time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the marker in sync with the selected value.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (value) {
      const latlng: L.LatLngExpression = [value.lat, value.lng];
      if (markerRef.current) {
        markerRef.current.setLatLng(latlng);
      } else {
        markerRef.current = L.marker(latlng, { icon: PIN_ICON, draggable: true })
          .addTo(map)
          .on("dragend", (e) => {
            const p = (e.target as L.Marker).getLatLng();
            onChange({ lat: p.lat, lng: p.lng });
          });
      }
      map.setView(latlng, Math.max(map.getZoom(), 15));
    } else if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  }, [value, onChange]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => console.warn("Unable to read location"),
    );
  };

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="h-64 w-full overflow-hidden rounded-lg border"
      />
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={useMyLocation}>
          <LocateFixed className="mr-2 h-4 w-4" />
          Use my location
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
            <X className="mr-2 h-4 w-4" />
            Clear pin
          </Button>
        )}
        {value && (
          <span className="ml-auto text-xs text-muted-foreground">
            {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
          </span>
        )}
      </div>
    </div>
  );
}
