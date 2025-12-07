'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Client } from '@/lib/clients/clients';
import { Mail, Phone, MapPin, X, Plus } from 'lucide-react';
import { useState } from 'react';
import { WorkForm } from '@/components/works/work-form';
import { createWork } from '@/lib/works/works';

interface ClientDetailsDialogProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export function ClientDetailsDialog({ client, isOpen, onClose, onEdit }: ClientDetailsDialogProps) {
  const [isWorkFormOpen, setIsWorkFormOpen] = useState(false);
  
  if (!client) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[60vw] h-[90vh] sm:h-[85vh] flex flex-col p-0 sm:p-1"  showCloseButton={false}>
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Detalles del cliente</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-2 sm:p-3 pt-0">
          <div className="mb-2">
            <h3 className="text-sm text-center font-semibold mb-1">{client.name} {client.last_name}</h3>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center justify-center gap-1 text-xs">
                <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className="text-xs ">{client.email}</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-xs">
                <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className="text-xs ">{client.phone_number}</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-xs">
                <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className="text-xs">{client.locality}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-2">
            <Tabs defaultValue="info" className="w-full">
              <TabsList>
                <TabsTrigger value="info">Información</TabsTrigger>
                <TabsTrigger value="works">Obras</TabsTrigger>
                <TabsTrigger value="budgets" disabled>Presupuestos</TabsTrigger>
              </TabsList>
              
              <div className="mt-2">
                <TabsContent value="info">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-xs">Información adicional</h4>
                      <p className="text-xs text-muted-foreground">
                        Aca va tal vez, no lo se, puede ser que si, puede ser que no, mas info del cliente...
                      </p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="works" className="relative">
                  <Button 
                    onClick={() => setIsWorkFormOpen(true)}
                    className="absolute top-0 right-0"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Crear obra
                  </Button>
                </TabsContent>
                <TabsContent value="budgets">
                  <p className="text-sm text-muted-foreground">
                    Aquí se mostrarán los presupuestos del cliente.
                  </p>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </DialogContent>
      
      <Dialog open={isWorkFormOpen} onOpenChange={setIsWorkFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Obra</DialogTitle>
          </DialogHeader>
          <WorkForm
            clientId={client?.id || ''}
            onCancel={() => setIsWorkFormOpen(false)}
            onSubmit={async (workData) => {
              try {
                await createWork({
                  ...workData,
                  client_id: client?.id || '',
                });
                setIsWorkFormOpen(false);
              } catch (error) {
                console.error('Error al crear la obra:', error);
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
