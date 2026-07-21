import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { propertyService } from '@/services/propertyService';
import { storageService } from '@/services/storageService';
import { useAuth } from '@/contexts/AuthContext';

const propertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000),
  price: z.string().min(1, 'Price is required'),
  beds: z.string().min(1, 'Number of bedrooms is required'),
  baths: z.string().min(1, 'Number of bathrooms is required'),
  area_sqft: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  region: z.string().min(2, 'Region is required'),
  property_type: z.enum(['sale', 'rent']),
});

export type PropertyFormData = z.infer<typeof propertySchema>;

export interface ImagePreview {
  file: File;
  preview: string;
}

export interface ExistingImage {
  id: string;
  storage_path: string;
  ordering: number;
}

export const usePropertyForm = (propertyId?: string) => {
  const { user } = useAuth();
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!propertyId);

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      property_type: 'sale',
    }
  });

  const loadPropertyData = useCallback(async () => {
    if (!propertyId || !user) return;
    try {
      const property = await propertyService.getPropertyById(propertyId);
      if (property && property.agent_id === user.id) {
        form.setValue('title', property.title);
        form.setValue('description', property.description || '');
        form.setValue('price', property.price.toString());
        form.setValue('beds', property.beds.toString());
        form.setValue('baths', property.baths.toString());
        form.setValue('area_sqft', property.area_sqft?.toString() || '');
        form.setValue('address', property.address || '');
        form.setValue('city', property.city || '');
        form.setValue('region', property.region || '');
        form.setValue('property_type', property.for_rent ? 'rent' : 'sale');

        if (property.property_photos) {
          const sortedPhotos = property.property_photos.sort((a: any, b: any) => a.ordering - b.ordering);
          setExistingImages(sortedPhotos);
        }
      }
    } catch (error) {
      console.error('Error loading property:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [propertyId, user, form]);

  useEffect(() => {
    if (propertyId) {
      loadPropertyData();
    }
  }, [propertyId, loadPropertyData]);

  const submitProperty = async (data: PropertyFormData) => {
    if (!user) throw new Error('Not authenticated');
    
    setIsSubmitting(true);
    try {
      if (propertyId) {
        // Update
        await propertyService.updateProperty(propertyId, {
          title: data.title,
          description: data.description,
          price: parseFloat(data.price),
          beds: parseInt(data.beds),
          baths: parseInt(data.baths),
          area_sqft: data.area_sqft ? parseInt(data.area_sqft) : null,
          address: data.address,
          city: data.city,
          region: data.region,
          for_rent: data.property_type === 'rent',
        });

        // Delete images
        if (imagesToDelete.length > 0) {
          const pathsToDelete = existingImages
            .filter(img => imagesToDelete.includes(img.id))
            .map(img => img.storage_path);
            
          await storageService.deletePropertyImages(pathsToDelete, imagesToDelete);
        }

        // Upload new images
        if (images.length > 0) {
          const currentMaxOrdering = existingImages.length > 0 
            ? Math.max(...existingImages.map(img => img.ordering))
            : -1;
          await storageService.uploadPropertyImages(user.id, propertyId, images, currentMaxOrdering + 1);
        }
      } else {
        // Create
        const property = await propertyService.createProperty({
          title: data.title,
          description: data.description,
          price: parseFloat(data.price),
          beds: parseInt(data.beds),
          baths: parseInt(data.baths),
          area_sqft: data.area_sqft ? parseInt(data.area_sqft) : null,
          address: data.address,
          city: data.city,
          region: data.region,
          for_rent: data.property_type === 'rent',
          status: 'draft',
        }, user.id);

        if (images.length > 0) {
          await storageService.uploadPropertyImages(user.id, property.id, images, 0);
        }
      }
      return { success: true };
    } catch (error: any) {
      console.error('Error saving property:', error);
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    images,
    setImages,
    existingImages,
    imagesToDelete,
    setImagesToDelete,
    isSubmitting,
    isLoading,
    handlers: {
      submitProperty,
    }
  };
};
