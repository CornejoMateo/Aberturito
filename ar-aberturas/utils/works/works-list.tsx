'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Work, updateWork } from '@/lib/works/works';
import { MapPin, Calendar, Building2, CheckCircle, Clock, Trash2, ListChecks, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { useState, useMemo, useEffect } from 'react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { DeleteWorkDialog } from '@/utils/works/delete-work-dialog';
import { EditableField } from '@/utils/works/editable-field';

interface WorksListProps {
  works: Work[];
  onDelete?: (workId: string) => Promise<void>;
}

export function WorksList({ works, onDelete }: WorksListProps) {
  const [workToDelete, setWorkToDelete] = useState<{id: string, address: string} | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
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
      const { data: updatedWork, error } = await updateWork(workId, updates);
      if (error) throw error;
      return updatedWork;
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

  return (
    <div className="space-y-4 max-w-3xl mx-auto w-full">
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
                <div className="flex items-center gap-0 flex-wrap">
                  <span className="font-medium whitespace-nowrap">Entregado:</span>
                  <EditableField
                    value={work.transfer?.toString() || '0'}
                    onSave={async (newValue) => {
                      const numValue = parseFloat(newValue.replace(/[^0-9.]/g, '')) || 0;
                      await handleUpdateWork(work.id, { transfer: numValue });
                    }}
                    className="truncate"
                    formatDisplay={(value) => `$${parseFloat(value || '0').toLocaleString('es-AR')}`}
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 px-2 text-xs -mr-10 -mb-5"
                >
                  <ListChecks className="h-4 w-4 mr-1.5" />
                  <span>Checklist</span>
                </Button>
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
