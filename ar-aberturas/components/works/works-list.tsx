'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Work } from '@/lib/works/works';
import { MapPin, Calendar, Building2, CheckCircle, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface WorksListProps {
  works: Work[];
}

export function WorksList({ works }: WorksListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Finalizado':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'En progreso':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {works.map((work) => (
        <Card key={work.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{work.address}</CardTitle>
                <p className="text-sm text-muted-foreground">{work.locality}</p>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                {getStatusIcon(work.status || '')}
                <span>{work.status || 'Sin estado'}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{work.architect || 'Sin arquitecto'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{work.locality || 'Sin localidad'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {work.created_at
                    ? format(new Date(work.created_at), 'PPP', { locale: es })
                    : 'Sin fecha'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Entregado:</span>
                <span>${work.transfer?.toLocaleString('es-AR') || '0'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
