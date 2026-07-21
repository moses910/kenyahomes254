import { supabase } from '@/integrations/supabase/client';

export const profileService = {
  getProfileById: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  getAgentProfile: async (agentId: string) => {
    const { data, error } = await supabase
      .from('public_agent_profiles')
      .select('id, name, role, verified, created_at')
      .eq('id', agentId)
      .single();

    if (error) throw error;
    return data;
  }
};
