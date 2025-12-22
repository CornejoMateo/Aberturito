'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Work, updateWork } from '@/lib/works/works';
import { getChecklistsByWorkId, createChecklist, deleteChecklist } from '@/lib/works/checklists';
import { MapPin, Calendar, Building2, CheckCircle, Clock, Trash2, ListChecks, ChevronDown, Search, CheckSquare } from 'lucide-react';
import { ChecklistModal } from '@/utils/checklists/checklist-modal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useMemo, useEffect } from 'react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { DeleteWorkDialog } from '@/utils/works/delete-work-dialog';
import { EditableField } from '@/utils/works/editable-field';

interface WorksListProps {
  works: Work[];
  onDelete?: (workId: string) => Promise<void>;
  onWorkUpdated?: (updatedWork: Work) => void;
}

export function WorksList({ works: initialWorks, onDelete, onWorkUpdated }: WorksListProps) {
  const [workToDelete, setWorkToDelete] = useState<{id: string, address: string} | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [works, setWorks] = useState<Work[]>(initialWorks);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [workChecklists, setWorkChecklists] = useState<Record<string, boolean>>({});
  const [loadingChecklists, setLoadingChecklists] = useState<Record<string, boolean>>({});
  const itemsPerPage = 6;
  
  // Filter works based on search term and filters
  const filteredWorks = useMemo(() => {
    return initialWorks.filter(work => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        (work.architect?.toLowerCase().includes(searchLower) || 
         work.address?.toLowerCase().includes(searchLower) ||
         work.status?.toLowerCase().includes(searchLower));
      
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'pendiente' && (!work.status || work.status === 'Pendiente')) ||
        work.status?.toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    });
  }, [initialWorks, searchTerm, statusFilter]);

  // Update local works when filteredWorks changes
  useEffect(() => {
    setWorks(filteredWorks);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filteredWorks]);
  
  // Call onWorkUpdated when works change
  useEffect(() => {
    if (works !== initialWorks && workToDelete?.id) {
      const updatedWork = works.find(work => work.id === workToDelete.id);
      if (updatedWork) {
        onWorkUpdated?.(updatedWork);
      }
    }
  }, [works, initialWorks, workToDelete?.id, onWorkUpdated]);
  const statusOptions = [
    { value: 'Pendiente', label: 'Pendiente', icon: <Clock className="h-4 w-4 text-gray-400" /> },
    { value: 'En progreso', label: 'En progreso', icon: <Clock className="h-4 w-4 text-yellow-500" /> },
    { value: 'Finalizado', label: 'Finalizado', icon: <CheckCircle className="h-4 w-4 text-green-500" /> },
  ];

  const getStatusIcon = (status: string | null | undefined) => {
    const statusValue = status || 'Pendiente';
    const statusInfo = statusOptions.find(opt => opt.value === statusValue) || statusOptions[0];
    return statusInfo.icon;
  };

  const getStatusLabel = (status: string | null | undefined) => {
    const statusValue = status || 'Pendiente';
    const statusInfo = statusOptions.find(opt => opt.value === statusValue) || statusOptions[0];
    return statusInfo.label;
  };

  const handleDeleteConfirm = async () => {
    if (workToDelete) {
      await onDelete?.(workToDelete.id);
      setIsDeleteDialogOpen(false);
      setWorkToDelete(null);
    }
  };

  const handleUpdateWork = async (workId: string, updates: Partial<Work>) => {
    try {
      // Optimistically update the UI
      setWorks(prevWorks => 
        prevWorks.map(work => 
          work.id === workId ? { ...work, ...updates } as Work : work
        )
      );
      
      // Make the API call
      const { data: updatedWork, error } = await updateWork(workId, updates);
      
      if (error) {
        // Revert the optimistic update if there's an error
        setWorks(initialWorks);
        throw error;
      }
      
      // Ensure the UI is in sync with the server
      const updatedWorkData = { ...updatedWork, ...updates } as Work;
      setWorks(prevWorks => 
        prevWorks.map(work => 
          work.id === workId ? updatedWorkData : work
        )
      );
      
      // Notify parent component about the update
      onWorkUpdated?.(updatedWorkData);
      
      return updatedWorkData;
    } catch (error) {
      console.error('Error updating work:', error);
      throw error;
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(works.length / itemsPerPage);
  
  // Get current items
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return works.slice(startIndex, startIndex + itemsPerPage);
  }, [works, currentPage, itemsPerPage]);

  // Reset to first page when works change
  useEffect(() => {
    setCurrentPage(1);
  }, [works.length]);

  // Check if works have checklists
  useEffect(() => {
    const checkWorkChecklists = async () => {
      const newWorkChecklists: Record<string, boolean> = {};
      const newLoadingChecklists: Record<string, boolean> = {};
      
      // Initialize loading state
      works.forEach(work => {
        newLoadingChecklists[work.id] = true;
      });
      setLoadingChecklists(newLoadingChecklists);
      
      // Check each work for checklists
      const checklistPromises = works.map(async (work) => {
        try {
          const { data: checklists, error } = await getChecklistsByWorkId(work.id);
          if (error) {
            console.error('Error checking checklists for work:', work.id, error);
            newWorkChecklists[work.id] = false;
          } else {
            newWorkChecklists[work.id] = !!(checklists && checklists.length > 0);
          }
        } catch (error) {
          console.error('Error checking checklists for work:', work.id, error);
          newWorkChecklists[work.id] = false;
        } finally {
          setLoadingChecklists(prev => ({ ...prev, [work.id]: false }));
        }
      });
      
      await Promise.all(checklistPromises);
      setWorkChecklists(newWorkChecklists);
    };
    
    if (works.length > 0) {
      checkWorkChecklists();
    }
  }, [works]);

  return (
    <div className="space-y-4 max-w-3xl mx-auto w-full">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por dirección, arquitecto o estado..."
            className="pl-9 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="en progreso">En progreso</SelectItem>
            <SelectItem value="finalizado">Finalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DeleteWorkDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        workAddress={workToDelete?.address || ''}
      />
      {currentItems.map((work) => (
        <Card key={work.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <EditableField
                  value={work.address || ''}
                  onSave={async (newValue) => {
                    await handleUpdateWork(work.id, { address: newValue });
                  }}
                  label="Dirección"
                  className="text-lg font-semibold"
                />
                <EditableField
                  value={work.locality || ''}
                  onSave={async (newValue) => {
                    await handleUpdateWork(work.id, { locality: newValue });
                  }}
                  className="text-sm text-muted-foreground"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm text-muted-foreground group">
                  <select
                    value={work.status || 'Pendiente'}
                    onChange={async (e) => {
                      await handleUpdateWork(work.id, { status: e.target.value });
                    }}
                    className="bg-transparent border-none focus:ring-0 focus:ring-offset-0 p-1 pr-6 appearance-none focus:outline-none cursor-pointer hover:bg-muted rounded-md"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="h-3.5 w-3.5 -ml-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-center gap-1">
                  {loadingChecklists[work.id] ? (
                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/20 border-t-muted-foreground animate-spin" />
                  ) : workChecklists[work.id] ? (
                    <div className="flex items-center gap-1 text-green-600" title="Checklist creada">
                      <CheckSquare className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-gray-400" title="Sin checklist">
                      <CheckSquare className="h-4 w-4" />
                    </div>
                  )}
                </div>
                {onDelete && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 -mr-5 -mt-11 text-muted-foreground hover:text-destructive p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setWorkToDelete({ id: work.id, address: work.address || ''});
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
                <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <EditableField
                  value={work.architect || ''}
                  onSave={async (newValue) => {
                    await handleUpdateWork(work.id, { architect: newValue });
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <EditableField
                  value={work.locality || ''}
                  onSave={async (newValue) => {
                    await handleUpdateWork(work.id, { locality: newValue });
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {work.created_at
                    ? format(new Date(work.created_at), 'PPP', { locale: es })
                    : 'Sin fecha'}
                </span>
              </div>
              <div className="flex items-end justify-between w-full -mx-3 px-3 pb-1">
                <ChecklistModal 
                  workId={work.id}
                  opening_type="pvc"
                  existingChecklists={workChecklists[work.id] ? true : false}
                  onSave={async (checklists) => {
                    try {
                      // Get existing checklists to calculate the next index
                      const { data: existingChecklists, error: fetchError } = await getChecklistsByWorkId(work.id);
                      
                      if (fetchError) throw fetchError;
                      
                      const existingCount = existingChecklists?.length || 0;
                      
                      // Create new checklists (add to existing ones)
                      const createPromises = checklists.map((checklist, index) => {
                        return createChecklist({
                          work_id: work.id,
                          name: checklist.name || `Abertura ${existingCount + index + 1}`,
                          description: checklist.description || '',
                          width: checklist.width || null,
                          height: checklist.height || null,
                          type_opening: 'pvc', // assuming PVC for now,
                          items: checklist.items.map(item => ({
                            name: item.name,
                            done: item.completed,
                            key: 0
                          })),
                          progress: 0,
                        });
                      });
                      
                      await Promise.all(createPromises);
                      
                      // Update checklist status
                      setWorkChecklists(prev => ({
                        ...prev,
                        [work.id]: true
                      }));
                      
                      // Update local state if needed
                      if (onWorkUpdated) {
                        const updatedWork = {
                          ...work,
                          has_checklist: true,
                          updated_at: new Date().toISOString()
                        };
                        onWorkUpdated(updatedWork);
                      }
                      
                      console.log('Checklists guardadas exitosamente');
                    } catch (error) {
                      console.error('Error al guardar las checklists:', error);
                    }
                  }}
                >
                </ChecklistModal>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Pagination */}
      {works.length > itemsPerPage && (
        <div className="flex items-center justify-between px-2 mt-6">
          <div className="text-sm text-muted-foreground">
            Mostrando {Math.min(
              (currentPage - 1) * itemsPerPage + 1,
              works.length
            )}
            -{Math.min(
              currentPage * itemsPerPage,
              works.length
            )} de {works.length} obras
          </div>
          
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5) {
                  if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                }
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      isActive={currentPage === pageNum}
                      className="cursor-pointer"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
