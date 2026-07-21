import { useState, useEffect, useCallback } from 'react';
import { propertyService } from '@/services/propertyService';
import { SearchFilters, PropertyWithPhotos, PropertyWithStats } from '@/types';
import { profileService } from '@/services/profileService';

export const useSearchProperties = () => {
  const [properties, setProperties] = useState<PropertyWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = useCallback(async (filters: SearchFilters = { priceRange: [0, 10000000] }) => {
    setLoading(true);
    try {
      const data = await propertyService.searchProperties(filters);
      if (data) {
        const propertiesWithPhotos = data.map((prop: any) => ({
          ...prop,
          thumb_path: prop.property_photos?.[0]?.thumb_path || null,
        }));
        setProperties(propertiesWithPhotos);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return { properties, loading, refetch: fetchProperties };
};

export const usePropertyDetail = (id: string | undefined) => {
  const [property, setProperty] = useState<any>(null);
  const [agent, setAgent] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const propData = await propertyService.getPropertyById(id);
        if (propData) {
          setProperty(propData);
          setPhotos(propData.property_photos || []);
          
          if (propData.agent_id) {
            const agentData = await profileService.getAgentProfile(propData.agent_id);
            setAgent(agentData);
          }
        }
      } catch (error) {
        console.error('Error fetching property details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  return { property, agent, photos, loading };
};

export const useAgentProperties = (agentId: string | undefined) => {
  const [properties, setProperties] = useState<PropertyWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = useCallback(async () => {
    if (!agentId) return;
    setLoading(true);
    try {
      const data = await propertyService.getAgentProperties(agentId);
      if (data) {
        const propsWithStats = data.map((prop: any) => ({
          ...prop,
          thumb_path: prop.property_photos?.[0]?.thumb_path || null,
          saves_count: prop.saved_properties?.length || 0,
        }));
        setProperties(propsWithStats);
      }
    } catch (error) {
      console.error('Error fetching agent properties:', error);
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const deleteProperty = async (id: string) => {
    try {
      await propertyService.deleteProperty(id);
      setProperties(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting property:', error);
      return false;
    }
  };

  return { properties, loading, deleteProperty, refetch: fetchProperties };
};
