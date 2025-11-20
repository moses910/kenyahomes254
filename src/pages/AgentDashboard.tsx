import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Eye, Heart, Edit, Trash2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AgentDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (profile && profile.role !== 'agent') {
      toast.error('Access denied. Agent account required.');
      navigate('/');
      return;
    }

    if (profile) {
      fetchProperties();
    }
  }, [user, profile, navigate]);

  const fetchProperties = async () => {
    if (!user) return;

    setLoading(true);

    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        property_photos(thumb_path),
        saved_properties(id)
      `)
      .eq('agent_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const propsWithStats = data.map(prop => ({
        ...prop,
        thumb_path: prop.property_photos?.[0]?.thumb_path || null,
        saves_count: prop.saved_properties?.length || 0,
      }));
      setProperties(propsWithStats);
    }

    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', deleteId);

    if (error) {
      toast.error('Failed to delete property');
    } else {
      toast.success('Property deleted successfully');
      setProperties(properties.filter(p => p.id !== deleteId));
    }

    setDeleteId(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Listings</h1>
          <Button asChild>
            <Link to="/dashboard/create">
              <Plus className="mr-2 h-4 w-4" />
              Create New Listing
            </Link>
          </Button>
        </div>

        {properties.length > 0 ? (
          <div className="grid gap-4">
            {properties.map((property) => (
              <Card key={property.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Thumbnail */}
                    <div className="w-full md:w-48 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      {property.thumb_path ? (
                        <img
                          src={property.thumb_path}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Eye className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold">{property.title}</h3>
                          <p className="text-muted-foreground">{property.city}</p>
                        </div>
                        <Badge variant={property.status === 'published' ? 'default' : 'secondary'}>
                          {property.status}
                        </Badge>
                      </div>

                      <p className="text-2xl font-bold text-primary">
                        {property.currency} {property.price.toLocaleString()}
                        {property.for_rent && <span className="text-base font-normal">/month</span>}
                      </p>

                      {/* Stats */}
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          <span>{property.saves_count} saves</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/property/${property.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/listings/edit/${property.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteId(property.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-semibold mb-2">No listings yet</h2>
              <p className="text-muted-foreground mb-6">
                Create your first property listing to get started
              </p>
              <Button asChild>
                <Link to="/dashboard/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Listing
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the property listing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
