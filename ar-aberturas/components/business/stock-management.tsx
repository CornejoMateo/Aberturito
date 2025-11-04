'use client';

import { useState, useMemo } from 'react';
import { StockFormDialog } from '../../utils/stock/stock-add-dialog';
import { StockStats } from '../../utils/stock/stock-stats';
import { StockFilters } from '../../utils/stock/stock-filters';
import { ProfileTable } from '../../utils/stock/profile-table';
import { OptionsModal } from '@/utils/stock/options/options';
import {
	listStock,
	createProfileStock,
	deleteProfileStock,
	type ProfileItemStock,
	updateProfileStock,
} from '@/lib/profile-stock';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination';
import { useRealtimeProfileTable } from '@/hooks/use-realtime-profile-table';
import { Image } from 'lucide-react';
import { PhotoGalleryModal } from '@/utils/stock/photo-gallery-modal';

interface StockManagementProps {
	materialType?: 'Aluminio' | 'PVC';
}

export function StockManagement({ materialType = 'Aluminio' }: StockManagementProps) {
	const {
		data: stock,
		loading,
		error,
		refresh,
	} = useRealtimeProfileTable<ProfileItemStock>('profiles', async () => {
		const { data, error } = await listStock();
		if (error) throw error;
		return data || [];
	});

	const [searchTerm, setSearchTerm] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('Perfiles');
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<ProfileItemStock | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isPhotoGalleryOpen, setIsPhotoGalleryOpen] = useState(false);
	const itemsPerPage = 10;

	const filteredStock = useMemo(() => {
		return stock.filter((item) => {
			const searchLower = searchTerm.toLowerCase();
			const matchesSearch =
				(item.category?.toLowerCase() || '').includes(searchLower) ||
				(item.code?.toLowerCase() || '').includes(searchLower) ||
				(item.line?.toLowerCase() || '').includes(searchLower) ||
				(item.color?.toLowerCase() || '').includes(searchLower) ||
				(item.site?.toLowerCase() || '').includes(searchLower);
			const matchesCategory =
				selectedCategory === 'Perfiles' || item.category === selectedCategory;
			const matchesMaterial =
				!materialType || item.material?.toLowerCase() === materialType.toLowerCase();
			return matchesSearch && matchesCategory && matchesMaterial;
		});
	}, [stock, searchTerm, selectedCategory, materialType]);

	const totalPages = Math.ceil(filteredStock.length / itemsPerPage);

	const currentItems = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		return filteredStock.slice(startIndex, startIndex + itemsPerPage);
	}, [filteredStock, currentPage, itemsPerPage]);

	const lowStockItems = stock.filter((item) => (item.quantity ?? 0) < 10);
	const totalItems = stock.reduce((sum, item) => sum + (item.quantity ?? 0), 0);

	const lastAddedItem = [...stock].sort(
		(a, b) =>
			new Date(b.created_at || 0).getTime() -
			new Date(a.created_at || 0).getTime()
	)[0];

	const getTitle = () => {
		switch (materialType) {
			case 'Aluminio':
				return 'Stock de Aluminio';
			case 'PVC':
				return 'Stock de PVC';
			default:
				return 'Gestión de Stock';
		}
	};

	const getDescription = () => {
		switch (materialType) {
			case 'Aluminio':
				return 'Control de inventario de productos de aluminio';
			case 'PVC':
				return 'Control de inventario de productos de PVC';
			default:
				return 'Control de inventario y materiales';
		}
	};

	const handleEdit = (id: string) => {
		const item = stock.find((s) => s.id === id);
		if (item) {
			setEditingItem(item);
			setIsEditDialogOpen(true);
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h2 className="text-2xl font-bold text-foreground text-balance">
						{getTitle()}
					</h2>
					<p className="text-muted-foreground mt-1">{getDescription()}</p>
				</div>

				<div className="flex gap-2">
					<Button variant="default" onClick={() => setIsPhotoGalleryOpen(true)} className="gap-2">
						<Image className="h-5 w-5" />
						Agregar foto
					</Button>
					<Button variant="default" onClick={() => setIsModalOpen(true)} className="gap-2">
						<Settings className="h-5 w-5" />
						Ajustar opciones
					</Button>
					<PhotoGalleryModal
						open={isPhotoGalleryOpen}
						onOpenChange={setIsPhotoGalleryOpen}
						materialType={materialType}
					/>
					<OptionsModal
						materialType={materialType}
						open={isModalOpen}
						onOpenChange={setIsModalOpen}
					/>

					<StockFormDialog
						open={isAddDialogOpen}
						onOpenChange={setIsAddDialogOpen}
						onSave={async (newItem) => {
							const { error } = await createProfileStock(newItem);
							if (error) {
								console.error('Error al crear perfil:', error);
								return;
							}
							refresh(); // 🔁 Fuerza re-render inmediato si Realtime tarda
							setIsAddDialogOpen(false);
						}}
						materialType={materialType}
						triggerButton={true}
					/>
				</div>
			</div>

			{/* Stats */}
			<StockStats
				totalItems={totalItems}
				lowStockCount={lowStockItems.length}
				lastAddedItem={lastAddedItem}
			/>

			{/* Filters */}
			<StockFilters
				searchTerm={searchTerm}
				setSearchTerm={setSearchTerm}
				selectedCategory={selectedCategory}
				setSelectedCategory={setSelectedCategory}
			/>

			{/* Main table */}
			{loading ? (
				<p>Cargando stock...</p>
			) : error ? (
				<p className="text-destructive">Error: {String(error)}</p>
			) : (
				<>
					{selectedCategory === 'Perfiles' && (
						<ProfileTable
							filteredStock={currentItems}
							onEdit={handleEdit}
							onDelete={async (id) => {
								const { error } = await deleteProfileStock(id);
								if (error) console.error('Error al eliminar perfil:', error);
							}}
							onUpdateQuantity={async (id, newQuantity) => {
								if (newQuantity < 0) return;
								const { error } = await updateProfileStock(id, {
									quantity: newQuantity,
								});
								if (error)
									console.error('Error al actualizar la cantidad:', error);
							}}
						/>
					)}

					{selectedCategory === 'Accesorios' && (
						<p>Tabla de accesorios en desarrollo.</p>
					)}

					{/* Pagination */}
					{filteredStock.length > itemsPerPage && (
						<div className="flex items-center justify-between px-2 mt-4">
							<div className="text-sm text-muted-foreground">
								Mostrando{' '}
								{Math.min(
									(currentPage - 1) * itemsPerPage + 1,
									filteredStock.length
								)}
								-
								{Math.min(
									currentPage * itemsPerPage,
									filteredStock.length
								)}{' '}
								de {filteredStock.length} elementos
							</div>

							<Pagination className="mx-0 w-auto">
								<PaginationContent>
									<PaginationItem>
										<PaginationPrevious
											onClick={() =>
												setCurrentPage((p) => Math.max(1, p - 1))
											}
											className={
												currentPage === 1
													? 'pointer-events-none opacity-50'
													: 'cursor-pointer'
											}
										/>
									</PaginationItem>

									{Array.from(
										{ length: Math.min(5, totalPages) },
										(_, i) => {
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
														onClick={() =>
															setCurrentPage(pageNum)
														}
													>
														{pageNum}
													</PaginationLink>
												</PaginationItem>
											);
										}
									)}

									<PaginationItem>
										<PaginationNext
											onClick={() =>
												setCurrentPage((p) =>
													Math.min(totalPages, p + 1)
												)
											}
											className={
												currentPage === totalPages
													? 'pointer-events-none opacity-50'
													: 'cursor-pointer'
											}
										/>
									</PaginationItem>
								</PaginationContent>
							</Pagination>
						</div>
					)}
				</>
			)}
		</div>
	);
}

export type { ProfileItemStock };
