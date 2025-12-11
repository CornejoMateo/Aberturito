'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CalendarIcon, MapPin, User, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { typeConfig } from '@/constants/type-config';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    id: string;
    title: string | null | undefined;
    type: 'entrega' | 'instalacion' | 'medicion';
    date: string;
    client?: string | null | undefined;
    location?: string | null | undefined;
    description?: string | null | undefined;
  };
}

export function EventDetailsModal({ isOpen, onClose, event }: EventDetailsModalProps) {
  const typeInfo = typeConfig[event.type];
  const TypeIcon = typeInfo.icon;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded ${typeInfo.color.split(' ')[0]}/10`}>
              <TypeIcon className={`h-5 w-5 ${typeInfo.color.split(' ')[1]}`} />
            </div>
            <DialogTitle className="text-xl">{event.title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-3">
            {event.client && (
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="text-sm">{event.client}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <CalendarIcon className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Fecha</p>
                <p className="text-sm">{event.date}</p>
              </div>
            </div>

            {event.location && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Ubicación</p>
                  <p className="text-sm">{event.location}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <FileText className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Descripción</p>
                <p className="text-sm whitespace-pre-line">
                  {event.description || 'No hay descripción disponible'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
