import { supabase } from '@/integrations/supabase/client';
import { STORAGE_BUCKET } from '@/constants';

export const storageService = {
  uploadPropertyImages: async (userId: string, propertyId: string, files: { file: File, preview: string }[], startOrdering: number = 0) => {
    const uploadPromises = files.map(async (image, index) => {
      const fileExt = image.file.name.split('.').pop();
      const fileName = `${userId}/${propertyId}/${Date.now()}-${index}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, image.file);

      if (uploadError) throw uploadError;

      // Insert into property_photos table
      const { error: dbError } = await supabase
        .from('property_photos')
        .insert({
          property_id: propertyId,
          storage_path: fileName,
          ordering: startOrdering + index,
        });

      if (dbError) throw dbError;

      return fileName;
    });

    return Promise.all(uploadPromises);
  },

  deletePropertyImages: async (storagePaths: string[], imageIds: string[]) => {
    if (imageIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('property_photos')
        .delete()
        .in('id', imageIds);

      if (deleteError) throw deleteError;
    }

    if (storagePaths.length > 0) {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove(storagePaths);
      
      if (error) throw error;
    }
  },

  getPublicUrl: (storagePath: string) => {
    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);
    return data.publicUrl;
  }
};
