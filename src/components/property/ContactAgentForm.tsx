import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send } from 'lucide-react';
import { useContactAgent } from '@/hooks/useContactAgent';
import { AgentProfile } from '@/types';
import { toast } from 'sonner';

interface ContactAgentFormProps {
  propertyId: string;
  agent: AgentProfile;
}

export default function ContactAgentForm({ propertyId, agent }: ContactAgentFormProps) {
  const [message, setMessage] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  
  const { sending, handleSend } = useContactAgent(propertyId, agent.id!);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await handleSend(message, contactEmail, contactPhone);
    
    if (result.success) {
      toast.success('Message sent successfully!');
      setMessage('');
      setContactEmail('');
      setContactPhone('');
    } else if (result.error) {
      toast.error(result.error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Agent</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-semibold text-lg">{agent.name || 'Agent'}</p>
          {agent.verified && (
            <Badge variant="secondary" className="mt-2">Verified Agent</Badge>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            Send a message to contact this agent
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="I'm interested in this property..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+254..."
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={sending}>
            <Send className="mr-2 h-4 w-4" />
            {sending ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
