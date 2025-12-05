'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [isCreatingWork, setIsCreatingWork] = useState(false);
  
  if (!client) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[60vw] h-[90vh] sm:h-[85vh] flex flex-col p-0 sm:p-6" showCloseButton={false}>
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Detalles del cliente</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-2">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">{client.name} {client.last_name}</h3>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{client.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{client.phone_number}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{client.locality}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <Tabs defaultValue="info" className="w-full">
              <TabsList>
                <TabsTrigger value="info">Información</TabsTrigger>
                <TabsTrigger value="works">Obras</TabsTrigger>
                <TabsTrigger value="budgets" disabled>Presupuestos</TabsTrigger>
              </TabsList>
              
              <div className="mt-4 p-4 sm:p-6 border rounded-lg bg-muted/10">
                <TabsContent value="info">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Información adicional</h4>
                      <p className="text-sm text-muted-foreground">
                        Aca va tal vez, no lo se, puede ser que si, puede ser que no, mas info del cliente...
                      </p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="works">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Obras del cliente</h4>
                      <Button onClick={() => setIsCreatingWork(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Crear obra
                      </Button>
                    </div>
                    
                    {isCreatingWork ? (
                      <div className="p-4 border rounded-lg bg-card">
                        <h5 className="font-medium mb-4">Nueva Obra</h5>
                        <WorkForm
                          clientId={client.id}
                          onCancel={() => setIsCreatingWork(false)}
                          onSubmit={async (workData) => {
                            try {
                              await createWork({
                                ...workData,
                                client_id: client.id,
                              });
                              // Aquí podrías actualizar la lista de obras si es necesario
                              setIsCreatingWork(false);
                            } catch (error) {
                              console.error('Error al crear la obra:', error);
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Aquí se mostrarán las obras del cliente.
                      </p>
                    )}
                  </div>
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
    </Dialog>
  );
}
