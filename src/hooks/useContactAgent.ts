import { useState } from 'react';
import { messageService } from '@/services/messageService';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';

const messageSchema = z.object({
  body: z.string().trim().min(1, 'Message cannot be empty').max(5000, 'Message must be less than 5000 characters'),
  email: z.string().trim().email('Invalid email format').max(255, 'Email must be less than 255 characters').optional().or(z.literal('')),
  phone: z.string().trim().regex(/^\+?[0-9\s\-\(\)]{6,20}$/, 'Invalid phone format').max(20, 'Phone must be less than 20 characters').optional().or(z.literal('')),
});

export const useContactAgent = (propertyId: string, agentId: string) => {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);

  const handleSend = async (message: string, contactEmail: string, contactPhone: string) => {
    if (!user) {
      return { success: false, error: 'Please sign in to contact the agent' };
    }

    const validation = messageSchema.safeParse({
      body: message,
      email: contactEmail || user.email,
      phone: contactPhone,
    });

    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message };
    }

    setSending(true);

    try {
      await messageService.sendInquiry({
        property_id: propertyId,
        seeker_id: user.id,
        agent_id: agentId,
        body: message.trim(),
        email: contactEmail.trim() || user.email || '',
        phone: contactPhone.trim() || null,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Message send error:', error);
      return { success: false, error: error.message || 'Failed to send message' };
    } finally {
      setSending(false);
    }
  };

  return { sending, handleSend };
};
