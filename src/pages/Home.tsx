import { useSearchProperties } from '@/hooks/useProperties';
import SearchBar from '@/components/search/SearchBar';
import PropertyCard from '@/components/PropertyCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { SearchFilters } from '@/types';

export default function Home() {
  const { properties, loading, refetch } = useSearchProperties();

  const handleSearch = (filters: SearchFilters) => {
    refetch(filters);
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
          
          <SearchBar onSearch={handleSearch} />
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
              <PropertyCard key={property.id} property={property as unknown as PropertyCardData} />
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
