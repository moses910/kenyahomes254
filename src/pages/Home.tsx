import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Search, SlidersHorizontal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import PropertyCard from '@/components/PropertyCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [beds, setBeds] = useState<string>('');
  const [baths, setBaths] = useState<string>('');
  const [propertyType, setPropertyType] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    
    let query = supabase
      .from('properties')
      .select(`
        *,
        property_photos(thumb_path)
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (searchCity) {
      query = query.ilike('city', `%${searchCity}%`);
    }

    if (beds) {
      query = query.gte('beds', parseInt(beds));
    }

    if (baths) {
      query = query.gte('baths', parseInt(baths));
    }

    if (propertyType) {
      query = query.eq('for_rent', propertyType === 'rent');
    }

    query = query.gte('price', priceRange[0]).lte('price', priceRange[1]);

    const { data, error } = await query;

    if (!error && data) {
      const propertiesWithPhotos = data.map(prop => ({
        ...prop,
        thumb_path: prop.property_photos?.[0]?.thumb_path || null,
      }));
      setProperties(propertiesWithPhotos);
    }

    setLoading(false);
  };

  const handleSearch = () => {
    fetchProperties();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Find Your Dream Home in Kenya
          </h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Discover the perfect property from thousands of listings
          </p>
          
          {/* Search Bar */}
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="Enter city or location..."
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </div>
                <Button onClick={handleSearch} className="md:w-auto">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
              
              {/* Advanced Filters */}
              {showFilters && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Property Type</label>
                    <Select value={propertyType} onValueChange={setPropertyType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any</SelectItem>
                        <SelectItem value="sale">For Sale</SelectItem>
                        <SelectItem value="rent">For Rent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bedrooms</label>
                    <Select value={beds} onValueChange={setBeds}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Any</SelectItem>
                        <SelectItem value="1">1+</SelectItem>
                        <SelectItem value="2">2+</SelectItem>
                        <SelectItem value="3">3+</SelectItem>
                        <SelectItem value="4">4+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bathrooms</label>
                    <Select value={baths} onValueChange={setBaths}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Any</SelectItem>
                        <SelectItem value="1">1+</SelectItem>
                        <SelectItem value="2">2+</SelectItem>
                        <SelectItem value="3">3+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="md:col-span-3 space-y-2">
                    <label className="text-sm font-medium">
                      Price Range: KES {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()}
                    </label>
                    <Slider
                      min={0}
                      max={10000000}
                      step={100000}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="container mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold mb-8">Featured Properties</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No properties found. Try adjusting your search criteria.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
