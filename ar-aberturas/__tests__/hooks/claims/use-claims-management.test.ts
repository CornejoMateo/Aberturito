import { renderHook, act } from '@testing-library/react';
import { useClaimsManagement } from '@/hooks/claims/use-claims-management';
import { deleteClaim, resolveClaim, reopenClaim, updateClaim, deleteOldClaims } from '@/lib/claims/claims';
import { toast } from '@/components/ui/use-toast';

jest.mock('@/lib/claims/claims', () => ({
	listClaims: jest.fn(),
	deleteClaim: jest.fn(),
	resolveClaim: jest.fn(),
	reopenClaim: jest.fn(),
	updateClaim: jest.fn(),
	deleteOldClaims: jest.fn(),
}));

jest.mock('@/hooks/use-optimized-realtime', () => ({
	useOptimizedRealtime: (table: string, fetchFn: Function) => ({
		data: [
			{
				id: '1',
				client_name: 'Test Client 1',
				description: 'Test claim',
				resolved: false,
				daily: false,
				date: '2024-01-01',
				created_at: '2024-01-01',
			},
			{
				id: '2',
				client_name: 'Test Client 2',
				description: 'Test claim 2',
				resolved: true,
				daily: false,
				date: '2024-01-02',
				created_at: '2024-01-02',
				resolution_date: '2024-01-05',
			},
			{
				id: '3',
				client_name: 'Test Client 3',
				description: 'Daily activity',
				resolved: false,
				daily: true,
				date: '2024-01-03',
				created_at: '2024-01-03',
			},
		],
		loading: false,
		error: null,
		refresh: jest.fn(),
	}),
}));

jest.mock('@/components/ui/use-toast', () => ({
	toast: jest.fn(),
}));

describe('useClaimsManagement', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('initializes with default values', () => {
		const { result } = renderHook(() => useClaimsManagement());

		expect(result.current.searchTerm).toBe('');
		expect(result.current.filterType).toBe('todos');
		expect(result.current.currentPage).toBe(1);
		expect(result.current.isAddDialogOpen).toBe(false);
		expect(result.current.isEditDialogOpen).toBe(false);
		expect(result.current.selectedClaim).toBe(null);
		expect(result.current.claimToDelete).toBe(null);
		expect(result.current.claimToResolve).toBe(null);
	});

	it('loads claims data', () => {
		const { result } = renderHook(() => useClaimsManagement());

		expect(result.current.claims).toHaveLength(3);
		expect(result.current.claims[0].client_name).toBe('Test Client 1');
	});

	it('filters claims by search term', () => {
		const { result } = renderHook(() => useClaimsManagement());

		act(() => {
			result.current.setSearchTerm('test client 1');
		});

		expect(result.current.searchTerm).toBe('test client 1');
		expect(result.current.filteredData).toHaveLength(1);
		expect(result.current.filteredData[0].client_name).toBe('Test Client 1');
	});

	it('filters claims by filterType', () => {
		const { result } = renderHook(() => useClaimsManagement());

		act(() => {
			result.current.setFilterType('pendientes');
		});

		expect(result.current.filterType).toBe('pendientes');
		// Should filter only non-resolved and non-daily claims
		expect(result.current.filteredData.every((c) => !c.resolved && !c.daily)).toBe(true);
	});

	it('filters daily activities', () => {
		const { result } = renderHook(() => useClaimsManagement());

		act(() => {
			result.current.setFilterType('diario');
		});

		expect(result.current.filteredData.every((c) => c.daily)).toBe(true);
	});

	it('paginates claims correctly', () => {
		const { result } = renderHook(() => useClaimsManagement());

		// With itemsPerPage=10 and 3 claims, all should be on page 1
		expect(result.current.paginatedData).toHaveLength(2); // Only non-daily claims by default (todos filter)
		expect(result.current.totalPages).toBeGreaterThanOrEqual(1);
	});

	it('resets to page 1 when search term changes', () => {
		const { result } = renderHook(() => useClaimsManagement());

		act(() => {
			result.current.setCurrentPage(2);
		});

		expect(result.current.currentPage).toBe(2);

		act(() => {
			result.current.setSearchTerm('new search');
		});

		// Should reset to page 1
		expect(result.current.currentPage).toBe(1);
	});

	it('resets to page 1 when filter type changes', () => {
		const { result } = renderHook(() => useClaimsManagement());

		act(() => {
			result.current.setCurrentPage(2);
		});

		act(() => {
			result.current.setFilterType('pendientes');
		});

		expect(result.current.currentPage).toBe(1);
	});

	it('handles edit claim', () => {
		const { result } = renderHook(() => useClaimsManagement());

		const claim = result.current.claims[0];

		act(() => {
			result.current.handleEditClaim(claim);
		});

		expect(result.current.selectedClaim).toBe(claim);
		expect(result.current.isEditDialogOpen).toBe(true);
	});

	it('handles delete click', () => {
		const { result } = renderHook(() => useClaimsManagement());

		const claim = result.current.claims[0];

		act(() => {
			result.current.handleDeleteClick(claim);
		});

		expect(result.current.claimToDelete).toBe(claim);
	});

	it('handles resolve claim', () => {
		const { result } = renderHook(() => useClaimsManagement());

		const claim = result.current.claims[0];

		act(() => {
			result.current.handleResolveClaim(claim);
		});

		expect(result.current.claimToResolve).toBe(claim);
		expect(result.current.resolvedBy).toBe('');
	});

	it('confirms claim deletion', async () => {
		(deleteClaim as jest.Mock).mockResolvedValue({ error: null });

		const { result } = renderHook(() => useClaimsManagement());

		const claim = result.current.claims[0];

		act(() => {
			result.current.handleDeleteClick(claim);
		});

		await act(async () => {
			await result.current.confirmDelete();
		});

		expect(deleteClaim).toHaveBeenCalledWith(claim.id);
		expect(toast).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Reclamo eliminado',
			})
		);
		expect(result.current.claimToDelete).toBe(null);
	});

	it('confirms claim resolution', async () => {
		(resolveClaim as jest.Mock).mockResolvedValue({ error: null });

		const { result } = renderHook(() => useClaimsManagement());

		const claim = result.current.claims[0];

		act(() => {
			result.current.handleResolveClaim(claim);
		});

		act(() => {
			result.current.setResolvedBy('Juan');
		});

		await act(async () => {
			await result.current.confirmResolveClaim();
		});

		expect(resolveClaim).toHaveBeenCalledWith(claim.id);
		expect(updateClaim).toHaveBeenCalledWith(claim.id, { attend: 'Juan' });
		expect(toast).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Reclamo marcado como resuelto',
			})
		);
	});

	it('handles reopen claim', async () => {
		(reopenClaim as jest.Mock).mockResolvedValue({ error: null });

		const { result } = renderHook(() => useClaimsManagement());

		const claim = result.current.claims[1]; // Resolved claim

		await act(async () => {
			await result.current.handleReOpenClaim(claim);
		});

		expect(reopenClaim).toHaveBeenCalledWith(claim.id);
		expect(toast).toHaveBeenCalled();
	});

	it('handles delete old claims', async () => {
		(deleteOldClaims as jest.Mock).mockResolvedValue({ error: null });

		const { result } = renderHook(() => useClaimsManagement());

		await act(async () => {
			await result.current.handleDeleteOldClaims();
		});

		expect(deleteOldClaims).toHaveBeenCalled();
		expect(toast).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Reclamos antiguos eliminados',
			})
		);
		expect(result.current.showDeleteOldDialog).toBe(false);
	});

	it('handles errors during deletion', async () => {
		(deleteClaim as jest.Mock).mockResolvedValue({ error: 'Database error' });

		const { result } = renderHook(() => useClaimsManagement());

		const claim = result.current.claims[0];

		act(() => {
			result.current.handleDeleteClick(claim);
		});

		await act(async () => {
			await result.current.confirmDelete();
		});

		expect(toast).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Error al eliminar',
				variant: 'destructive',
			})
		);
	});

	it('manages dialog states correctly', () => {
		const { result } = renderHook(() => useClaimsManagement());

		act(() => {
			result.current.setIsAddDialogOpen(true);
		});
		expect(result.current.isAddDialogOpen).toBe(true);

		act(() => {
			result.current.setIsEditDialogOpen(true);
		});
		expect(result.current.isEditDialogOpen).toBe(true);

		act(() => {
			result.current.setShowDeleteOldDialog(true);
		});
		expect(result.current.showDeleteOldDialog).toBe(true);
	});

	it('manages description view state', () => {
		const { result } = renderHook(() => useClaimsManagement());

		const description = 'Test description';
		const claim = result.current.claims[0];

		act(() => {
			result.current.setDescriptionToView(description);
			result.current.setSelectedClaimForImages(claim);
		});

		expect(result.current.descriptionToView).toBe(description);
		expect(result.current.selectedClaimForImages).toBe(claim);
	});
});
