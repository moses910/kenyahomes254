import { supabase } from '@/integrations/supabase/client';
import { SearchFilters } from '@/types';
import { PropertyStatus } from '@/constants';

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

  createProperty: async (data: any, agentId: string) => {
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

  updateProperty: async (id: string, data: any) => {
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
  }
};
