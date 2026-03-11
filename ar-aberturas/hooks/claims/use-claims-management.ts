import { useState, useEffect, useMemo } from 'react';
import { Claim, listClaims, deleteClaim, resolveClaim, reopenClaim, updateClaim, deleteOldClaims } from '@/lib/claims/claims';
import { useOptimizedRealtime } from '@/hooks/use-optimized-realtime';
import { paginateAndFilter } from '@/helpers/clients/pagination';
import { FilterType } from '@/constants/claims/filters';
import { toast } from '@/components/ui/use-toast';

export function useClaimsManagement() {
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

	return {
		claims,
		loading,
		error,
		refresh,

		searchTerm,
		setSearchTerm,

		filterType,
		setFilterType,

		isAddDialogOpen,
		setIsAddDialogOpen,

		isEditDialogOpen,
		setIsEditDialogOpen,

		selectedClaim,
		setSelectedClaim,

		claimToDelete,
		setClaimToDelete,

		claimToResolve,
		setClaimToResolve,

		resolvedBy,
		setResolvedBy,

		descriptionToView,
		setDescriptionToView,

		selectedClaimForImages,
		setSelectedClaimForImages,

		showDeleteOldDialog,
		setShowDeleteOldDialog,

		currentPage,
		setCurrentPage,

		itemsPerPage,

		paginatedData,
		filteredData,
		totalPages,
		totalItems,

		handleEditClaim,
		handleDeleteClick,
		handleResolveClaim,
		handleReOpenClaim,
		confirmResolveClaim,
		confirmDelete,
		handleDeleteOldClaims,
	};
}
