import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Bed, Bath, MapPin } from 'lucide-react';
import { useSaveToggle } from '@/hooks/useSavedProperties';
import { PropertyCardData } from '@/types';
import { toast } from 'sonner';

interface PropertyCardProps {
  property: PropertyCardData;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const { isSaved, loading, toggle } = useSaveToggle(property.id);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    const result = await toggle();
    if (result && result.success) {
      if (result.isSaved) {
        toast.success('Added to favourites');
      } else {
        toast.success('Removed from favourites');
      }
    } else if (result && !result.success) {
      toast.error('Failed to update favourite');
    }
  };

  return (
    <Link to={`/property/${property.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          {property.thumb_path ? (
            <img
              src={property.thumb_path}
              alt={property.title}
              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <Button
            size="icon"
            variant={isSaved ? 'default' : 'secondary'}
            className="absolute top-3 right-3 opacity-90 hover:opacity-100"
            onClick={handleToggleSave}
            disabled={loading}
          >
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </Button>
          <Badge className="absolute bottom-3 left-3">
            {property.for_rent ? 'For Rent' : 'For Sale'}
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1">{property.title}</h3>
          <p className="text-2xl font-bold text-primary mb-2">
            {property.currency} {property.price?.toLocaleString()}
            {property.for_rent && <span className="text-sm font-normal">/month</span>}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>{property.beds}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>{property.baths}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="line-clamp-1">{property.city}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
