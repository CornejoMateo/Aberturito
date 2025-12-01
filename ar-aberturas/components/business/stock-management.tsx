'use client';

import { useState, useMemo } from 'react';
import { StockFormDialog } from '../../utils/stock/stock-add-dialog';
import { StockStats } from '../../utils/stock/stock-stats';
import { StockFilters } from '../../utils/stock/stock-filters';
import { ProfileTable } from '../../utils/stock/profile-table';
import { AccesoriesTable } from '@/utils/stock/accesories-table';
import { AccessoryFormDialog } from '@/utils/stock/accessory-add-dialog';
import { OptionsModal } from '@/utils/stock/options/options';
import {
	listStock,
	createProfileStock,
	deleteProfileStock,
	type ProfileItemStock,
	updateProfileStock,
} from '@/lib/profile-stock';
import {
	listAccesoriesStock,
	createAccessoryStock,
	updateAccessoryStock,
	deleteAccesoryStock,
	type AccessoryItemStock,
} from '@/lib/accesorie-stock';
import {
  listSuppliesStock,
  createSupplyStock,
  updateSupplyStock,
  deleteSupplyStock,
  type SupplyItemStock,
} from '@/lib/supplies-stock';
import {
	listIronworksStock,
	createIronworkStock,
	updateIronworkStock,
	deleteIronworkStock,
	type IronworkItemStock,
} from '@/lib/ironwork-stock';
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
import { useOptimizedRealtimeStock } from '@/hooks/use-optimized-realtime-stock';
import { Image } from 'lucide-react';
import { PhotoGalleryModal } from '@/utils/stock/images/photo-gallery-modal';
import { UpdatePricesDialog } from '@/components/stock/update-prices-dialog';
import { STOCK_CONFIGS, type StockCategory } from '@/lib/stock-config';
import { filterStockItems } from '@/utils/stock/stock-filters-logic';

interface StockManagementProps {
	materialType?: 'Aluminio' | 'PVC';
	category?: 'Perfiles' | StockCategory;
}

export function StockManagement({ materialType = 'Aluminio', category = 'Perfiles' }: StockManagementProps) {
	// choose data source based on category
	const tableName = category === 'Perfiles' 
		? 'profiles' 
		: STOCK_CONFIGS[category as StockCategory].tableName;
	const fetcher = async () => {
		if (category === 'Perfiles') {
			const { data, error } = await listStock();
			if (error) throw error;
			return data || [];
		}
		if (category === 'Accesorios') {
			const { data, error } = await listAccesoriesStock();
			if (error) throw error;
			return data || [];
		}
		if (category === 'Insumos') {
			const { data, error } = await listSuppliesStock();
			if (error) throw error;
			return data || [];
		}
		const { data, error } = await listIronworksStock();
		if (error) throw error;
		return data || [];
	};

	const {
		data: stock,
		loading,
		error,
		refresh,
		invalidateCache
	} = useOptimizedRealtimeStock<any>(tableName, fetcher, `stock_${category}_${materialType}`);

	const [searchTerm, setSearchTerm] = useState('');
	const [selectedCategory, setSelectedCategory] = useState(category);
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<any | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isPhotoGalleryOpen, setIsPhotoGalleryOpen] = useState(false);
	const itemsPerPage = 10;

	const filteredStock = useMemo(() => {
		return filterStockItems(stock, searchTerm, selectedCategory, materialType, category);
	}, [stock, searchTerm, selectedCategory, materialType, category]);

	const totalPages = Math.ceil(filteredStock.length / itemsPerPage);

	const currentItems = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		return filteredStock.slice(startIndex, startIndex + itemsPerPage);
	}, [filteredStock, currentPage, itemsPerPage]);

	const lowStockItems = (stock || []).filter((item:any) => {
		const qty = item.quantity ?? item.accessory_quantity ?? item.ironwork_quantity ?? 0;
		return qty < 10;
	});
	const totalItems = (stock || []).reduce((sum:any, item:any) => sum + (item.quantity ?? item.accessory_quantity ?? item.ironwork_quantity ?? 0), 0);

	const lastAddedItem = [...(stock || [])].sort(
		(a: any, b: any) =>
			new Date(b.created_at || b.last_update || 0).getTime() -
			new Date(a.created_at || a.last_update || 0).getTime()
	)[0];

	const getTitle = () => {
		const categoryName = category === 'Perfiles' ? 'Perfiles' : STOCK_CONFIGS[category as StockCategory].title;
		if (category === 'Insumos') {
			return `Gestión de ${categoryName}`;
		}
		switch (materialType) {
			case 'Aluminio':
				return `${categoryName} de Aluminio`;
			case 'PVC':
				return `${categoryName} de PVC`;
			default:
				return `Gestión de ${categoryName}`;
		}
	};

	const getDescription = () => {
		const categoryName = category === 'Perfiles' ? 'Perfiles' : STOCK_CONFIGS[category as StockCategory].title;
		if (category === 'Insumos') {
			return `Control de inventario de ${categoryName.toLowerCase()}`;
		}
		switch (materialType) {
			case 'Aluminio':
				return `Control de inventario de ${categoryName.toLowerCase()} de aluminio`;
			case 'PVC':
				return `Control de inventario de ${categoryName.toLowerCase()} de PVC`;
			default:
				return `Control de inventario de ${categoryName.toLowerCase()}`;
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
						Galería
					</Button>

					{category === 'Perfiles' && (
						<Button variant="default" onClick={() => setIsModalOpen(true)} className="gap-2">
							<Settings className="h-5 w-5" />
							Ajustar opciones
						</Button>
					)}
					
					<PhotoGalleryModal
						categoryState={category}
						open={isPhotoGalleryOpen}
						onOpenChange={setIsPhotoGalleryOpen}
						materialType={materialType}
					/>

					<OptionsModal
						materialType={materialType}
						open={isModalOpen}
						onOpenChange={setIsModalOpen}
					/>

					{category === 'Perfiles' ? (
						<StockFormDialog
							open={isAddDialogOpen}
							onOpenChange={setIsAddDialogOpen}
							onSave={async (newItem) => {
								const { error } = await createProfileStock(newItem);
								if (error) {
									console.error('Error al crear perfil:', error);
									return;
								}
								// No es necesario hacer refresh, el realtime lo actualizará
								setIsAddDialogOpen(false);
							}}
							materialType={materialType}
							triggerButton={true}
						/>
					) : (
						<AccessoryFormDialog
							open={isAddDialogOpen}
							onOpenChange={setIsAddDialogOpen}
							category={category as StockCategory}
							materialType={materialType}
							onSave={async (newItem) => {
								try {
									if (category === 'Accesorios') {
										const { error } = await createAccessoryStock(newItem as any);
										if (error) throw error;
									} else if (category === 'Insumos') {
										const { error } = await createSupplyStock(newItem as any);
										if (error) throw error;
									} else {
										const { error } = await createIronworkStock(newItem as any);
										if (error) throw error;
									}
									// No es necesario hacer refresh, el realtime lo actualizará
									setIsAddDialogOpen(false);
								} catch (err) {
									if (typeof err === 'object' && err !== null) {
										console.log('Error keys:', Object.keys(err));
										console.log('Error JSON:', JSON.stringify(err, null, 2));
									} else {
										console.log('Error value:', err);
									}
									console.error('Error al crear item:', err);
								}
							}}
							triggerButton={true}
						/>
					)}
				</div>
			</div>

			{/* Stats */}
			<StockStats
				categoryState={category}
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
					{category === 'Perfiles' ? (
						<ProfileTable
							filteredStock={currentItems}
							onEdit={handleEdit}
							onDelete={async (id) => {
								const { error } = await deleteProfileStock(id);
								if (error) console.error('Error al eliminar perfil:', error);
								// No es necesario hacer refresh, el realtime lo actualizará
							}}
							onUpdateQuantity={async (id, newQuantity) => {
								if (newQuantity < 0) return;
								const { error } = await updateProfileStock(id, {
									quantity: newQuantity,
								});
								if (error)
									console.error('Error al actualizar la cantidad:', error);
								// No es necesario hacer refresh, el realtime lo actualizará
							}}
						/>
					) : (
						<AccesoriesTable
							categoryState={category as StockCategory}
							filteredStock={currentItems}
							onEdit={(id) => {
								const it = (stock || []).find((s: any) => s.id === id);
								if (it) {
									setEditingItem(it);
									setIsEditDialogOpen(true);
								}
							}}
							onDelete={async (id) => {
								try {
									if (category === 'Accesorios') {
										await deleteAccesoryStock(id);
									} else if (category === 'Insumos') {
										await deleteSupplyStock(id);
									} else {
										await deleteIronworkStock(id);
									}
									// No es necesario hacer refresh, el realtime lo actualizará
								} catch (err) {
									console.error('Error al eliminar item:', err);
								}
							}}
							onUpdateQuantity={async (id, newQuantity) => {
								if (newQuantity < 0) return;
								try {
									if (category === 'Accesorios') {
										await updateAccessoryStock(id, { accessory_quantity: newQuantity });
									} else if (category === 'Insumos') {
										await updateSupplyStock(id, { supply_quantity: newQuantity });
									} else {
										await updateIronworkStock(id, { ironwork_quantity: newQuantity });
									}
									// No es necesario hacer refresh, el realtime lo actualizará
								} catch (err) {
									console.error('Error al actualizar cantidad:', err);
								}
							}}
						/>
					)}

					{/* Edit dialog for selected item */}
					{isEditDialogOpen && editingItem && (
						(category === 'Perfiles') ? (
							<StockFormDialog
								open={isEditDialogOpen}
								onOpenChange={setIsEditDialogOpen}
								editItem={editingItem}
								materialType={materialType}
								onSave={async (changes) => {
									const { error } = await updateProfileStock(editingItem.id, changes as any);
									if (error) console.error('Error al guardar perfil:', error);
									// No es necesario hacer refresh, el realtime lo actualizará
									setIsEditDialogOpen(false);
								}}
							/>
						) : (
							<AccessoryFormDialog
								open={isEditDialogOpen}
								onOpenChange={setIsEditDialogOpen}
								category={category as StockCategory}
								editItem={editingItem}
								onSave={async (changes) => {
									try {
										if (category === 'Accesorios') {
											await updateAccessoryStock(editingItem.id, changes as any);
										} else if (category === 'Insumos') {
											await updateSupplyStock(editingItem.id, changes as any);
										} else {
											await updateIronworkStock(editingItem.id, changes as any);
										}
										// No es necesario hacer refresh, el realtime lo actualizará
									} catch (err) {
										console.error('Error al actualizar item:', err);
									}
									setIsEditDialogOpen(false);
								}}
							/>
						)
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
