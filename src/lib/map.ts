import * as L from "leaflet";

/** Default map center: Nairobi, Kenya. */
export const NAIROBI_CENTER: [number, number] = [-1.2921, 36.8219];

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * A self-contained map pin rendered from an inline SVG. Using a DivIcon keeps
 * Leaflet from trying to resolve its default marker PNGs, which break under
 * Vite's bundler.
 */
export const PIN_ICON = L.divIcon({
  className: "",
  html: `<svg width="32" height="42" viewBox="0 0 24 24" fill="#ef4444" stroke="#ffffff" stroke-width="1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
  <circle cx="12" cy="9" r="2.5" fill="#ffffff"/>
</svg>`,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
});
