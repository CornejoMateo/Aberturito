'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Work } from '@/lib/works/works';
import { MapPin, Calendar, Building2, CheckCircle, Clock, XCircle, ListChecks, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { DeleteWorkDialog } from '@/utils/works/delete-work-dialog';

interface WorksListProps {
  works: Work[];
  onDelete?: (workId: string) => Promise<void>;
}

export function WorksList({ works, onDelete }: WorksListProps) {
  const [workToDelete, setWorkToDelete] = useState<{id: string, address: string} | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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

  const handleDeleteConfirm = async () => {
    if (workToDelete) {
      await onDelete?.(workToDelete.id);
      setIsDeleteDialogOpen(false);
      setWorkToDelete(null);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto w-full">
      <DeleteWorkDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        workAddress={workToDelete?.address || ''}
      />
      {works.map((work) => (
        <Card key={work.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{work.address}</CardTitle>
                <p className="text-sm text-muted-foreground">{work.locality}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  {getStatusIcon(work.status || '')}
                  <span>{work.status || 'Sin estado'}</span>
                </div>
                {onDelete && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 -mr-5 -mt-11 text-muted-foreground hover:text-destructive p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setWorkToDelete({ id: work.id, address: work.address });
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
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
              <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium whitespace-nowrap">Entregado:</span>
                  <span className="truncate">${work.transfer?.toLocaleString('es-AR') || '0'}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 px-2 shrink-0"
                >
                  <ListChecks className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs whitespace-nowrap">Crear Checklist</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
