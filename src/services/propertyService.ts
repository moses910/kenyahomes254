import { supabase } from '@/integrations/supabase/client';
import { SearchFilters, Property } from '@/types';
import { PropertyStatus } from '@/constants';

/** Fields the create-listing form guarantees when inserting a property. */
export interface CreatePropertyInput {
  title: string;
  description?: string | null;
  price?: number | null;
  currency?: string | null;
  for_rent?: boolean | null;
  beds?: number | null;
  baths?: number | null;
  area_sqft?: number | null;
  address?: string | null;
  city?: string | null;
  region?: string | null;
  status?: string | null;
}

export const propertyService = {
  searchProperties: async (filters: SearchFilters) => {
    let query = supabase
      .from('properties')
      .select(`
        *,
        property_photos(thumb_path)
      `)
      .eq('status', PropertyStatus.PUBLISHED)
      .order('created_at', { ascending: false });

    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }

    if (filters.beds) {
      query = query.gte('beds', parseInt(filters.beds));
    }

    if (filters.baths) {
      query = query.gte('baths', parseInt(filters.baths));
    }

    if (filters.propertyType && filters.propertyType !== 'all') {
      query = query.eq('for_rent', filters.propertyType === 'rent');
    }

    if (filters.priceRange) {
      query = query.gte('price', filters.priceRange[0]).lte('price', filters.priceRange[1]);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return data;
  },

  /**
   * Paginated feed of published listings (agent-uploaded properties that are
   * visible to the user side). Returns the page plus the total match count.
   */
  feedProperties: async (filters: SearchFilters, options: { limit?: number; offset?: number }) => {
    const limit = options.limit ?? 12;
    const offset = options.offset ?? 0;

    let query = supabase
      .from('properties')
      .select('*, property_photos(thumb_path)', { count: 'exact' })
      .eq('status', PropertyStatus.PUBLISHED)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }

    if (filters.beds) {
      query = query.gte('beds', parseInt(filters.beds));
    }

    if (filters.baths) {
      query = query.gte('baths', parseInt(filters.baths));
    }

    if (filters.propertyType && filters.propertyType !== 'all') {
      query = query.eq('for_rent', filters.propertyType === 'rent');
    }

    if (filters.priceRange) {
      query = query.gte('price', filters.priceRange[0]).lte('price', filters.priceRange[1]);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return { properties: data ?? [], total: count ?? 0 };
  },

  getPropertyById: async (id: string) => {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        property_photos(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  getAgentProperties: async (agentId: string) => {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        property_photos(thumb_path),
        saved_properties(id)
      `)
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  createProperty: async (data: CreatePropertyInput, agentId: string) => {
    const { data: result, error } = await supabase
      .from('properties')
      .insert({
        ...data,
        agent_id: agentId,
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  updateProperty: async (id: string, data: Partial<Property>) => {
    const { data: result, error } = await supabase
      .from('properties')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  deleteProperty: async (id: string) => {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  setPropertyStatus: async (id: string, status: string) => {
    const { data, error } = await supabase
      .from('properties')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
