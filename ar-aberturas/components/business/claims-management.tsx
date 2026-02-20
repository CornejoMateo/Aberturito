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
import { Claim, listClaims, deleteClaim, resolveClaim } from '@/lib/claims/claims';
import { useOptimizedRealtime } from '@/hooks/use-optimized-realtime';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ClaimsAddDialog } from '@/utils/claims/claims-add-dialog';
import { cn } from '@/lib/utils';

type FilterType = 'todos' | 'pendientes' | 'resueltos';

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
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;

	const handleEditClaim = (claim: Claim) => {
		setSelectedClaim(claim);
		setIsEditDialogOpen(true);
	};

	const handleViewClaim = (claim: Claim) => {
		setViewingClaim(claim);
		setIsViewDialogOpen(true);
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

	const handleResolveClaim = async (claim: Claim) => {
		try {
			const { error } = await resolveClaim(claim.id);
			if (error) throw error;
			toast({
				title: 'Reclamo resuelto',
				description: 'El reclamo ha sido marcado como resuelto.',
			});
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
				(filterType === 'resueltos' && claim.resolved);

			// Filter by search term
			const matchesSearch =
				searchTerm === '' ||
				claim.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				claim.attend?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				claim.work_id?.toLowerCase().includes(searchTerm.toLowerCase());

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

	const formatDate = (dateString?: string | null) => {
		if (!dateString) return '-';
		try {
			return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
		} catch {
			return '-';
		}
	};

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

			{/* View Claim Dialog */}
			<Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>Detalles del reclamo</DialogTitle>
					</DialogHeader>
					{viewingClaim && (
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Estado</p>
									<Badge
										variant={viewingClaim.resolved ? 'default' : 'secondary'}
										className="mt-1"
									>
										{viewingClaim.resolved ? (
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
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Tipo</p>
									<p className="mt-1">{viewingClaim.alum_pvc || '-'}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Obra</p>
									<p className="mt-1">{viewingClaim.work_id || '-'}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Atendido por</p>
									<p className="mt-1">{viewingClaim.attend || '-'}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Fecha</p>
									<p className="mt-1">{formatDate(viewingClaim.date)}</p>
								</div>
								{viewingClaim.resolved && (
									<div>
										<p className="text-sm font-medium text-muted-foreground">Fecha de resolución</p>
										<p className="mt-1">{formatDate(viewingClaim.resolution_date)}</p>
									</div>
								)}
								<div>
									<p className="text-sm font-medium text-muted-foreground">Diario</p>
									<p className="mt-1">{viewingClaim.daily ? 'Sí' : 'No'}</p>
								</div>
							</div>
							<div>
								<p className="text-sm font-medium text-muted-foreground">Descripción</p>
								<p className="mt-1 text-sm">{viewingClaim.description || 'Sin descripción'}</p>
							</div>
						</div>
					)}
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
							Cerrar
						</Button>
						{viewingClaim && !viewingClaim.resolved && (
							<Button
								onClick={() => {
									handleResolveClaim(viewingClaim);
									setIsViewDialogOpen(false);
								}}
							>
								<CheckCircle className="mr-2 h-4 w-4" />
								Marcar como resuelto
							</Button>
						)}
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h2 className="text-2xl font-bold text-foreground text-balance">Gestión de reclamos</h2>
					<p className="text-muted-foreground mt-1">Administración de reclamos y seguimiento</p>
				</div>
				<Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
					<Plus className="h-4 w-4" />
					Nuevo reclamo
				</Button>
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
					</div>
					<div className="relative flex-1 md:max-w-sm">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Buscar por descripción, atendido por, obra..."
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
								<TableHead className='text-center'>Estado</TableHead>
								<TableHead className='text-center'>Fecha</TableHead>
								<TableHead className='text-center'>Obra</TableHead>
								<TableHead className='text-center'>Tipo</TableHead>
								<TableHead className="hidden md:table-cell text-center">Atendido por</TableHead>
								<TableHead className="hidden lg:table-cell text-center">Descripción</TableHead>
								<TableHead className="text-center">Acciones</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell colSpan={7} className="text-center py-8">
										Cargando reclamos...
									</TableCell>
								</TableRow>
							) : currentItems.length === 0 ? (
								<TableRow>
									<TableCell colSpan={7} className="text-center py-8">
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
									<TableRow key={claim.id}>
										<TableCell>
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
										<TableCell className="whitespace-nowrap">{formatDate(claim.date)}</TableCell>
										<TableCell>{claim.work_id || '-'}</TableCell>
										<TableCell>
											<Badge variant="outline">{claim.alum_pvc || '-'}</Badge>
										</TableCell>
										<TableCell className="hidden md:table-cell">{claim.attend || '-'}</TableCell>
										<TableCell className="hidden lg:table-cell max-w-xs">
											<div className="truncate">{claim.description || '-'}</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center justify-end gap-2">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleViewClaim(claim)}
													className="h-8 w-8 p-0"
												>
													<Eye className="h-4 w-4" />
												</Button>
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
