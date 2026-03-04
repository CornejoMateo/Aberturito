'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Client } from '@/lib/clients/clients';
import { MapPin, X, Plus } from 'lucide-react';
import { EmailLink } from '@/components/ui/email-link';
import { WhatsAppLink } from '@/components/ui/whatsapp-link';
import { useState, useEffect } from 'react';
import { WorkForm } from '@/utils/works/work-form';
import { Work } from '@/lib/works/works';
import { WorksList } from '@/utils/works/works-list';
import { updateClient } from '@/lib/clients/clients';
import { ClientBalances } from '@/utils/balances/client-balances';
import { BalanceForm } from '@/utils/balances/balance-form';
import { createBalance } from '@/lib/works/balances';
import { toast } from '@/components/ui/use-toast';
import { ClientBudgetsTab } from '@/utils/budgets/client-budgets-tab';
import { ClientImagesGallery } from '@/utils/images-client/images-client';
import { useAuth } from '@/components/provider/auth-provider';
import { translateError } from '@/lib/error-translator';
import { useClientWorks } from '@/hooks/clients/use-client-works';
import { useClientBudgets } from '@/hooks/clients/use-client-budgets';

interface ClientDetailsDialogProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export function ClientDetailsDialog({ client, isOpen, onClose, onEdit }: ClientDetailsDialogProps) {
  const [isWorkFormOpen, setIsWorkFormOpen] = useState(false);
  const [isBalanceFormOpen, setIsBalanceFormOpen] = useState(false);
  const [clientData, setClientData] = useState<Client | null>(null);
  const [cover, setCover] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSavingCover, setIsSavingCover] = useState(false);
  const [balancesKey, setBalancesKey] = useState(0);
  const { user } = useAuth();
  
  const { works, isLoading, loadWorks, create, remove } =
    useClientWorks(client?.id);

  const { budgets, loadBudgets } =
    useClientBudgets(client?.id);
  
  const handleTabChange = (value: string) => {
    if (value === 'works') {
      loadWorks();
    } else if (value === 'budgets') {
      loadBudgets();
    }
  };
  
  const handleWorkDelete = async (workId: string) => {
    try {
      await remove(workId);

      toast({
        title: 'Obra eliminada',
        description: 'La obra se ha eliminado exitosamente.',
      });

    } catch (error) {
      const errorMessage = translateError(error);
      toast({
        variant: 'destructive',
        title: 'Error al eliminar la obra',
        description: errorMessage || 'Hubo un problema al eliminar la obra.',
      });
    }
  };

  const handleWorkCreated = async (
    workData: Omit<Work, 'id' | 'created_at' | 'client_id'>
  ) => {
    try {
      await create(workData);

      toast({
        title: 'Obra creada',
        description: 'La obra se ha creado exitosamente.',
      });

      setIsWorkFormOpen(false);

    } catch (error) {
      const errorMessage = translateError(error);
      toast({
        variant: 'destructive',
        title: 'Error al crear la obra',
        description: errorMessage || 'Hubo un problema al crear la obra.',
      });
    }
  };

  const handleBalanceCreated = async (balanceData: any) => {
    try {
      await createBalance(balanceData);

      toast({
        title: 'Saldo creado',
        description: 'El saldo se ha creado exitosamente.',
      });

      setIsBalanceFormOpen(false);
      await loadBudgets();

    } catch (error) {
      const errorMessage = translateError(error);
      toast({
        variant: 'destructive',
        title: 'Error al crear el saldo',
        description: errorMessage || 'Hubo un problema al crear el saldo.',
      });
    }
  };

  
  // Update local client data when client prop changes
  useEffect(() => {
    if (client) {
      setClientData(client);
      setCover(client.cover || '');
      setHasUnsavedChanges(false);
    }
  }, [client]);

  const handleCoverChange = (value: string) => {
    setCover(value);
    setHasUnsavedChanges(true);
  };

  const handleSaveCover = async () => {
    if (!client) return;
    
    try {
      setIsSavingCover(true);
      await updateClient(client.id, { cover });
      setClientData(prev => prev ? { ...prev, cover } : null);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error updating cover:', error);
    } finally {
      setIsSavingCover(false);
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
            <h3 className="text-lg text-center font-semibold mb-1">{clientData.last_name} {clientData.name}</h3>
            <div className="flex flex-wrap justify-center gap-6">
              {user?.role !== 'Colocador' && (
                <>
                  <div className="flex items-center justify-center">
                    <EmailLink email={clientData.email || ''} className="text-sm hover:underline">
                      {clientData.email}
                    </EmailLink>
                  </div>
                  <div className="flex items-center justify-center">
                    <WhatsAppLink 
                      phone={clientData.phone_number || ''} 
                      className="text-sm hover:underline"
                      message={`Hola ${clientData.name || ''}`}
                    >
                      {clientData.phone_number}
                    </WhatsAppLink>
                  </div>
                </>
              )}
              <div className="flex items-center justify-center gap-1 text-sm">
                <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className="text-xs">{clientData.locality}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-2">
            <Tabs defaultValue={user?.role === 'Admin' ? 'info' : 'images'} className="w-full" onValueChange={handleTabChange}>
              <TabsList>
                {user?.role !== 'Colocador' && (
                  <>
                    <TabsTrigger value="info">Información</TabsTrigger>
                    <TabsTrigger value="works">Obras</TabsTrigger>
                    <TabsTrigger value="budgets">Presupuestos</TabsTrigger>
                    <TabsTrigger value="balances">Saldos</TabsTrigger>
                  </>
                )}
                <TabsTrigger value="images">Archivos</TabsTrigger>
              </TabsList>
              
              <div className="mt-2">
                <TabsContent value="info">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-xs">Información adicional</h4>
                        <Button
                          size="sm"
                          onClick={handleSaveCover}
                          disabled={!hasUnsavedChanges || isSavingCover}
                        >
                          {isSavingCover ? 'Guardando...' : 'Guardar'}
                        </Button>
                      </div>
                      <Textarea
                        value={cover}
                        onChange={(e) => handleCoverChange(e.target.value)}
                        placeholder="Escribe aquí..."
                        className="min-h-[200px] bg-background"
                      />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="works" className="space-y-4">
                  <div>
                    {isLoading ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Cargando obras...
                      </p>
                    ) : works.length > 0 ? (
                      <WorksList 
                        works={works} 
                        onDelete={handleWorkDelete}
                        onCreateWork={() => setIsWorkFormOpen(true)}
                      />
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground mb-4">
                          No hay obras registradas para este cliente.
                        </p>
                        <Button 
                          onClick={() => setIsWorkFormOpen(true)}
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Crear primera obra
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="budgets">
                  <ClientBudgetsTab clientId={clientData.id} works={works} onBudgetsChange={loadBudgets} />
                </TabsContent>
                <TabsContent value="images" className="h-[calc(100%-2.5rem)]">
                  <ClientImagesGallery client={clientData} />
                </TabsContent>
                <TabsContent value="balances" className="space-y-4">
                  <ClientBalances 
                    key={balancesKey}
                    clientId={clientData.id}
                    onCreateBalance={async () => {
                      await loadBudgets();
                      setIsBalanceFormOpen(true);
                    }}
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
            clientId={client?.id || ''}
            budgets={budgets}
            onSubmit={handleBalanceCreated}
            onCancel={() => setIsBalanceFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

    </Dialog>
  );
}
