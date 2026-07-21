import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Heart, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PropertyWithStats } from '@/types';
import { PropertyStatus } from '@/constants';

interface DashboardPropertyCardProps {
  property: PropertyWithStats;
  onDeleteClick: (id: string) => void;
}

export default function DashboardPropertyCard({ property, onDeleteClick }: DashboardPropertyCardProps) {
  return (
    <Card>
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
              <Badge variant={property.status === PropertyStatus.PUBLISHED ? 'default' : 'secondary'}>
                {property.status}
              </Badge>
            </div>

            <p className="text-2xl font-bold text-primary">
              {property.currency} {property.price?.toLocaleString()}
              {property.for_rent && <span className="text-base font-normal">/month</span>}
            </p>

            {/* Stats */}
            <div className="flex gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>{property.saves_count || 0} saves</span>
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
                onClick={() => onDeleteClick(property.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
