import { useState, useEffect, useCallback } from 'react';
import { propertyService } from '@/services/propertyService';
import { PropertyWithPhotos, PropertyWithStats, PropertyPhoto, AgentProfile } from '@/types';
import { profileService } from '@/services/profileService';


export const usePropertyDetail = (id: string | undefined) => {
  const [property, setProperty] = useState<PropertyWithPhotos | null>(null);
  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [photos, setPhotos] = useState<PropertyPhoto[]>([]);
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
        const propsWithStats = (data as unknown as PropertyWithStats[]).map((prop) => ({
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

  const updatePropertyStatus = async (id: string, status: string) => {
    try {
      await propertyService.setPropertyStatus(id, status);
      setProperties(prev => prev.map(p => p.id === id ? { ...p, status } : p));
      return true;
    } catch (error) {
      console.error('Error updating property status:', error);
      return false;
    }
  };

  return { properties, loading, deleteProperty, updatePropertyStatus, refetch: fetchProperties };
};
