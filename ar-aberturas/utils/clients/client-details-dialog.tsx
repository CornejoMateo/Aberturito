'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Client } from '@/lib/clients/clients';
import { MapPin, X, Plus } from 'lucide-react';
import { EmailLink } from '@/components/ui/email-link';
import { WhatsAppLink } from '@/components/ui/whatsapp-link';
import { useState, useEffect } from 'react';
import { WorkForm } from '@/utils/works/work-form';
import { createWork, getWorksByClientId, Work, deleteWork } from '@/lib/works/works';
import { WorksList } from '@/utils/works/works-list';
import { ClientNotes } from '@/utils/notes/client-notes';
import { updateClient } from '@/lib/clients/clients';
import { ClientBalances } from '@/utils/balances/client-balances';
import { BalanceForm } from '@/utils/balances/balance-form';
import { createBalance } from '@/lib/works/balances';
import { toast } from '@/components/ui/use-toast';

interface ClientDetailsDialogProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export function ClientDetailsDialog({ client, isOpen, onClose, onEdit }: ClientDetailsDialogProps) {
  const [isWorkFormOpen, setIsWorkFormOpen] = useState(false);
  const [isBalanceFormOpen, setIsBalanceFormOpen] = useState(false);
  const [works, setWorks] = useState<Work[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [clientData, setClientData] = useState<Client | null>(null);
  const [balancesKey, setBalancesKey] = useState(0);
  
  useEffect(() => {
    const loadWorks = async () => {
      if (isOpen && client) {
        try {
          console.log('Cargando obras para el cliente ID:', client.id);
          setIsLoading(true);
          
          // add little delay to ensure previous state is cleared
          // ahi tenes los comentarios en ingles, te haces el gari bale
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const result = await getWorksByClientId(client.id);
          console.log('Resultado de getWorksByClientId:', result);
          
          if (result.error) {
            console.error('Error al cargar las obras:', result.error);
            // show a more detailed message in the interface
            return;
          }
          
          if (result.data) {
            console.log('Obras cargadas:', result.data);
            setWorks(result.data);
          } else {
            console.log('No se encontraron obras para este cliente');
            setWorks([]);
          }
        } catch (error) {
          console.error('Error inesperado al cargar obras:', {
            error,
            message: error instanceof Error ? error.message : 'Error desconocido',
            stack: error instanceof Error ? error.stack : undefined
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log('Limpiando lista de obras');
        setWorks([]);
      }
    };
    
    if (isOpen) {
      loadWorks();
    }
  }, [isOpen, client?.id]);
  
  const handleWorkDelete = async (workId: string) => {
    if (!client) return;
    
    try {
      setIsDeleting(true);
      const { error } = await deleteWork(workId);
      
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error al eliminar la obra',
          description: 'Hubo un problema al eliminar la obra. Intente nuevamente.',
        });
        return;
      }
      
      toast({
        title: 'Obra eliminada',
        description: 'La obra se ha eliminado exitosamente.',
      });

      // Refresh the works list
      const { data: updatedWorks } = await getWorksByClientId(client.id);
      if (updatedWorks) {
        setWorks(updatedWorks);
      }
    } catch (error) {
      console.error('Error inesperado al eliminar la obra:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleWorkCreated = async (workData: Omit<Work, 'id' | 'created_at' | 'client_id'>) => {
    if (!client) return;
    
    try {
      setIsLoading(true);
      const { data: newWork, error } = await createWork({
        ...workData,
        client_id: client.id
      });
      
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error al crear la obra',
          description: 'Hubo un problema al crear la obra. Intente nuevamente.',
        });
        return;
      }
      
      toast({
        title: 'Obra creada',
        description: 'La obra se ha creado exitosamente.',
      });
      // reload the list of works
      const { data: updatedWorks } = await getWorksByClientId(client.id);
      if (updatedWorks) {
        setWorks(updatedWorks);
      }
      
      setIsWorkFormOpen(false);
    } catch (error) {
      console.error('Error inesperado al crear la obra:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBalanceCreated = async (balanceData: any) => {    
    try {
      setIsLoading(true);
      const { data, error } = await createBalance(balanceData);
      
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error al crear balance',
          description: 'Hubo un problema al crear el balance. Intente nuevamente.',
        });
        return;
      }
      
      toast({
        title: 'Saldo creado',
        description: 'El Saldo se ha creado exitosamente.',
      });
      setIsBalanceFormOpen(false);
      setBalancesKey(prev => prev + 1);
    } catch (error) {
      console.error('Error inesperado al crear Saldo:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update local client data when client prop changes
  useEffect(() => {
    if (client) {
      setClientData(client);
    }
  }, [client]);

  const handleNotesUpdate = async (updatedNotes: string[]) => {
    if (!client) return;
    
    try {
      const { data: updatedClient } = await updateClient(client.id, { notes: updatedNotes });
      if (updatedClient) {
        setClientData(prev => prev ? { ...prev, notes: updatedNotes } : null);
      }
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };

  if (!clientData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[60vw] h-[90vh] sm:h-[85vh] flex flex-col p-0 sm:p-1"  showCloseButton={false}>
        <DialogHeader>
          <div className="flex m-3 justify-between items-center">
            <DialogTitle>Detalles del cliente</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-2 sm:p-3 pt-0">
          <div className="mb-2">
            <h3 className="text-sm text-center font-semibold mb-1">{clientData.name} {clientData.last_name}</h3>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center justify-center">
                <EmailLink email={clientData.email || ''} className="text-xs hover:underline">
                  {clientData.email}
                </EmailLink>
              </div>
              <div className="flex items-center justify-center">
                <WhatsAppLink 
                  phone={clientData.phone_number || ''} 
                  className="text-xs hover:underline"
                  message={`Hola ${clientData.name || ''}`}
                >
                  {clientData.phone_number}
                </WhatsAppLink>
              </div>
              <div className="flex items-center justify-center gap-1 text-xs">
                <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className="text-xs">{clientData.locality}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-2">
            <Tabs defaultValue="info" className="w-full">
              <TabsList>
                <TabsTrigger value="info">Información</TabsTrigger>
                <TabsTrigger value="works">Obras</TabsTrigger>
                <TabsTrigger value="budgets" disabled>Presupuestos</TabsTrigger>
                <TabsTrigger value="balances">Saldos</TabsTrigger>
                <TabsTrigger value="notes">Notas</TabsTrigger>
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
                <TabsContent value="works" className="relative space-y-4 pt-2">
                  <div className="absolute -top-13 right-0">
                    <Button 
                      onClick={() => setIsWorkFormOpen(true)}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Crear obra
                    </Button>
                  </div>
                  <div className="mt-2">
                    {isLoading ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Cargando obras...
                      </p>
                    ) : works.length > 0 ? (
                      <WorksList 
                        works={works} 
                        onDelete={handleWorkDelete} 
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No hay obras registradas para este cliente.
                      </p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="budgets">
                  <p className="text-sm text-muted-foreground">
                    Aquí se mostrarán los presupuestos del cliente.
                  </p>
                </TabsContent>
                <TabsContent value="notes" className="h-[calc(100%-2.5rem)]">
                  <ClientNotes 
                    client={clientData} 
                    onNotesUpdate={handleNotesUpdate} 
                  />
                </TabsContent>
                <TabsContent value="balances" className="relative space-y-4 pt-2">
                  <div className="absolute -top-13 right-0">
                    <Button 
                      onClick={() => setIsBalanceFormOpen(true)}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Crear saldo
                    </Button>
                  </div>
                  <ClientBalances 
                    key={balancesKey}
                    clientId={clientData.id}
                    works={works}
                  />
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
            onSubmit={handleWorkCreated} 
            onCancel={() => setIsWorkFormOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isBalanceFormOpen} onOpenChange={setIsBalanceFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo saldo</DialogTitle>
          </DialogHeader>
          <BalanceForm
            clientId={parseInt(client?.id || '0')}
            works={works}
            onSubmit={handleBalanceCreated}
            onCancel={() => setIsBalanceFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

    </Dialog>
  );
}
