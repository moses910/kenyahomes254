import { supabase } from '@/integrations/supabase/client';

export const savedPropertyService = {
  checkIfSaved: async (userId: string, propertyId: string) => {
    const { data } = await supabase
      .from('saved_properties')
      .select('id')
      .eq('user_id', userId)
      .eq('property_id', propertyId)
      .single();

    return !!data;
  },

  toggleSave: async (userId: string, propertyId: string, currentlySaved: boolean) => {
    if (currentlySaved) {
      const { error } = await supabase
        .from('saved_properties')
        .delete()
        .eq('user_id', userId)
        .eq('property_id', propertyId);

      if (error) throw error;
      return false; // Not saved anymore
    } else {
      const { error } = await supabase
        .from('saved_properties')
        .insert({
          user_id: userId,
          property_id: propertyId,
        });

      if (error) throw error;
      return true; // Now saved
    }
  },

  getUserFavourites: async (userId: string) => {
    const { data, error } = await supabase
      .from('saved_properties')
      .select(`
        property_id,
        properties (
          *,
          property_photos(thumb_path)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};
