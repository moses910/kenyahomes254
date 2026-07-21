import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import PropertyImageGallery from '@/components/property/PropertyImageGallery';
import PropertyInfo from '@/components/property/PropertyInfo';
import ContactAgentForm from '@/components/property/ContactAgentForm';
import { usePropertyDetail } from '@/hooks/useProperties';
import { useEffect } from 'react';

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { property, agent, photos, loading } = usePropertyDetail(id);

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
            <PropertyImageGallery property={property} photos={photos} />
            <PropertyInfo property={property} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {agent && (
              <ContactAgentForm propertyId={property.id} agent={agent} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
