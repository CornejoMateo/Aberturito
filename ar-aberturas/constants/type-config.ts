import { User, Package, Wrench, MoreHorizontal } from 'lucide-react';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

export const typeConfig = {
	produccionOK: { label: 'Producción OK', icon: Package, color: 'bg-chart-1 text-chart-1', backgroundColor: '#0b96f3ff' },
	colocacion: { label: 'Colocación', icon: Wrench, color: 'bg-chart-2 text-chart-2', backgroundColor:'#0bf38fff' },
	medicion: { label: 'Medición', icon: User, color: 'bg-chart-3 text-chart-3', backgroundColor: '#f3a40bff' },
	otros: { label: 'Otros', icon: MoreHorizontal, color: 'bg-gray-400 text-gray-400', backgroundColor: '#a0a0a0ff' },
};

export const statusOptions = [
	{ value: 'pending', label: 'Pendiente', icon: Clock, color: 'text-gray-400' },
	{ value: 'in_progress', label: 'En progreso', icon: AlertCircle, color: 'text-yellow-500' },
	{ value: 'completed', label: 'Finalizada', icon: CheckCircle, color: 'text-green-500' },
];

export const statusConfig = [
	{value: 'pending', label: 'Pendiente', icon: Clock, color: 'text-chart-3 bg-chart-3/10' },
	{value: 'in_progress', label: 'En progreso', icon: AlertCircle, color: 'text-chart-1 bg-chart-1/10' },
	{value: 'completed', label: 'Finalizada', icon: CheckCircle, color: 'text-accent bg-accent/10' },
];

export type StatusFilter = 'todos' | 'pending' | 'in_progress' | 'completed';
