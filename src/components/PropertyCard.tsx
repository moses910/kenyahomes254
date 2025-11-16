import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Bed, Bath, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    price: number;
    currency: string;
    for_rent: boolean;
    beds: number;
    baths: number;
    city: string;
    address: string;
    thumb_path?: string;
  };
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkIfSaved();
    }
  }, [user, property.id]);

  const checkIfSaved = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('saved_properties')
      .select('id')
      .eq('user_id', user.id)
      .eq('property_id', property.id)
      .single();

    setIsSaved(!!data);
  };

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to save properties');
      return;
    }

    setLoading(true);

    if (isSaved) {
      const { error } = await supabase
        .from('saved_properties')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', property.id);

      if (error) {
        toast.error('Failed to remove from favourites');
      } else {
        setIsSaved(false);
        toast.success('Removed from favourites');
      }
    } else {
      const { error } = await supabase
        .from('saved_properties')
        .insert({
          user_id: user.id,
          property_id: property.id,
        });

      if (error) {
        toast.error('Failed to save property');
      } else {
        setIsSaved(true);
        toast.success('Added to favourites');
      }
    }

    setLoading(false);
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
            onClick={toggleSave}
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
            {property.currency} {property.price.toLocaleString()}
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
