import type { Tables } from '@/integrations/supabase/types';

// Database row types
export type Property = Tables<'properties'>;
export type PropertyPhoto = Tables<'property_photos'>;
export type Profile = Tables<'profiles'>;
export type Message = Tables<'messages'>;
export type SavedProperty = Tables<'saved_properties'>;

// UI-specific composite types
export interface PropertyWithPhotos extends Property {
  property_photos?: PropertyPhoto[];
  thumb_path?: string | null;
}

export interface PropertyWithStats extends PropertyWithPhotos {
  saved_properties?: { id: string }[];
  saves_count?: number;
}

export interface PropertyCardData {
  id: string;
  title: string;
  price: number | null;
  currency: string | null;
  for_rent: boolean | null;
  beds: number | null;
  baths: number | null;
  city: string | null;
  address: string | null;
  thumb_path?: string | null;
}

export interface AgentProfile {
  id: string | null;
  name: string | null;
  role: string | null;
  verified: boolean | null;
  created_at: string | null;
}

export interface SearchFilters {
  city?: string;
  priceRange: [number, number];
  beds?: string;
  baths?: string;
  propertyType?: string;
}
