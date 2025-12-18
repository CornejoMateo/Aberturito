'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
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
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { listWorks } from '@/lib/works/works';
import { getChecklistsByWorkId } from '@/lib/works/checklists';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type Task = {
  id: string;
  name: string;
  completed: boolean;
};

type Installation = {
  id: string;
  clientName: string;
  address: string;
  date: string;
  status: 'pendiente' | 'en_progreso' | 'completada';
  installer: string;
  tasks: Task[];
  notes: string[];
  progress: number;
};

export function InstallationChecklist() {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedInstallation, setExpandedInstallation] = useState<string | null>('OBR-001');

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        setLoading(true);
        const { data: works, error } = await listWorks();
        
        if (error) throw error;
        if (!works) {
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
            
            return {
              id: work.id,
              clientName: work.client_id ? `Cliente ${work.client_id}` : 'Cliente no especificado',
              address: work.address || 'Dirección no especificada',
              date: work.created_at ? format(new Date(work.created_at), 'yyyy-MM-dd', { locale: es }) : 'Fecha no especificada',
              status,
              installer: 'Instalador no asignado', // Por ahora lo dejamos fijo
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

  const toggleTask = async (installationId: string, taskId: string) => {
    // En una implementación real, aquí deberías hacer una llamada a la API
    // para actualizar el estado de la tarea en la base de datos
    console.log(`Tarea ${taskId} de la obra ${installationId} actualizada`);
    
    // Actualización optimista del estado local
    setInstallations(prevInstallations =>
      prevInstallations.map(installation => {
        if (installation.id === installationId) {
          const updatedTasks = installation.tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          );
          
          // Actualizar progreso
          const totalTasks = updatedTasks.length;
          const completedTasks = updatedTasks.filter(task => task.completed).length;
          const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
          
          // Actualizar estado basado en el progreso
          let status = installation.status;
          if (progress === 100) {
            status = 'completada';
          } else if (progress > 0) {
            status = 'en_progreso';
          } else {
            status = 'pendiente';
          }
          
          return {
            ...installation,
            tasks: updatedTasks,
            status,
            progress
          };
        }
        return installation;
      })
    );
  };

  const getProgress = (tasks: Task[]) => {
    const completed = tasks.filter((t) => t.completed).length;
    return (completed / tasks.length) * 100;
  };

  const pendingCount = installations.filter((i) => i.status === 'pendiente').length;
  const inProgressCount = installations.filter((i) => i.status === 'en_progreso').length;
  const completedCount = installations.filter((i) => i.status === 'completada').length;

  const statusConfig = {
    pendiente: { label: 'Pendiente', icon: Clock, color: 'text-chart-3 bg-chart-3/10' },
    en_progreso: { label: 'En progreso', icon: AlertCircle, color: 'text-chart-1 bg-chart-1/10' },
    completada: { label: 'Completada', icon: CheckCircle2, color: 'text-accent bg-accent/10' },
  };

  const handleSaveChecklists = (checklists: any) => {
    console.log('Checklists guardadas:', checklists);
    // Aquí puedes guardar las checklists en tu estado o base de datos
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Checklist de obras</h2>
          <p className="text-muted-foreground mt-1">Seguimiento de instalaciones y tareas</p>
        </div>
        <div className="flex gap-2">
          {/* Buttons removed for installer view */}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6 bg-card border-border">
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
        <Card className="p-6 bg-card border-border">
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
        <Card className="p-6 bg-card border-border">
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
        {installations.map((installation) => {
          const progress = getProgress(installation.tasks);
          const statusInfo = statusConfig[installation.status];
          const StatusIcon = statusInfo.icon;
          const isExpanded = expandedInstallation === installation.id;

          return (
            <Card key={installation.id} className="bg-card border-border overflow-hidden">
              <Collapsible
                open={isExpanded}
                onOpenChange={() => setExpandedInstallation(isExpanded ? null : installation.id)}
              >
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
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{installation.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span>{installation.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <ClipboardCheck className="h-4 w-4 flex-shrink-0" />
                          <span>{installation.installer}</span>
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

                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>

                <CollapsibleContent>
                  <div className="border-t border-border p-6 space-y-6 bg-secondary/30">
                    {/* Tasks checklist */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3">Tareas</h4>
                      <div className="space-y-2">
                        {installation.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
                          >
                            <Checkbox
                              id={`${installation.id}-${task.id}`}
                              checked={task.completed}
                              onCheckedChange={() => toggleTask(installation.id, task.id)}
                              className="flex-shrink-0"
                            />
                            <label
                              htmlFor={`${installation.id}-${task.id}`}
                              className={`flex-1 text-sm cursor-pointer ${
                                task.completed
                                  ? 'line-through text-muted-foreground'
                                  : 'text-foreground'
                              }`}
                            >
                              {task.name}
                            </label>
                            {task.completed && (
                              <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>
                      <Progress
                        value={installation.progress}
                        className="h-2 mt-1"
                      />
                    </div>

                    {/* Notes */}
                    {installation.notes.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3">
                          Notas y pendientes
                        </h4>
                        <div className="space-y-2">
                          {installation.notes.map((note, index) => (
                            <div
                              key={index}
                              className="flex gap-2 p-3 rounded-lg bg-card border border-border"
                            >
                              <AlertCircle className="h-4 w-4 text-chart-3 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-muted-foreground">{note}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
