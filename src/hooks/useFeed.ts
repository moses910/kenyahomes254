import { useCallback, useEffect, useRef, useState } from 'react';
import { propertyService } from '@/services/propertyService';
import { firstPhotoUrl } from '@/services/storageService';
import { PropertyWithPhotos, SearchFilters } from '@/types';

const PAGE_SIZE = 12;

const toCard = (prop: PropertyWithPhotos): PropertyWithPhotos => ({
  ...prop,
  thumb_path: firstPhotoUrl(prop.property_photos),
});

/**
 * Feed of published listings for the user side. Supports search filters and
 * "load more" pagination. A generation counter discards stale responses when
 * filters change mid-flight.
 */
export const useFeed = () => {
  const [properties, setProperties] = useState<PropertyWithPhotos[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const filtersRef = useRef<SearchFilters>({ priceRange: [0, 10000000] });
  const generationRef = useRef(0);

  const refetch = useCallback(async (filters: SearchFilters) => {
    filtersRef.current = filters;
    const generation = ++generationRef.current;
    setLoading(true);
    setLoadingMore(false);
    try {
      const { properties: rows, total: count } = await propertyService.feedProperties(filters, {
        limit: PAGE_SIZE,
        offset: 0,
      });
      if (generation !== generationRef.current) return;
      setProperties((rows as unknown as PropertyWithPhotos[]).map(toCard));
      setTotal(count);
      setHasMore(rows.length < count);
    } catch (error) {
      if (generation !== generationRef.current) return;
      console.error('Error fetching feed:', error);
      setProperties([]);
      setTotal(0);
      setHasMore(false);
    } finally {
      if (generation === generationRef.current) setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    const generation = generationRef.current;
    if (loading || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const { properties: rows, total: count } = await propertyService.feedProperties(filtersRef.current, {
        limit: PAGE_SIZE,
        offset: properties.length,
      });
      if (generation !== generationRef.current) return;
      const next = [...properties, ...(rows as unknown as PropertyWithPhotos[]).map(toCard)];
      setProperties(next);
      setTotal(count);
      setHasMore(next.length < count);
    } catch (error) {
      if (generation !== generationRef.current) return;
      console.error('Error loading more feed items:', error);
    } finally {
      if (generation === generationRef.current) setLoadingMore(false);
    }
  }, [loading, loadingMore, hasMore, properties]);

  useEffect(() => {
    refetch({ priceRange: [0, 10000000] });
  }, [refetch]);

  return { properties, total, loading, loadingMore, hasMore, refetch, loadMore };
};
