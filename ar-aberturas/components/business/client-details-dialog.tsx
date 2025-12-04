'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Client } from '@/lib/clients/clients';
import { Mail, Phone, MapPin, X } from 'lucide-react';

interface ClientDetailsDialogProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export function ClientDetailsDialog({ client, isOpen, onClose, onEdit }: ClientDetailsDialogProps) {
  if (!client) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        {/* tratar de hacer mas grande el modal, yo no pude xd */}
      <DialogContent className="max-w-[90vw] w-[90vw] h-[85vh] flex flex-col" showCloseButton={false}>
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Detalles del Cliente</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4 pr-2 -mr-2">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{client.name} {client.last_name}</h3>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{client.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{client.phone_number}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{client.locality}</span>
              </div>
            </div>
          </div>

        {/* TODO: Add client notes or additional info here, aca podria ir la firma del cliente. */}

          <Tabs defaultValue="info" className="w-full">
            <TabsList>
              <TabsTrigger value="info">Información</TabsTrigger>
              <TabsTrigger value="works" disabled>Obras</TabsTrigger>
              <TabsTrigger value="budgets" disabled>Presupuestos</TabsTrigger>
            </TabsList>
            
            <div className="mt-4 p-6 border rounded-lg bg-muted/10">
              <TabsContent value="info">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Información Adicional</h4>
                    <p className="text-sm text-muted-foreground">
                      Aca va tal vez, no lo se, puede ser que si, puede ser que no, mas info del cliente...
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="works">
                <p className="text-sm text-muted-foreground">
                  Aquí se mostrarán las obras del cliente.
                </p>
              </TabsContent>
              <TabsContent value="budgets">
                <p className="text-sm text-muted-foreground">
                  Aquí se mostrarán los presupuestos del cliente.
                </p>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
