import { User, Package, Wrench, MoreHorizontal } from 'lucide-react';

export const typeConfig = {
	produccionOK: { label: 'Producción OK', icon: Package, color: 'bg-chart-1 text-chart-1' },
	colocacion: { label: 'Colocación', icon: Wrench, color: 'bg-chart-2 text-chart-2' },
	medicion: { label: 'Medición', icon: User, color: 'bg-chart-3 text-chart-3' },
	otros: { label: 'Otros', icon: MoreHorizontal, color: 'bg-gray-400 text-gray-400' },
};
