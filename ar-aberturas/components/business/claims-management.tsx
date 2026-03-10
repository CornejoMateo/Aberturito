'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
	Plus,
	Trash2,
	CheckCircle,
	FileText,
} from 'lucide-react';
import {
	Claim,
	listClaims,
	deleteClaim,
	resolveClaim,
	reopenClaim,
	updateClaim,
	deleteOldClaims,
} from '@/lib/claims/claims';
import { useOptimizedRealtime } from '@/hooks/use-optimized-realtime';
import { useToast } from '@/components/ui/use-toast';
import { ClaimsAddDialog } from '@/utils/claims/claims-add-dialog';
import { useAuth } from '@/components/provider/auth-provider';
import { ClaimImagesGallery } from '@/utils/claims/claim-images-gallery';
import { FilterType } from '@/constants/claims/filters';
import { paginateAndFilter } from '@/helpers/clients/pagination';
import { ClaimsStats } from '@/utils/claims/claim-stats';
import { ClaimsFilter } from '@/utils/claims/claims-filter';
import { ClaimsTable } from '@/utils/claims/claims-table';

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
	const [claimToResolve, setClaimToResolve] = useState<Claim | null>(null);
	const [resolvedBy, setResolvedBy] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;
	const [descriptionToView, setDescriptionToView] = useState<string | null>(null);
	const [showDeleteOldDialog, setShowDeleteOldDialog] = useState(false);
	const [selectedClaimForImages, setSelectedClaimForImages] = useState<Claim | null>(null);

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
				title: filterType === 'diario' ? 'Actividad diaria eliminada' : 'Reclamo eliminado',
				description: filterType === 'diario' ? 'La actividad diaria ha sido eliminada correctamente.' : 'El reclamo ha sido eliminado correctamente.',
			});
			setClaimToDelete(null);
			await refresh();
		} catch (err) {
			console.error('Error en la eliminación:', err);
			toast({
				title: 'Error al eliminar',
				description: 'No se pudo eliminar el item. Por favor, intenta nuevamente.',
				variant: 'destructive',
			});
		}
	};

	const handleReOpenClaim = async (claim: Claim) => {
		try {
			const { error } = await reopenClaim(claim.id);
			if (error) throw error;
			toast({
				title: claim.resolved ? (filterType !== 'diario' ? 'Reclamo reabierto': 'Actividad reabierta') : (filterType !== 'diario' ? 'Reclamo resuelto' : 'Actividad resuelta'),
				description: claim.resolved
					? (filterType !== 'diario' ? 'El reclamo ha sido marcado como pendiente nuevamente.' : 'La actividad diaria ha sido marcada como pendiente nuevamente.')
					: (filterType !== 'diario' ? 'El reclamo ha sido marcado como resuelto.' : 'La actividad diaria ha sido marcada como resuelta.'),
			});
			await refresh();
		} catch (err) {
			toast({
				title: 'Error al actualizar',
				description: 'No se pudo actualizar el estado. Por favor, intenta nuevamente.',
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
				title: filterType === 'diario' ? 'Actividad diaria marcada como resuelta' : 'Reclamo marcado como resuelto',
				description: filterType === 'diario' ? 'La actividad diaria ha sido marcada como resuelta.' : 'El reclamo ha sido marcado como resuelto.',
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

	const handleDeleteOldClaims = async () => {
		try {
			const { error } = await deleteOldClaims();
			if (error) throw error;
			
			toast({
				title: 'Reclamos antiguos eliminados',
				description: 'Se han eliminado los reclamos y actividades diarias resueltos hace más de un mes.',
			});
			setShowDeleteOldDialog(false);
			await refresh();
		} catch (err) {
			console.error('Error eliminando reclamos antiguos:', err);
			toast({
				title: 'Error al eliminar',
				description: 'No se pudieron eliminar los reclamos antiguos.',
				variant: 'destructive',
			});
		}
	};

	const { filteredData, paginatedData, totalPages, totalItems } = useMemo(() => {
		return paginateAndFilter(
			claims,
			searchTerm,
			currentPage,
			itemsPerPage,
			(claim: Claim, search: string) => {

			const matchesFilter =
				(filterType === 'todos' && !claim.daily) ||
				(filterType === 'pendientes' && !claim.resolved && !claim.daily) ||
				(filterType === 'resueltos' && claim.resolved && !claim.daily) ||
				(filterType === 'diario' && claim.daily) || false;

			const matchesSearch =
				search === '' ||
				claim.description?.toLowerCase().includes(search) ||
				claim.attend?.toLowerCase().includes(search) ||
				claim.client_name?.toLowerCase().includes(search) ||
				claim.work_zone?.toLowerCase().includes(search) ||
				claim.work_locality?.toLowerCase().includes(search) ||
				claim.work_address?.toLowerCase().includes(search) || false;

			return matchesFilter && matchesSearch;
			}
		);
	}, [claims, searchTerm, currentPage, itemsPerPage, filterType]);


	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, filterType]);

	return (
		<div className="space-y-6">
			{/* Delete Confirmation Dialog */}
			<Dialog open={!!claimToDelete} onOpenChange={(open) => !open && setClaimToDelete(null)}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle className="text-destructive flex items-center gap-2">
							<AlertTriangle className="h-5 w-5" />
							{filterType === 'diario' ? 'Eliminar actividad diaria' : 'Eliminar reclamo'}
						</DialogTitle>
						<DialogDescription>
							{filterType === 'diario' ? 
								'¿Estás seguro de que deseas eliminar esta actividad diaria? Esta acción no se puede deshacer.'
								: '¿Estás seguro de que deseas eliminar este reclamo? Esta acción no se puede deshacer.'}
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
							{filterType === 'diario' ? 'Marcar actividad diaria como resuelta' : 'Marcar reclamo como resuelto'}
						</DialogTitle>
						<DialogDescription>
							{filterType === 'diario'
								? '¿Estás seguro de que deseas marcar esta actividad diaria como resuelta?'
								: '¿Estás seguro de que deseas marcar este reclamo como resuelto?'}
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<Input
							value={resolvedBy}
							onChange={(e) => setResolvedBy(e.target.value)}
							className="bg-background"
							placeholder='¿Quien hablo con el cliente?'
						/>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setClaimToResolve(null)}>
							Cancelar
						</Button>
						<Button onClick={confirmResolveClaim} className="bg-green-600 hover:bg-green-700">
							<CheckCircle className="mr-2 h-4 w-4" />
							Marcar como resuelto/a
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Description View Dialog */}
			<Dialog
				open={!!descriptionToView}
				onOpenChange={(open) => {
					if (!open) {
						setDescriptionToView(null);
						setSelectedClaimForImages(null);
					}
				}}
			>
				<DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<FileText className="h-5 w-5" />
							Descripción completa
						</DialogTitle>
					</DialogHeader>
					<div className="py-4 space-y-6">
						<div>
							<p className="text-sm text-foreground whitespace-pre-wrap">{descriptionToView}</p>
						</div>
						
						{selectedClaimForImages && (
							<div className="border-t pt-6">
								<ClaimImagesGallery claimId={selectedClaimForImages.id} />
							</div>
						)}
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => {
							setDescriptionToView(null);
							setSelectedClaimForImages(null);
						}}>
							Cerrar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Old Claims Dialog */}
			<Dialog open={showDeleteOldDialog} onOpenChange={setShowDeleteOldDialog}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle className="text-destructive flex items-center gap-2">
							<AlertTriangle className="h-5 w-5" />
							Eliminar reclamos antiguos
						</DialogTitle>
						<DialogDescription>
							¿Estás seguro de que deseas eliminar todos los reclamos y actividades diarias que fueron resueltos hace más de un mes? Esta acción no se puede deshacer.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowDeleteOldDialog(false)}>
							Cancelar
						</Button>
						<Button variant="destructive" onClick={handleDeleteOldClaims}>
							<Trash2 className="mr-2 h-4 w-4" />
							Eliminar antiguos
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h2 className="text-2xl font-bold text-foreground text-balance">Gestión de ajustes y actividades diarias</h2>
					<p className="text-muted-foreground mt-1">Administración de reclamos y seguimiento</p>
				</div>
				{user?.role === 'Admin' && (
					<Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
						<Plus className="h-4 w-4" />
						{filterType === 'diario' ? 'Agregar actividad diaria' : 'Agregar reclamo'

						}
					</Button>
				)}
			</div>

			<ClaimsAddDialog
				open={isAddDialogOpen}
				onOpenChange={setIsAddDialogOpen}
				onClaimAdded={refresh}
				mode={filterType === 'diario' ? 'diario' : 'reclamo'}
			/>

			{selectedClaim && (
				<ClaimsAddDialog
					open={isEditDialogOpen}
					onOpenChange={setIsEditDialogOpen}
					claimToEdit={selectedClaim}
					onClaimAdded={refresh}
					mode={selectedClaim.daily ? 'diario' : 'reclamo'}
				/>
			)}

			{/* Stats */}
			<ClaimsStats claims={claims} filterType={filterType} />

			{/* Filters and Search */}
			<ClaimsFilter filterType={filterType} setFilterType={setFilterType} searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>

			{/* Table */}
			<Card className="bg-card border-border">
				<div className="overflow-x-auto">
					<ClaimsTable
						claims={paginatedData}
						loading={loading}
						onEdit={handleEditClaim}
						onDelete={handleDeleteClick}
						onResolve={handleResolveClaim}
						onReOpen={handleReOpenClaim}
						authorizedUser={!!user && user.role === 'Admin'}
						filterType={filterType}
						onViewDescription={(description: string) => setDescriptionToView(description)}
						onViewImages={(claim: Claim) => setSelectedClaimForImages(claim)}
					/>
				</div>
			</Card>

			{/* Pagination */}
			{totalItems > itemsPerPage && (
				<div className="flex items-center justify-between px-2">
					<div className="text-sm text-muted-foreground">
						Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}-
						{Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems}{' '}
						{filterType === 'diario' ? 'actividades diarias' : 'reclamos'}
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

			{/* delete old claims */}
			{user?.role === 'Admin' && (
				<Card className="p-4 bg-card border-border">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-sm font-medium text-foreground">Limpiar datos antiguos</h3>
							<p className="text-xs text-muted-foreground mt-1">
								Elimina reclamos y actividades diarias resueltos hace más de un mes
							</p>
						</div>
						<Button
							variant="destructive"
							size="sm"
							onClick={() => setShowDeleteOldDialog(true)}
							className="gap-2"
						>
							<Trash2 className="h-4 w-4" />
							Eliminar antiguos
						</Button>
					</div>
				</Card>
			)}

		</div>
	);
}
