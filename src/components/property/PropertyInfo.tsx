import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Heart, Bed, Bath, Maximize } from 'lucide-react';
import { PropertyWithPhotos } from '@/types';
import { useSaveToggle } from '@/hooks/useSavedProperties';

interface PropertyInfoProps {
  property: PropertyWithPhotos;
}

export default function PropertyInfo({ property }: PropertyInfoProps) {
  const { isSaved, toggle } = useSaveToggle(property.id);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-3xl mb-2">{property.title}</CardTitle>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{property.address}, {property.city}</span>
            </div>
          </div>
          <Button
            size="icon"
            variant={isSaved ? 'default' : 'outline'}
            onClick={toggle}
          >
            <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-4xl font-bold text-primary">
            {property.currency} {property.price?.toLocaleString()}
            {property.for_rent && <span className="text-lg font-normal">/month</span>}
          </p>
        </div>

        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <Bed className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">{property.beds} Bedrooms</span>
          </div>
          <div className="flex items-center gap-2">
            <Bath className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">{property.baths} Bathrooms</span>
          </div>
          {property.area_sqft && (
            <div className="flex items-center gap-2">
              <Maximize className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{property.area_sqft} sqft</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t">
          <h3 className="font-semibold text-lg mb-2">Description</h3>
          <p className="text-muted-foreground leading-relaxed">
            {property.description || 'No description available.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
