import { User, Package, Wrench, MoreHorizontal } from 'lucide-react';
import { Clock, CheckCircle } from 'lucide-react';

export const typeConfig = {
	produccionOK: { label: 'Producción OK', icon: Package, color: 'bg-chart-1 text-chart-1', backgroundColor: '#0b96f3ff' },
	colocacion: { label: 'Colocación', icon: Wrench, color: 'bg-chart-2 text-chart-2', backgroundColor:'#0bf38fff' },
	medicion: { label: 'Medición', icon: User, color: 'bg-chart-3 text-chart-3', backgroundColor: '#f3a40bff' },
	otros: { label: 'Otros', icon: MoreHorizontal, color: 'bg-gray-400 text-gray-400', backgroundColor: '#a0a0a0ff' },
};

export const statusOptions = [
		{ value: 'Pendiente', label: 'Pendiente', icon: Clock, color: 'text-gray-400' },
		{ value: 'Finalizado', label: 'Finalizado', icon: CheckCircle, color: 'text-green-500' },
	];