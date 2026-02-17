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
import { createWork, getWorksByClientId, Work, deleteWork } from '@/lib/works/works';
import { WorksList } from '@/utils/works/works-list';
import { ClientNotes } from '@/utils/notes/client-notes';
import { updateClient } from '@/lib/clients/clients';
import { ClientBalances } from '@/utils/balances/client-balances';
import { BalanceForm } from '@/utils/balances/balance-form';
import { createBalance, BudgetWithWork } from '@/lib/works/balances';
import { toast } from '@/components/ui/use-toast';
import { ClientBudgetsTab } from '@/utils/budgets/client-budgets-tab';
import { getFolderBudgetsByClientId } from '@/lib/budgets/folder_budgets';
import { getBudgetsByFolderBudgetIds } from '@/lib/budgets/budgets';

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
  const [budgets, setBudgets] = useState<BudgetWithWork[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [clientData, setClientData] = useState<Client | null>(null);
  const [cover, setCover] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSavingCover, setIsSavingCover] = useState(false);
  const [balancesKey, setBalancesKey] = useState(0);
  const [worksLoaded, setWorksLoaded] = useState(false);
  const [budgetsLoaded, setBudgetsLoaded] = useState(false);
  
  // function to load works when the works tab is opened for the first time
  const loadWorks = async (force = false) => {
    if (!client || (!force && worksLoaded)) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await getWorksByClientId(client.id);
      
      if (error) {
        console.error('Error al cargar obras:', error);
        setWorks([]);
      } else {
        setWorks(data || []);
        setWorksLoaded(true);
      }
    } catch (error) {
      console.error('Error inesperado al cargar obras:', error);
      setWorks([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // function to load budgets when the budgets tab is opened for the first time
  const loadBudgets = async (force = false) => {
    if (!client || (!force && budgetsLoaded)) return;
    
    try {
      const { data: folderBudgets } = await getFolderBudgetsByClientId(client.id);
      
      if (folderBudgets && folderBudgets.length > 0) {
        const folderBudgetIds = folderBudgets.map((f) => f.id);
        const { data: budgetsData } = await getBudgetsByFolderBudgetIds(folderBudgetIds);
        
        if (budgetsData) {
          setBudgets(budgetsData);
          setBudgetsLoaded(true);
        }
      } else {
        setBudgets([]);
        setBudgetsLoaded(true);
      }
    } catch (error) {
      console.error('Error al cargar presupuestos:', error);
      setBudgets([]);
    }
  };
  
  const handleTabChange = (value: string) => {
    if (value === 'works') {
      loadWorks();
    } else if (value === 'budgets') {
      loadBudgets();
    }
  };
  
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
      await loadWorks(true);
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
      await loadWorks(true);
      
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
      await loadBudgets(true);
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
      setCover(client.cover || '');
      setHasUnsavedChanges(false);
      // Reset loaded flags when client changes
      setWorksLoaded(false);
      setBudgetsLoaded(false);
      setWorks([]);
      setBudgets([]);
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
            <h3 className="text-lg text-center font-semibold mb-1">{clientData.name} {clientData.last_name}</h3>
            <div className="flex flex-wrap justify-center gap-6">
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
              <div className="flex items-center justify-center gap-1 text-sm">
                <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className="text-xs">{clientData.locality}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-2">
            <Tabs defaultValue="info" className="w-full" onValueChange={handleTabChange}>
              <TabsList>
                <TabsTrigger value="info">Información</TabsTrigger>
                <TabsTrigger value="works">Obras</TabsTrigger>
                <TabsTrigger value="budgets">Presupuestos</TabsTrigger>
                <TabsTrigger value="balances">Saldos</TabsTrigger>
                <TabsTrigger value="notes">Notas</TabsTrigger>
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
                  <ClientBudgetsTab clientId={clientData.id} works={works} onBudgetsChange={setBudgets} />
                </TabsContent>
                <TabsContent value="notes" className="h-[calc(100%-2.5rem)]">
                  <ClientNotes 
                    client={clientData} 
                    onNotesUpdate={handleNotesUpdate} 
                  />
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
