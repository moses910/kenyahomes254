import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import PropertyCard from '@/components/PropertyCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Heart } from 'lucide-react';

export default function Favourites() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchFavourites();
  }, [user, navigate]);

  const fetchFavourites = async () => {
    if (!user) return;

    setLoading(true);

    const { data, error } = await supabase
      .from('saved_properties')
      .select(`
        property_id,
        properties (
          *,
          property_photos(thumb_path)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const props = data
        .map((item: any) => item.properties)
        .filter((prop: any) => prop !== null)
        .map((prop: any) => ({
          ...prop,
          thumb_path: prop.property_photos?.[0]?.thumb_path || null,
        }));
      setProperties(props);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">My Favourites</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <Skeleton className="aspect-[4/3]" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-8 w-8 text-primary fill-current" />
          <h1 className="text-3xl font-bold">My Favourites</h1>
        </div>

        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No saved properties yet</h2>
            <p className="text-muted-foreground">
              Start exploring and save your favourite properties!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
