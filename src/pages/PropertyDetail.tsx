import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Bed, Bath, Maximize, MapPin, Heart, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function PropertyDetail() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any>(null);
  const [agent, setAgent] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [message, setMessage] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  useEffect(() => {
    if (user && property) {
      checkIfSaved();
    }
  }, [user, property]);

  const fetchProperty = async () => {
    setLoading(true);

    const { data: propData, error: propError } = await supabase
      .from('properties')
      .select(`
        *,
        property_photos(*)
      `)
      .eq('id', id)
      .single();

    if (propError || !propData) {
      toast.error('Property not found');
      navigate('/');
      return;
    }

    setProperty(propData);
    setPhotos(propData.property_photos || []);

    // Fetch agent details
    const { data: agentData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', propData.agent_id)
      .single();

    if (agentData) {
      setAgent(agentData);
    }

    setLoading(false);
  };

  const checkIfSaved = async () => {
    if (!user || !property) return;

    const { data } = await supabase
      .from('saved_properties')
      .select('id')
      .eq('user_id', user.id)
      .eq('property_id', property.id)
      .single();

    setIsSaved(!!data);
  };

  const toggleSave = async () => {
    if (!user) {
      toast.error('Please sign in to save properties');
      navigate('/auth');
      return;
    }

    if (isSaved) {
      const { error } = await supabase
        .from('saved_properties')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', property.id);

      if (!error) {
        setIsSaved(false);
        toast.success('Removed from favourites');
      }
    } else {
      const { error } = await supabase
        .from('saved_properties')
        .insert({
          user_id: user.id,
          property_id: property.id,
        });

      if (!error) {
        setIsSaved(true);
        toast.success('Added to favourites');
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to contact the agent');
      navigate('/auth');
      return;
    }

    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSending(true);

    const { error } = await supabase
      .from('messages')
      .insert({
        property_id: property.id,
        seeker_id: user.id,
        agent_id: property.agent_id,
        body: message,
        email: contactEmail || user.email,
        phone: contactPhone,
      });

    setSending(false);

    if (error) {
      toast.error('Failed to send message');
    } else {
      toast.success('Message sent successfully!');
      setMessage('');
      setContactEmail('');
      setContactPhone('');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-12 w-32 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="aspect-[16/9] w-full" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!property) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to listings
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="relative aspect-[16/9] bg-muted rounded-lg overflow-hidden">
              {photos.length > 0 && photos[0].med_path ? (
                <img
                  src={photos[0].med_path}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <MapPin className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
              <Badge className="absolute top-4 left-4 text-base">
                {property.for_rent ? 'For Rent' : 'For Sale'}
              </Badge>
            </div>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl mb-2">{property.title}</CardTitle>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{property.address}, {property.city}</span>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant={isSaved ? 'default' : 'outline'}
                    onClick={toggleSave}
                  >
                    <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-4xl font-bold text-primary">
                    {property.currency} {property.price.toLocaleString()}
                    {property.for_rent && <span className="text-lg font-normal">/month</span>}
                  </p>
                </div>

                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <Bed className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{property.beds} Bedrooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{property.baths} Bathrooms</span>
                  </div>
                  {property.area_sqft && (
                    <div className="flex items-center gap-2">
                      <Maximize className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{property.area_sqft} sqft</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-lg mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {property.description || 'No description available.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Card */}
            {agent && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact Agent</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold text-lg">{agent.name || 'Agent'}</p>
                    <p className="text-sm text-muted-foreground">{agent.email}</p>
                    {agent.phone && (
                      <p className="text-sm text-muted-foreground">{agent.phone}</p>
                    )}
                    {agent.verified && (
                      <Badge variant="secondary" className="mt-2">Verified</Badge>
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="space-y-4">
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
