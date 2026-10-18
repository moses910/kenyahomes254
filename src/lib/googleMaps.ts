/**
 * The location a property carries. Every field can be missing: the map pin is
 * optional when an agent creates a listing, and the text fields are nullable.
 * The text fields are optional too, so a caller that only knows coordinates
 * does not have to pad them with nulls.
 */
export interface PropertyLocation {
  latitude: number | null;
  longitude: number | null;
  address?: string | null;
  city?: string | null;
  region?: string | null;
}

/**
 * Google's documented universal link. It needs no API key, and on a phone it
 * opens the Google Maps app rather than the desktop site.
 */
const MAPS_SEARCH_URL = "https://www.google.com/maps/search/?api=1&query=";

/** Appended to text queries so a bare "Kilimani, Nairobi" resolves in Kenya. */
const COUNTRY = "Kenya";

const clean = (value: string | null | undefined): string => (value ?? "").trim();

/**
 * The human-readable location line. Region is deliberately absent: it only
 * helps the map query, and showing it would lengthen every listing's header.
 */
export function locationLabel(location: PropertyLocation): string {
  return [clean(location.address), clean(location.city)].filter(Boolean).join(", ");
}

/**
 * A Google Maps link for this property, or null when there is nothing worth
 * linking to. Exact coordinates win; otherwise the typed location is searched.
 */
export function googleMapsUrl(location: PropertyLocation): string | null {
  const { latitude, longitude } = location;

  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return `${MAPS_SEARCH_URL}${latitude},${longitude}`;
  }

  const parts = [clean(location.address), clean(location.city), clean(location.region)].filter(
    Boolean,
  );

  if (parts.length === 0) return null;

  return `${MAPS_SEARCH_URL}${encodeURIComponent([...parts, COUNTRY].join(", "))}`;
}
