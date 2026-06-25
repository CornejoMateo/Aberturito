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
		return `${day}/${month}/${year}`;
	}

	return (
		<>
			{/* Desktop Table View */}
			<div className="hidden md:block">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="text-center">Estado</TableHead>
							<TableHead className="text-center">Fecha</TableHead>
							<TableHead className="text-center">Cliente</TableHead>
							<TableHead className="text-center">Núm. de celular</TableHead>
							<TableHead className="text-center">Zona/Localidad</TableHead>
							<TableHead className="text-center">Dirección/Barrio</TableHead>
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
										{claim.work_hood && (
											<div className="text-muted-foreground text-xs">{claim.work_hood}</div>
										)}
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
			</div>

			{/* Mobile Card View */}
			<div className="md:hidden space-y-3">
				{loading ? (
					<div className="text-center py-8 text-muted-foreground">
						{filterType === 'diario' ? 'Cargando actividades diarias...' : 'Cargando reclamos...'}
					</div>
				) : claims.length === 0 ? (
					<div className="text-center py-8">
						<div className="flex flex-col items-center gap-2">
							<AlertCircle className="h-8 w-8 text-muted-foreground" />
							<p className="text-muted-foreground">
								{filterType === 'diario'
									? 'No se encontraron actividades diarias.'
									: 'No se encontraron reclamos.'}
							</p>
						</div>
					</div>
				) : (
					claims.map((claim: Claim) => (
						<div
							key={claim.id}
							className={`p-4 rounded-lg border space-y-3 ${claim.resolved ? 'bg-green-50 border-green-300' : 'bg-card border-border'}`}
						>
							<div className="flex items-start justify-between gap-2">
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
								{authorizedUser && (
									<div className="flex gap-1">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => onEdit(claim)}
											className="h-8 w-8"
										>
											<Edit className="h-4 w-4" />
										</Button>
										{!claim.resolved && (
											<Button
												variant="ghost"
												size="icon"
												onClick={() => onResolve(claim)}
												className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
											>
												<CheckCircle className="h-4 w-4" />
											</Button>
										)}
										{claim.resolved && (
											<Button
												variant="ghost"
												size="icon"
												onClick={() => onReOpen(claim)}
												className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
											>
												<Clock className="h-4 w-4" />
											</Button>
										)}
										<Button
											variant="ghost"
											size="icon"
											onClick={() => onDelete(claim)}
											className="h-8 w-8 text-destructive hover:text-destructive"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								)}
							</div>

							<div className="space-y-2">
								<div className="flex items-center gap-2 text-sm">
									<span className="font-medium">{claim.client_name || '-'}</span>
									{claim.client_phone && (
										<span className="text-muted-foreground text-xs">{claim.client_phone}</span>
									)}
								</div>

								<div className="text-xs text-muted-foreground">
									{formatDate(claim.date || '')}
								</div>

								{(claim.work_zone || claim.work_locality) && (
									<div className="text-xs">
										{claim.work_zone && <span>{claim.work_zone}</span>}
										{claim.work_zone && claim.work_locality && <span>, </span>}
										{claim.work_locality && <span className="text-muted-foreground">{claim.work_locality}</span>}
									</div>
								)}

								{(claim.work_address || claim.work_hood) && (
									<div className="text-xs">
										{claim.work_address && <span>{claim.work_address}</span>}
										{claim.work_address && claim.work_hood && <span>, </span>}
										{claim.work_hood && <span className="text-muted-foreground">{claim.work_hood}</span>}
									</div>
								)}

								{claim.alum_pvc && (
									<Badge variant="outline" className="text-xs">
										{claim.alum_pvc}
									</Badge>
								)}

								{claim.description && (
									<div
										className="text-xs cursor-pointer hover:text-primary transition-colors truncate"
										onClick={() => {
											onViewDescription(claim.description || '');
											onViewImages(claim);
										}}
									>
										{claim.description}
									</div>
								)}

								{authorizedUser && claim.attend && (
									<div className="text-xs text-muted-foreground">
										Atendido por: {claim.attend}
									</div>
								)}

								{claim.resolved && (
									<div className="text-xs text-muted-foreground">
										Resuelto el: {formatDate(claim.resolution_date || '')}
									</div>
								)}
							</div>
						</div>
					))
				)}
			</div>
		</>
	);
}
