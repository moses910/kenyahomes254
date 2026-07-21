import { supabase } from '@/integrations/supabase/client';

export const messageService = {
  sendInquiry: async (data: {
    property_id: string;
    seeker_id: string;
    agent_id: string;
    body: string;
    email: string;
    phone: string | null;
  }) => {
    const { error } = await supabase
      .from('messages')
      .insert(data);

    if (error) throw error;
  }
};
