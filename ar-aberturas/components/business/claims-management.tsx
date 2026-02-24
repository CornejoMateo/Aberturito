'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination';
import {
	AlertTriangle,
	Search,
	Plus,
	Eye,
	Edit,
	Trash2,
	CheckCircle,
	Clock,
	AlertCircle,
	FileText,
} from 'lucide-react';
import {
	Claim,
	listClaims,
	deleteClaim,
	resolveClaim,
	reopenClaim,
	updateClaim,
} from '@/lib/claims/claims';
import { useOptimizedRealtime } from '@/hooks/use-optimized-realtime';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ClaimsAddDialog } from '@/utils/claims/claims-add-dialog';
import { cn } from '@/lib/utils';
import { userAgent } from 'next/server';
import { useAuth } from '@/components/provider/auth-provider';

type FilterType = 'todos' | 'pendientes' | 'resueltos' | 'diario' | 'no-diario';

export function ClaimsManagement() {
	const { toast } = useToast();

	const {
		data: claims,
		loading,
		error,
		refresh,
	} = useOptimizedRealtime<Claim>(
		'claims',
		async () => {
			const { data } = await listClaims();
			return data ?? [];
		},
		'claims_cache'
	);

	const [searchTerm, setSearchTerm] = useState('');
	const [filterType, setFilterType] = useState<FilterType>('todos');
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
	const [claimToDelete, setClaimToDelete] = useState<Claim | null>(null);
	const [viewingClaim, setViewingClaim] = useState<Claim | null>(null);
	const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
	const [claimToResolve, setClaimToResolve] = useState<Claim | null>(null);
	const [resolvedBy, setResolvedBy] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;
	const [descriptionToView, setDescriptionToView] = useState<string | null>(null);

	const { user } = useAuth();

	const handleEditClaim = (claim: Claim) => {
		setSelectedClaim(claim);
		setIsEditDialogOpen(true);
	};

	const handleDeleteClick = (claim: Claim) => {
		setClaimToDelete(claim);
	};

	const confirmDelete = async () => {
		if (!claimToDelete) return;

		try {
			const { error } = await deleteClaim(claimToDelete.id);
			if (error) throw error;
			toast({
				title: 'Reclamo eliminado',
				description: 'El reclamo ha sido eliminado correctamente.',
			});
			setClaimToDelete(null);
			await refresh();
		} catch (err) {
			console.error('Error eliminando el reclamo:', err);
			toast({
				title: 'Error al eliminar',
				description: 'No se pudo eliminar el reclamo. Por favor, intenta nuevamente.',
				variant: 'destructive',
			});
		}
	};

	const handleToggleResolved = async (claim: Claim) => {
		try {
			const { error } = await reopenClaim(claim.id);
			if (error) throw error;
			toast({
				title: claim.resolved ? 'Reclamo reabierto' : 'Reclamo resuelto',
				description: claim.resolved
					? 'El reclamo ha sido marcado como pendiente nuevamente.'
					: 'El reclamo ha sido marcado como resuelto.',
			});
			await refresh();
		} catch (err) {
			console.error('Error actualizando el reclamo:', err);
			toast({
				title: 'Error al actualizar',
				description: 'No se pudo actualizar el estado del reclamo. Por favor, intenta nuevamente.',
				variant: 'destructive',
			});
		}
	};

	const handleResolveClaim = async (claim: Claim) => {
		setClaimToResolve(claim);
		setResolvedBy('');
	};

	const confirmResolveClaim = async () => {
		if (!claimToResolve) return;

		try {
			const { error } = await resolveClaim(claimToResolve.id);
			if (error) throw error;

			// Update the attend field with who resolved it
			if (resolvedBy.trim()) {
				await updateClaim(claimToResolve.id, { attend: resolvedBy.trim() });
			}

			toast({
				title: 'Reclamo resuelto',
				description: 'El reclamo ha sido marcado como resuelto.',
			});
			setClaimToResolve(null);
			setResolvedBy('');
			await refresh();
		} catch (err) {
			console.error('Error resolviendo el reclamo:', err);
			toast({
				title: 'Error al resolver',
				description: 'No se pudo marcar el reclamo como resuelto.',
				variant: 'destructive',
			});
		}
	};

	const filteredClaims = useMemo(() => {
		return claims.filter((claim) => {
			// Filter by status
			const matchesFilter =
				filterType === 'todos' ||
				(filterType === 'pendientes' && !claim.resolved) ||
				(filterType === 'resueltos' && claim.resolved) ||
				(filterType === 'diario' && claim.daily === true) ||
				(filterType === 'no-diario' && claim.daily !== true);

			// Filter by search term
			const matchesSearch =
				searchTerm === '' ||
				claim.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				claim.attend?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				claim.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				claim.work_zone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				claim.work_locality?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				claim.work_address?.toLowerCase().includes(searchTerm.toLowerCase());

			return matchesFilter && matchesSearch;
		});
	}, [claims, filterType, searchTerm]);

	const totalPages = Math.ceil(filteredClaims.length / itemsPerPage);

	const currentItems = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		return filteredClaims.slice(startIndex, startIndex + itemsPerPage);
	}, [filteredClaims, currentPage, itemsPerPage]);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, filterType]);

	const pendingCount = claims.filter((c) => !c.resolved).length;
	const resolvedCount = claims.filter((c) => c.resolved).length;

	function formatDate(date: string): string {
		const [year, month, day] = date.split('-');
		return `${day}-${month}-${year}`;
	}

	return (
		<div className="space-y-6">
			{/* Delete Confirmation Dialog */}
			<Dialog open={!!claimToDelete} onOpenChange={(open) => !open && setClaimToDelete(null)}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle className="text-destructive flex items-center gap-2">
							<AlertTriangle className="h-5 w-5" />
							Eliminar reclamo
						</DialogTitle>
						<DialogDescription>
							¿Estás seguro de que deseas eliminar este reclamo? Esta acción no se puede deshacer.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setClaimToDelete(null)}>
							Cancelar
						</Button>
						<Button variant="destructive" onClick={confirmDelete}>
							<Trash2 className="mr-2 h-4 w-4" />
							Eliminar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Resolve Confirmation Dialog */}
			<Dialog open={!!claimToResolve} onOpenChange={(open) => !open && setClaimToResolve(null)}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<CheckCircle className="h-5 w-5 text-green-600" />
							Marcar reclamo como resuelto
						</DialogTitle>
						<DialogDescription>
							Ingresa el nombre de la(s) persona(s) que resolvieron este reclamo.
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<Input
							value={resolvedBy}
							onChange={(e) => setResolvedBy(e.target.value)}
							className="bg-background"
						/>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setClaimToResolve(null)}>
							Cancelar
						</Button>
						<Button onClick={confirmResolveClaim} className="bg-green-600 hover:bg-green-700">
							<CheckCircle className="mr-2 h-4 w-4" />
							Marcar como resuelto
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Description View Dialog */}
			<Dialog
				open={!!descriptionToView}
				onOpenChange={(open) => !open && setDescriptionToView(null)}
			>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<FileText className="h-5 w-5" />
							Descripción del reclamo
						</DialogTitle>
					</DialogHeader>
					<div className="py-4">
						<p className="text-sm text-foreground whitespace-pre-wrap">{descriptionToView}</p>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDescriptionToView(null)}>
							Cerrar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h2 className="text-2xl font-bold text-foreground text-balance">Gestión de reclamos</h2>
					<p className="text-muted-foreground mt-1">Administración de reclamos y seguimiento</p>
				</div>
				{user?.role === 'Admin' && (
					<Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
						<Plus className="h-4 w-4" />
						Nuevo reclamo
					</Button>
				)}
			</div>

			<ClaimsAddDialog
				open={isAddDialogOpen}
				onOpenChange={setIsAddDialogOpen}
				onClaimAdded={refresh}
			/>

			{selectedClaim && (
				<ClaimsAddDialog
					open={isEditDialogOpen}
					onOpenChange={setIsEditDialogOpen}
					claimToEdit={selectedClaim}
					onClaimAdded={refresh}
				/>
			)}

			{/* Stats */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card className="p-6 bg-card border-border">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">Total reclamos</p>
							<p className="text-2xl font-bold text-foreground mt-2">{claims.length}</p>
						</div>
						<div className="rounded-lg bg-secondary p-3 text-chart-1">
							<FileText className="h-6 w-6" />
						</div>
					</div>
				</Card>

				<Card className="p-6 bg-card border-border">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">Pendientes</p>
							<p className="text-2xl font-bold text-foreground mt-2">{pendingCount}</p>
						</div>
						<div className="rounded-lg bg-orange-500/10 p-3 text-orange-500">
							<Clock className="h-6 w-6" />
						</div>
					</div>
				</Card>

				<Card className="p-6 bg-card border-border">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">Resueltos</p>
							<p className="text-2xl font-bold text-foreground mt-2">{resolvedCount}</p>
						</div>
						<div className="rounded-lg bg-green-500/10 p-3 text-green-500">
							<CheckCircle className="h-6 w-6" />
						</div>
					</div>
				</Card>
			</div>

			{/* Filters and Search */}
			<Card className="p-4 bg-card border-border">
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
						<Button
							variant={filterType === 'diario' ? 'default' : 'outline'}
							size="sm"
							onClick={() => setFilterType('diario')}
							className={cn(filterType === 'diario' && 'bg-blue-500 hover:bg-blue-600')}
						>
							<FileText className="h-4 w-4 mr-2" />
							Diario
						</Button>
						<Button
							variant={filterType === 'no-diario' ? 'default' : 'outline'}
							size="sm"
							onClick={() => setFilterType('no-diario')}
							className={cn(filterType === 'no-diario' && 'bg-purple-500 hover:bg-purple-600')}
						>
							<FileText className="h-4 w-4 mr-2" />
							No diario
						</Button>
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

			{/* Table */}
			<Card className="bg-card border-border">
				<div className="overflow-x-auto">
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
								{user?.role === 'Admin' && (
									<TableHead className="text-center">Atendido por</TableHead>
								)}
								<TableHead className="text-center">Fecha de resolución</TableHead>
								{user?.role === 'Admin' && <TableHead className="text-center">Acciones</TableHead>}
							</TableRow>
						</TableHeader>
						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell colSpan={11} className="text-center py-8">
										Cargando reclamos...
									</TableCell>
								</TableRow>
							) : currentItems.length === 0 ? (
								<TableRow>
									<TableCell colSpan={11} className="text-center py-8">
										<div className="flex flex-col items-center gap-2">
											<AlertCircle className="h-8 w-8 text-muted-foreground" />
											<p className="text-muted-foreground">
												No se encontraron reclamos con los filtros aplicados
											</p>
										</div>
									</TableCell>
								</TableRow>
							) : (
								currentItems.map((claim) => (
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
												onClick={() => setDescriptionToView(claim.description || '-')}
												title="Click para ver descripción completa"
											>
												{claim.description || '-'}
											</div>
										</TableCell>
										{user?.role === 'Admin' && (
											<TableCell className="text-center">{claim.attend || '-'}</TableCell>
										)}
										<TableCell className="text-center whitespace-nowrap">
											{claim.resolved ? formatDate(claim.resolution_date || '') : '-'}
										</TableCell>
										{user?.role === 'Admin' && (
											<TableCell className="text-center">
												<div className="items-center justify-end gap-2">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleEditClaim(claim)}
														className="h-8 w-8 p-0"
													>
														<Edit className="h-4 w-4" />
													</Button>
													{!claim.resolved && (
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleResolveClaim(claim)}
															className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
														>
															<CheckCircle className="h-4 w-4" />
														</Button>
													)}
													{claim.resolved && (
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleToggleResolved(claim)}
															className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
														>
															<Clock className="h-4 w-4" />
														</Button>
													)}
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleDeleteClick(claim)}
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
			</Card>

			{/* Pagination */}
			{filteredClaims.length > itemsPerPage && (
				<div className="flex items-center justify-between px-2">
					<div className="text-sm text-muted-foreground">
						Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filteredClaims.length)}-
						{Math.min(currentPage * itemsPerPage, filteredClaims.length)} de {filteredClaims.length}{' '}
						reclamos
					</div>

					<Pagination className="mx-0 w-auto">
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious
									onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
									className={
										currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
									}
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
									onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
									className={
										currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
									}
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</div>
			)}
		</div>
	);
}
