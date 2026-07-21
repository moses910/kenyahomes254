import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import { ImagePreview, ExistingImage } from '@/hooks/usePropertyForm';
import { storageService } from '@/services/storageService';
import { toast } from '@/hooks/use-toast';
import { MAX_PROPERTY_IMAGES } from '@/constants';

interface ImageUploaderProps {
  images: ImagePreview[];
  setImages: React.Dispatch<React.SetStateAction<ImagePreview[]>>;
  existingImages: ExistingImage[];
  imagesToDelete: string[];
  setImagesToDelete: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function ImageUploader({ 
  images, 
  setImages, 
  existingImages, 
  imagesToDelete, 
  setImagesToDelete 
}: ImageUploaderProps) {
  
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const totalImages = files.length + images.length + existingImages.length - imagesToDelete.length;
    if (totalImages > MAX_PROPERTY_IMAGES) {
      toast({
        title: "Too many images",
        description: `You can upload a maximum of ${MAX_PROPERTY_IMAGES} images`,
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

  return (
    <div className="space-y-4">
      <Label>Property Photos (Max {MAX_PROPERTY_IMAGES})</Label>
      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
        <input
          type="file"
          id="images"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleImageSelect}
          className="hidden"
          disabled={images.length >= MAX_PROPERTY_IMAGES}
        />
        <label htmlFor="images" className="cursor-pointer">
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, WEBP up to 5MB ({images.length}/{MAX_PROPERTY_IMAGES})
          </p>
        </label>
      </div>

      {(existingImages.length > 0 || images.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {existingImages
            .filter(img => !imagesToDelete.includes(img.id))
            .map((image, index) => (
              <div key={image.id} className="relative group">
                <img
                  src={storageService.getPublicUrl(image.storage_path)}
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
  );
}
