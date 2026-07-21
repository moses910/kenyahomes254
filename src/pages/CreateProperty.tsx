import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePropertyForm } from '@/hooks/usePropertyForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import ImageUploader from '@/components/property/ImageUploader';

export default function CreateProperty() {
  const navigate = useNavigate();
  const { id: propertyId } = useParams();
  const { user } = useAuth();
  
  const {
    form,
    images,
    setImages,
    existingImages,
    imagesToDelete,
    setImagesToDelete,
    isSubmitting,
    isLoading,
    handlers: { submitProperty }
  } = usePropertyForm(propertyId);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = form;
  const propertyType = watch('property_type');

  if (!user) {
    return null;
  }

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

    const result = await submitProperty(data);
    
    if (result.success) {
      toast({
        title: "Success!",
        description: propertyId ? "Property updated successfully" : "Property created successfully",
      });
      navigate('/dashboard');
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to save property",
        variant: "destructive",
      });
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
          <ImageUploader 
            images={images}
            setImages={setImages}
            existingImages={existingImages}
            imagesToDelete={imagesToDelete}
            setImagesToDelete={setImagesToDelete}
          />

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
