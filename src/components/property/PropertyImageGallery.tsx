import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { PropertyWithPhotos, PropertyPhoto } from '@/types';

interface PropertyImageGalleryProps {
  property: PropertyWithPhotos;
  photos: PropertyPhoto[];
}

export default function PropertyImageGallery({ property, photos }: PropertyImageGalleryProps) {
  return (
    <div className="relative aspect-[16/9] bg-muted rounded-lg overflow-hidden">
      {photos.length > 0 && photos[0].med_path ? (
        <img
          src={photos[0].med_path}
          alt={property.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <MapPin className="h-24 w-24 text-muted-foreground" />
        </div>
      )}
      <Badge className="absolute top-4 left-4 text-base">
        {property.for_rent ? 'For Rent' : 'For Sale'}
      </Badge>
    </div>
  );
}
