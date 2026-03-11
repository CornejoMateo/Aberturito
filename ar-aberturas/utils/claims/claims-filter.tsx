import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Clock, CheckCircle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FilterType } from '@/constants/claims/filters';

interface Props {
	filterType: FilterType;
	setFilterType: (v: FilterType) => void;
	searchTerm: string;
	setSearchTerm: (v: string) => void;
}

export function ClaimsFilter({ filterType, setFilterType, searchTerm, setSearchTerm }: Props) {
	return (
		<Card className="p-4 bg-card border-border">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="flex flex-wrap gap-2 items-center">
					<div className="flex flex-wrap gap-2">
						<Button
							variant={filterType === 'todos' ? 'default' : 'outline'}
							size="sm"
							onClick={() => setFilterType('todos')}
						>
							Todos
						</Button>
						<Button
							variant={filterType === 'pendientes' ? 'default' : 'outline'}
							size="sm"
							onClick={() => setFilterType('pendientes')}
							className={cn(filterType === 'pendientes' && 'bg-orange-500 hover:bg-orange-600')}
						>
							<Clock className="h-4 w-4 mr-2" />
							Pendientes
						</Button>
						<Button
							variant={filterType === 'resueltos' ? 'default' : 'outline'}
							size="sm"
							onClick={() => setFilterType('resueltos')}
							className={cn(filterType === 'resueltos' && 'bg-green-500 hover:bg-green-600')}
						>
							<CheckCircle className="h-4 w-4 mr-2" />
							Resueltos
						</Button>
					</div>
					<div className="h-8 w-px bg-border mx-2" />
					<div className="flex flex-wrap gap-2">
						<Button
							variant={filterType === 'diario' ? 'default' : 'outline'}
							size="sm"
							onClick={() => setFilterType('diario')}
							className={cn(filterType === 'diario' && 'bg-blue-500 hover:bg-blue-600')}
						>
							<FileText className="h-4 w-4 mr-2" />
							Actividades diarias
						</Button>
					</div>
				</div>
				<div className="relative flex-1 md:max-w-sm">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Buscar por descripción, cliente, zona, localidad, dirección..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-9 bg-background"
					/>
				</div>
			</div>
		</Card>
	);
}
