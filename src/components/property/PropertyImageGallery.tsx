import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { PropertyWithPhotos, PropertyPhoto } from '@/types';
import { storageService } from '@/services/storageService';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';

interface PropertyImageGalleryProps {
  property: PropertyWithPhotos;
  photos: PropertyPhoto[];
}

export default function PropertyImageGallery({ property, photos }: PropertyImageGalleryProps) {
  const urls = [...photos]
    .sort((a, b) => (a.ordering ?? 0) - (b.ordering ?? 0))
    .map((p) => (p.storage_path ? storageService.getPublicUrl(p.storage_path) : null))
    .filter((url): url is string => url !== null);

  const fallback = (
    <div className="relative aspect-[16/9] rounded-lg bg-muted overflow-hidden">
      <div className="flex h-full w-full items-center justify-center">
        <MapPin className="h-24 w-24 text-muted-foreground" />
      </div>
    </div>
  );

  return (
    <div className="relative">
      <Badge className="absolute top-4 left-4 z-10 text-base">
        {property.for_rent ? 'For Rent' : 'For Sale'}
      </Badge>

      {urls.length === 0 ? (
        fallback
      ) : urls.length === 1 ? (
        <div className="relative aspect-[16/9] rounded-lg bg-muted overflow-hidden">
          <img
            src={urls[0]}
            alt={property.title}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <Carousel className="w-full">
          <CarouselContent>
            {urls.map((url, index) => (
              <CarouselItem key={index}>
                <div className="relative aspect-[16/9] rounded-lg bg-muted overflow-hidden">
                  <img
                    src={url}
                    alt={`${property.title} — photo ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
      )}
    </div>
  );
}
