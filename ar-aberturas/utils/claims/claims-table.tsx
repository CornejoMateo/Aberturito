import { Claim } from '@/lib/claims/claims';
import {
	Table,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Edit, Trash2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
	claims: Claim[];
	loading: boolean;
	onEdit: (claim: Claim) => void;
	onDelete: (claim: Claim) => void;
	onResolve: (claim: Claim) => void;
    onReOpen: (claim: Claim) => void;
	authorizedUser: boolean;
	filterType: string;
	onViewDescription: (description: string) => void;
	onViewImages: (claim: Claim) => void;
}

export function ClaimsTable({
	claims,
	loading,
	onEdit,
	onDelete,
	onResolve,
    onReOpen,
	authorizedUser,
	filterType,
	onViewDescription,
	onViewImages,
}: Props) {
	function formatDate(date: string): string {
		const [year, month, day] = date.split('-');
		return `${day}-${month}-${year}`;
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="text-center">Estado</TableHead>
					<TableHead className="text-center">Fecha</TableHead>
					<TableHead className="text-center">Cliente</TableHead>
					<TableHead className="text-center">Núm. de celular</TableHead>
					<TableHead className="text-center">Zona/Localidad</TableHead>
					<TableHead className="text-center">Dirección</TableHead>
					<TableHead className="text-center">Tipo</TableHead>
					<TableHead className="lg:table-cell text-center">Descripción</TableHead>
					{authorizedUser && <TableHead className="text-center">Atendido por</TableHead>}
					<TableHead className="text-center">Fecha de resolución</TableHead>
					{authorizedUser && <TableHead className="text-center">Acciones</TableHead>}
				</TableRow>
			</TableHeader>
			<TableBody>
				{loading ? (
					<TableRow>
						<TableCell colSpan={11} className="text-center py-8">
							{filterType === 'diario' ? 'Cargando actividades diarias...' : 'Cargando reclamos...'}
						</TableCell>
					</TableRow>
				) : claims.length === 0 ? (
					<TableRow>
						<TableCell colSpan={11} className="text-center py-8">
							<div className="flex flex-col items-center gap-2">
								<AlertCircle className="h-8 w-8 text-muted-foreground" />
								<p className="text-muted-foreground">
									{filterType === 'diario'
										? 'No se encontraron actividades diarias.'
										: 'No se encontraron reclamos.'}
								</p>
							</div>
						</TableCell>
					</TableRow>
				) : (
					claims.map((claim: Claim) => (
						<TableRow key={claim.id} className={cn(claim.resolved && 'bg-green-300')}>
							<TableCell className="text-center">
								<Badge variant={claim.resolved ? 'default' : 'secondary'}>
									{claim.resolved ? (
										<>
											<CheckCircle className="h-3 w-3 mr-1" />
											Resuelto
										</>
									) : (
										<>
											<Clock className="h-3 w-3 mr-1" />
											Pendiente
										</>
									)}
								</Badge>
							</TableCell>
							<TableCell className="whitespace-nowrap text-center">
								{formatDate(claim.date || '')}
							</TableCell>
							<TableCell className="text-center">{claim.client_name || '-'}</TableCell>
							<TableCell className="text-center">{claim.client_phone || '-'}</TableCell>
							<TableCell>
								<div className="text-sm text-center">
									<div>{claim.work_zone || '-'}</div>
									{claim.work_locality && (
										<div className="text-muted-foreground text-xs">{claim.work_locality}</div>
									)}
								</div>
							</TableCell>
							<TableCell className="text-center">
								<div className="max-w-xs truncate">{claim.work_address || '-'}</div>
							</TableCell>
							<TableCell className="text-center">
								<Badge variant="outline">{claim.alum_pvc || '-'}</Badge>
							</TableCell>
							<TableCell className="lg:table-cell max-w-xs text-center">
								<div
									className="truncate cursor-pointer hover:text-primary transition-colors"
									onClick={() => {
										onViewDescription(claim.description || '');
										onViewImages(claim);
									}}
									title="Click para ver descripción completa"
								>
									{claim.description || '-'}
								</div>
							</TableCell>
							{authorizedUser && (
								<TableCell className="text-center">{claim.attend || '-'}</TableCell>
							)}
							<TableCell className="text-center whitespace-nowrap">
								{claim.resolved ? formatDate(claim.resolution_date || '') : '-'}
							</TableCell>
							{authorizedUser && (
								<TableCell className="text-center">
									<div className="items-center justify-end gap-2">
										<Button
											variant="ghost"
											size="sm"
											onClick={() => onEdit(claim)}
											className="h-8 w-8 p-0"
										>
											<Edit className="h-4 w-4" />
										</Button>
										{!claim.resolved && (
											<Button
												variant="ghost"
												size="sm"
												onClick={() => onResolve(claim)}
												className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
											>
												<CheckCircle className="h-4 w-4" />
											</Button>
										)}
										{claim.resolved && (
											<Button
												variant="ghost"
												size="sm"
												onClick={() => onReOpen(claim)}
												className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
											>
												<Clock className="h-4 w-4" />
											</Button>
										)}
										<Button
											variant="ghost"
											size="sm"
											onClick={() => onDelete(claim)}
											className="h-8 w-8 p-0 text-destructive hover:text-destructive"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</TableCell>
							)}
						</TableRow>
					))
				)}
			</TableBody>
		</Table>
	);
}
