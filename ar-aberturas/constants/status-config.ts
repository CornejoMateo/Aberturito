import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export const statusConfig = {
    pendiente: { label: 'Pendiente', icon: Clock, color: 'text-chart-3 bg-chart-3/10' },
    en_progreso: { label: 'En progreso', icon: AlertCircle, color: 'text-chart-1 bg-chart-1/10' },
    completada: { label: 'Completada', icon: CheckCircle2, color: 'text-accent bg-accent/10' },
};

export type StatusFilter = 'todos' | 'pendiente' | 'en_progreso' | 'completada';
