import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Upload, X, Home } from 'lucide-react';

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

type PropertyFormData = z.infer<typeof propertySchema>;

interface ImagePreview {
  file: File;
  preview: string;
}

interface ExistingImage {
  id: string;
  storage_path: string;
  ordering: number;
}

export default function CreateProperty() {
  const navigate = useNavigate();
  const { id: propertyId } = useParams();
  const { user } = useAuth();
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!propertyId);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      property_type: 'sale',
    }
  });

  const propertyType = watch('property_type');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (propertyId) {
      loadPropertyData();
    }
  }, [propertyId, user]);

  const loadPropertyData = async () => {
    if (!propertyId) return;

    try {
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('*, property_photos(*)')
        .eq('id', propertyId)
        .eq('agent_id', user!.id)
        .single();

      if (propertyError) throw propertyError;

      // Set form values
      setValue('title', property.title);
      setValue('description', property.description || '');
      setValue('price', property.price.toString());
      setValue('beds', property.beds.toString());
      setValue('baths', property.baths.toString());
      setValue('area_sqft', property.area_sqft?.toString() || '');
      setValue('address', property.address || '');
      setValue('city', property.city || '');
      setValue('region', property.region || '');
      setValue('property_type', property.for_rent ? 'rent' : 'sale');

      // Set existing images
      if (property.property_photos) {
        const sortedPhotos = property.property_photos.sort((a: any, b: any) => a.ordering - b.ordering);
        setExistingImages(sortedPhotos);
      }
    } catch (error: any) {
      console.error('Error loading property:', error);
      toast({
        title: "Error",
        description: "Failed to load property data",
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const totalImages = files.length + images.length + existingImages.length - imagesToDelete.length;
    if (totalImages > 10) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 10 images",
        variant: "destructive",
      });
      return;
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const removeExistingImage = (imageId: string) => {
    setImagesToDelete(prev => [...prev, imageId]);
  };

  const getImageUrl = (storagePath: string) => {
    const { data } = supabase.storage
      .from('property-images')
      .getPublicUrl(storagePath);
    return data.publicUrl;
  };

  const uploadImages = async (propertyId: string, startOrdering: number = 0) => {
    const uploadPromises = images.map(async (image, index) => {
      const fileExt = image.file.name.split('.').pop();
      const fileName = `${user.id}/${propertyId}/${Date.now()}-${index}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('property-images')
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
  };

  const onSubmit = async (data: PropertyFormData) => {
    const totalImages = images.length + existingImages.length - imagesToDelete.length;
    if (totalImages === 0) {
      toast({
        title: "Images required",
        description: "Please upload at least one image",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (propertyId) {
        // Update existing property
        const { error: propertyError } = await supabase
          .from('properties')
          .update({
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
          })
          .eq('id', propertyId);

        if (propertyError) throw propertyError;

        // Delete marked images
        if (imagesToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from('property_photos')
            .delete()
            .in('id', imagesToDelete);

          if (deleteError) throw deleteError;

          // Delete from storage
          const pathsToDelete = existingImages
            .filter(img => imagesToDelete.includes(img.id))
            .map(img => img.storage_path);

          if (pathsToDelete.length > 0) {
            await supabase.storage
              .from('property-images')
              .remove(pathsToDelete);
          }
        }

        // Upload new images
        if (images.length > 0) {
          const currentMaxOrdering = existingImages.length > 0 
            ? Math.max(...existingImages.map(img => img.ordering))
            : -1;
          await uploadImages(propertyId, currentMaxOrdering + 1);
        }

        toast({
          title: "Success!",
          description: "Property updated successfully",
        });
      } else {
        // Create new property
        const { data: property, error: propertyError } = await supabase
          .from('properties')
          .insert({
            agent_id: user.id,
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
          })
          .select()
          .single();

        if (propertyError) throw propertyError;

        // Upload images
        await uploadImages(property.id);

        toast({
          title: "Success!",
          description: "Property created successfully",
        });
      }

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error saving property:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save property",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading property data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {propertyId ? 'Edit Listing' : 'Create New Listing'}
          </h1>
          <p className="text-muted-foreground">
            {propertyId ? 'Update your property details' : 'Fill in the details to list your property'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-card p-8 rounded-lg shadow-lg">
          {/* Property Type */}
          <div className="space-y-2">
            <Label htmlFor="property_type">Property Type</Label>
            <Select
              value={propertyType}
              onValueChange={(value) => setValue('property_type', value as 'sale' | 'rent')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sale">For Sale</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Property Title</Label>
            <Input
              id="title"
              placeholder="e.g., Modern 3BR Apartment in Westlands"
              {...register('title')}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your property in detail..."
              rows={6}
              {...register('description')}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          {/* Price and Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price">Price (KES)</Label>
              <Input
                id="price"
                type="number"
                placeholder="5000000"
                {...register('price')}
              />
              {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="area_sqft">Area (sq ft) - Optional</Label>
              <Input
                id="area_sqft"
                type="number"
                placeholder="1500"
                {...register('area_sqft')}
              />
            </div>
          </div>

          {/* Beds and Baths */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="beds">Bedrooms</Label>
              <Input
                id="beds"
                type="number"
                min="0"
                placeholder="3"
                {...register('beds')}
              />
              {errors.beds && <p className="text-sm text-destructive">{errors.beds.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="baths">Bathrooms</Label>
              <Input
                id="baths"
                type="number"
                min="0"
                placeholder="2"
                {...register('baths')}
              />
              {errors.baths && <p className="text-sm text-destructive">{errors.baths.message}</p>}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              placeholder="123 Main Street"
              {...register('address')}
            />
            {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="Nairobi"
                {...register('city')}
              />
              {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                placeholder="Nairobi County"
                {...register('region')}
              />
              {errors.region && <p className="text-sm text-destructive">{errors.region.message}</p>}
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <Label>Property Photos (Max 10)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                id="images"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                disabled={images.length >= 10}
              />
              <label htmlFor="images" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, WEBP up to 5MB ({images.length}/10)
                </p>
              </label>
            </div>

            {/* Image Previews */}
            {(existingImages.length > 0 || images.length > 0) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Existing images */}
                {existingImages
                  .filter(img => !imagesToDelete.includes(img.id))
                  .map((image, index) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={getImageUrl(image.storage_path)}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(image.id)}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground px-2 py-1 text-xs rounded">
                          Cover
                        </div>
                      )}
                    </div>
                  ))}

                {/* New images */}
                {images.map((image, index) => (
                  <div key={`new-${index}`} className="relative group">
                    <img
                      src={image.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {existingImages.filter(img => !imagesToDelete.includes(img.id)).length === 0 && index === 0 && (
                      <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground px-2 py-1 text-xs rounded">
                        Cover
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-accent text-accent-foreground px-2 py-1 text-xs rounded">
                      New
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting 
                ? (propertyId ? 'Updating...' : 'Creating...') 
                : (propertyId ? 'Update Listing' : 'Create Listing')
              }
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
