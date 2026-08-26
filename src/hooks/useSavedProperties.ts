import { useState, useEffect, useCallback } from 'react';
import { savedPropertyService } from '@/services/savedPropertyService';
import { useAuth } from '@/contexts/AuthContext';
import type { PropertyCardData } from '@/types';

export const useSaveToggle = (propertyId: string | undefined) => {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkIfSaved = async () => {
      if (!user || !propertyId) return;
      try {
        const saved = await savedPropertyService.checkIfSaved(user.id, propertyId);
        setIsSaved(saved);
      } catch (error) {
        console.error('Error checking saved status:', error);
      }
    };

    checkIfSaved();
  }, [user, propertyId]);

  const toggle = async () => {
    if (!user || !propertyId) return false;
    
    setLoading(true);
    try {
      const newStatus = await savedPropertyService.toggleSave(user.id, propertyId, isSaved);
      setIsSaved(newStatus);
      return { success: true, isSaved: newStatus };
    } catch (error) {
      console.error('Error toggling save:', error);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return { isSaved, loading, toggle };
};

export const useFavourites = (userId: string | undefined) => {
  const [properties, setProperties] = useState<PropertyCardData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavourites = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await savedPropertyService.getUserFavourites(userId);
      if (data) {
        const formattedProps: PropertyCardData[] = data.map((item) => {
          const p = item.properties;
          return {
            id: p?.id ?? '',
            title: p?.title ?? 'Untitled',
            price: p?.price ?? null,
            currency: p?.currency ?? 'KES',
            for_rent: p?.for_rent ?? false,
            beds: p?.beds ?? 0,
            baths: p?.baths ?? 0,
            city: p?.city ?? '',
            address: p?.address ?? '',
            thumb_path: p?.property_photos?.[0]?.thumb_path || null,
          };
        });
        setProperties(formattedProps);
      }
    } catch (error) {
      console.error('Error fetching favourites:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFavourites();
  }, [fetchFavourites]);

  return { properties, loading, refetch: fetchFavourites };
};
