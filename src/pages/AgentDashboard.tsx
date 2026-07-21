import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';
import DashboardPropertyCard from '@/components/dashboard/DashboardPropertyCard';
import { useAgentProperties } from '@/hooks/useProperties';
import { toast } from 'sonner';
import { UserRole } from '@/constants';
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
  const { properties, loading, deleteProperty } = useAgentProperties(user?.id);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (profile && profile.role !== UserRole.AGENT) {
      toast.error('Access denied. Agent account required.');
      navigate('/');
      return;
    }
  }, [user, profile, navigate]);

  const handleDelete = async () => {
    if (!deleteId) return;

    const success = await deleteProperty(deleteId);

    if (!success) {
      toast.error('Failed to delete property');
    } else {
      toast.success('Property deleted successfully');
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
              <DashboardPropertyCard 
                key={property.id} 
                property={property} 
                onDeleteClick={setDeleteId} 
              />
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
