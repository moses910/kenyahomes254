import { useFeed } from '@/hooks/useFeed';
import SearchBar from '@/components/search/SearchBar';
import PropertyCard from '@/components/PropertyCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchFilters, PropertyCardData } from '@/types';
import { Loader2, SearchX } from 'lucide-react';

export default function Home() {
  const { properties, total, loading, loadingMore, hasMore, refetch, loadMore } = useFeed();

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
            Discover the latest properties uploaded by agents across Kenya
          </p>
          
          <SearchBar onSearch={handleSearch} />
        </div>
      </section>

      {/* Properties Grid */}
      <section className="container mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Latest Listings</h2>
          {!loading && (
            <span className="text-sm text-muted-foreground">
              {total} {total === 1 ? 'listing' : 'listings'}
            </span>
          )}
        </div>
        
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property as unknown as PropertyCardData} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <Button
                  onClick={loadMore}
                  disabled={loadingMore}
                  variant="outline"
                  size="lg"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More Listings'
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <SearchX className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No listings found</h2>
            <p className="text-muted-foreground">
              No published properties match your search yet. Try adjusting your filters.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
