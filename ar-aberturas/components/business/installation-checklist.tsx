'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ClipboardCheck,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
  List,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { ChecklistCompletionModal } from '@/components/business/checklist-completion-modal';
import { listWorks } from '@/lib/works/works';
import { getChecklistsByWorkId } from '@/lib/works/checklists';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type Task = {
  id: string;
  name: string;
  completed: boolean;
};

import { AddressLink } from '@/components/ui/address-link';

type Installation = {
  id: string;
  clientName: string;
  address: string;
  locality?: string | null;
  date: string;
  status: 'pendiente' | 'en_progreso' | 'completada';
  tasks: Task[];
  notes: string[];
  progress: number;
  clientLastName: string;
};

type StatusFilter = 'todos' | 'pendiente' | 'en_progreso' | 'completada';

function StatusCard({
  label,
  count,
  icon: Icon,
  active,
  onClick,
  className = '',
  activeClassName = '',
}: {
  label: string;
  count: number;
  icon: any;
  active: boolean;
  onClick: () => void;
  className?: string;
  activeClassName?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors hover:bg-muted/50',
        'cursor-pointer w-full',
        active ? 'border-foreground/20 bg-muted/30' : 'border-border',
        className,
        active && activeClassName
      )}
    >
      <Icon className="h-6 w-6" />
      <span className="text-sm font-medium">{label}</span>
      <span className="text-2xl font-bold">{count}</span>
    </button>
  );
}

export function InstallationChecklist() {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        setLoading(true);
        const { data: works, error } = await listWorks();
        
        if (error) {
          console.error('Error al obtener las obras:', error);
          throw error;
        }
        
        if (!works || works.length === 0) {
          setInstallations([]);
          return;
        }

        // Obtener checklists para cada obra
        const worksWithChecklists = await Promise.all(
          works.map(async (work) => {
            const { data: checklists } = await getChecklistsByWorkId(work.id);
            
            // Calcular progreso basado en las checklists
            let progress = 0;
            let tasks: Task[] = [];
            
            if (checklists && checklists.length > 0) {
              // Aplanar todas las tareas de todas las checklists
              tasks = checklists.flatMap((checklist, index) => 
                (checklist.items || []).map((item, itemIndex) => ({
                  id: `${checklist.id}-${itemIndex}`,
                  name: item.name || `Tarea ${itemIndex + 1}`,
                  completed: item.done || false
                }))
              );
              
              // Calcular progreso
              const totalTasks = tasks.length;
              const completedTasks = tasks.filter(task => task.completed).length;
              progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            }
            
            // Determinar estado basado en el progreso
            let status: 'pendiente' | 'en_progreso' | 'completada' = 'pendiente';
            if (progress === 100) {
              status = 'completada';
            } else if (progress > 0) {
              status = 'en_progreso';
            }
            
            // Construir el nombre completo del cliente
            const clientName = [work.client_name, work.client_last_name]
              .filter(Boolean)
              .join(' ')
              .trim();
              
            console.log('Procesando obra:', {
              workId: work.id,
              clientId: work.client_id,
              clientName,
              client_name: work.client_name,
              client_last_name: work.client_last_name
            });
            
            return {
              id: work.id,
              clientName: clientName || 'Cliente no especificado',
              clientLastName: work.client_last_name || '',
              address: work.address || 'Dirección no especificada',
              locality: work.locality || null,
              date: work.created_at ? format(new Date(work.created_at), 'dd-MM-yyyy', { locale: es }) : 'Fecha no especificada',
              status,
              tasks,
              notes: work.notes || [],
              progress
            };
          })
        );
        
        setInstallations(worksWithChecklists);
      } catch (error) {
        console.error('Error al cargar las obras:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorks();
  }, []);

  const getProgress = (tasks: Task[]) => {
    const completed = tasks.filter((t) => t.completed).length;
    return (completed / tasks.length) * 100;
  };

  const pendingCount = installations.filter((i) => i.status === 'pendiente').length;
  const inProgressCount = installations.filter((i) => i.status === 'en_progreso').length;
  const completedCount = installations.filter((i) => i.status === 'completada').length;

  const filteredInstallations = installations.filter(installation => {
    // Apply status filter
    const matchesStatus = statusFilter === 'todos' || installation.status === statusFilter;
    
    // Apply search query filter
    const matchesSearch = searchQuery === '' || 
      (installation.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       installation.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       installation.clientLastName?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  const statusConfig = {
    pendiente: { label: 'Pendiente', icon: Clock, color: 'text-chart-3 bg-chart-3/10' },
    en_progreso: { label: 'En progreso', icon: AlertCircle, color: 'text-chart-1 bg-chart-1/10' },
    completada: { label: 'Completada', icon: CheckCircle2, color: 'text-accent bg-accent/10' },
  };

  const handleStatusFilter = (status: StatusFilter) => {
    setStatusFilter(status);
  };

  const handleSaveChecklists = (checklists: any) => {
    console.log('Checklists guardadas:', checklists);
   
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Checklist de obras</h2>
            <p className="text-muted-foreground mt-1">Seguimiento de instalaciones y tareas</p>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por dirección, nombre o apellido del cliente..."
            className="w-full pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card 
          className={cn(
            "p-6 bg-card border-border cursor-pointer transition-all hover:shadow-md",
            statusFilter === 'todos' ? 'ring-2 ring-primary' : ''
          )}
          onClick={() => handleStatusFilter('todos')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Todas</p>
              <p className="text-2xl font-bold text-foreground mt-2">{installations.length}</p>
            </div>
            <div className="rounded-lg bg-secondary p-3 text-foreground/80">
              <List className="h-6 w-6" />
            </div>
          </div>
        </Card>
        <Card 
          className={cn(
            "p-6 bg-card border-border cursor-pointer transition-all hover:shadow-md",
            statusFilter === 'pendiente' ? 'ring-2 ring-chart-3' : ''
          )}
          onClick={() => handleStatusFilter('pendiente')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
              <p className="text-2xl font-bold text-foreground mt-2">{pendingCount}</p>
            </div>
            <div className="rounded-lg bg-secondary p-3 text-chart-3">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </Card>
        <Card 
          className={cn(
            "p-6 bg-card border-border cursor-pointer transition-all hover:shadow-md",
            statusFilter === 'en_progreso' ? 'ring-2 ring-chart-1' : ''
          )}
          onClick={() => handleStatusFilter('en_progreso')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">En progreso</p>
              <p className="text-2xl font-bold text-foreground mt-2">{inProgressCount}</p>
            </div>
            <div className="rounded-lg bg-secondary p-3 text-chart-1">
              <AlertCircle className="h-6 w-6" />
            </div>
          </div>
        </Card>
        <Card 
          className={cn(
            "p-6 bg-card border-border cursor-pointer transition-all hover:shadow-md",
            statusFilter === 'completada' ? 'ring-2 ring-accent' : ''
          )}
          onClick={() => handleStatusFilter('completada')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completadas</p>
              <p className="text-2xl font-bold text-foreground mt-2">{completedCount}</p>
            </div>
            <div className="rounded-lg bg-secondary p-3 text-accent">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Installations list */}
      <div className="space-y-4">
        {filteredInstallations.map((installation) => {
          const progress = getProgress(installation.tasks);
          const statusInfo = statusConfig[installation.status];
          const StatusIcon = statusInfo.icon;

          return (
            <Card key={installation.id} className="bg-card border-border">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                        <ClipboardCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-foreground">
                            {installation.id}
                          </h3>
                          <Badge variant="outline" className={`gap-1 ${statusInfo.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground mt-1">{installation.clientName}</p>
                      </div>
                    </div>

                    <div className="grid gap-2 md:grid-cols-3 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <AddressLink 
                          address={installation.address} 
                          locality={installation.locality}
                          className="text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>{installation.date}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progreso</span>
                        <div className="text-sm text-muted-foreground">
                          Progreso: {installation.progress}%
                        </div>
                      </div>
                      <Progress value={installation.progress} className="h-2" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <ChecklistCompletionModal workId={installation.id}>
                      <Button variant="outline" size="sm">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Ver Checklist
                      </Button>
                    </ChecklistCompletionModal>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
