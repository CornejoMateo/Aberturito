'use client';

import { useState, useMemo, useEffect } from 'react';
import { StockFormDialog } from '../../utils/stock/stock-add-dialog';
import { StockStats } from '../../utils/stock/stock-stats';
import { StockFilters } from '../../utils/stock/stock-filters';
import { generateStockReportPDF } from '@/lib/stock/stock-pdf';
import { Download } from 'lucide-react';
import { ProfileTable } from '../../utils/stock/profile-table';
import { AccesoriesTable } from '@/utils/stock/stock-tables';
import { AccessoryFormDialog } from '@/utils/stock/accessory-add-dialog';
import { OptionsModal } from '@/utils/stock/options/options';
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
import { useOptimizedRealtime } from '@/hooks/use-optimized-realtime';
import { Image } from 'lucide-react';
import { PhotoGalleryModal } from '@/utils/stock/images/photo-gallery-modal';
import { STOCK_CONFIGS, type StockCategory } from '@/lib/stock/stock-config';
import { filterStockItems } from '@/utils/stock/stock-filters-logic';
import { toast } from '../ui/use-toast';
import { translateError } from '@/lib/error-translator';
import { getDescription, getTitle } from '@/helpers/stock/stock-management';
import { STOCK_ADAPTERS } from '@/lib/stock/adapters';
import { separateProfile, unseparateProfile } from '@/lib/stock/profile-stock';
import { StockThresholdsDialog } from '@/utils/stock/stock-thresholds-dialog';
import { listStockThresholds } from '@/lib/stock/stock-thresholds';
import { useAuth } from '@/components/provider/auth-provider';

interface StockManagementProps {
	materialType?: 'Aluminio' | 'PVC';
	category?: 'Perfiles' | StockCategory;
}

export function StockManagement({
	materialType = 'Aluminio',
	category = 'Perfiles',
}: StockManagementProps) {
	const { user } = useAuth();
	// Get adapter for current category
	const adapter = STOCK_ADAPTERS[category] || STOCK_ADAPTERS['Perfiles'];
	const tableName =
		category === 'Perfiles' ? 'profiles' : STOCK_CONFIGS[category as StockCategory].tableName;
	const fetcher = () => adapter.fetch();

	const {
		data: stock,
		loading,
		error,
	} = useOptimizedRealtime<any>(tableName, fetcher, `realtime_${category}_${materialType}`);

	const [searchTerm, setSearchTerm] = useState('');
	const [selectedCategory, setSelectedCategory] = useState(category);
	const [showOutOfStock, setShowOutOfStock] = useState(false);
	const [showLowStock, setShowLowStock] = useState(false);
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<any | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isPhotoGalleryOpen, setIsPhotoGalleryOpen] = useState(false);
	const [isThresholdsDialogOpen, setIsThresholdsDialogOpen] = useState(false);
	const [thresholds, setThresholds] = useState<Record<number, { yellow: number; red: number }>>({});
	const itemsPerPage = 10;

	const filteredStock = useMemo(() => {
		// First apply the standard filters (search, category, material)
		let result = filterStockItems(stock, searchTerm, selectedCategory, materialType, category);

		// Apply stock filters (out-of-stock and/or low stock)
		if (showOutOfStock || showLowStock) {
			result = result.filter((item: any) => {
				const config = STOCK_CONFIGS[category as keyof typeof STOCK_CONFIGS];
				const quantityField = config?.fields?.quantityLump;
				const quantity = quantityField ? (item as any)[quantityField] : adapter.getQuantity(item);
				
				// Check if item matches out-of-stock filter
				const matchesOutOfStock = showOutOfStock && quantity === 0;
				
				// Check if item matches low stock filter (only for Insumos)
				let matchesLowStock = false;
				if (showLowStock && category === 'Insumos') {
					const threshold = thresholds[item.id];
					if (threshold) {
						matchesLowStock = quantity <= threshold.yellow;
					}
				}
				
				// Return true if matches either filter (OR logic)
				return matchesOutOfStock || matchesLowStock;
			});
		}

		return result;
	}, [stock, searchTerm, selectedCategory, materialType, category, showOutOfStock, showLowStock, thresholds]);

	const totalPages = Math.ceil(filteredStock.length / itemsPerPage);

	const currentItems = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		return filteredStock.slice(startIndex, startIndex + itemsPerPage);
	}, [filteredStock, currentPage, itemsPerPage]);

	const lowStockItems = (stock || []).filter((item: any) => adapter.getQuantity(item) < 10);
	const totalItems = (stock || []).reduce(
		(sum: any, item: any) => sum + adapter.getQuantity(item),
		0
	);

	const lastAddedItem = [...(stock || [])].sort(
		(a: any, b: any) =>
			new Date(b.created_at || b.last_update || 0).getTime() -
			new Date(a.created_at || a.last_update || 0).getTime()
	)[0];

	// Load thresholds when category is Insumos
	useEffect(() => {
		if (category !== 'Insumos') return;

		const loadThresholds = async () => {
			const { data, error } = await listStockThresholds();
			if (error) {
				console.error('Error loading thresholds:', error);
				return;
			}

			const thresholdsMap = (data || []).reduce<Record<number, { yellow: number; red: number }>>(
				(acc, t) => {
					acc[t.item_id] = {
						yellow: t.yellow_threshold,
						red: t.red_threshold,
					};
					return acc;
				},
				{}
			);
			setThresholds(thresholdsMap);
		};

		loadThresholds();
	}, [category, stock]);

	const handleEdit = (id: number) => {
		const item = stock.find((s) => s.id === id);
		if (item) {
			setEditingItem(item);
			setIsEditDialogOpen(true);
		}
	};

	const handleSeparate = async (id: number, workId: number) => {
		try {
			const result = await separateProfile(id, workId);
			if (result?.error) {
				const errorMessage = translateError(result.error);
				toast({
					title: 'Error',
					description: errorMessage || 'No se pudo separar el perfil. Intenta nuevamente.',
					variant: 'destructive',
				});
				return;
			}
			toast({
				title: 'Éxito',
				description: 'Perfil separado correctamente para la obra.',
			});
		} catch (error) {
			const errorMessage = translateError(error);
			console.error('Error al separar perfil:', error);
			toast({
				title: 'Error',
				description: errorMessage || 'No se pudo separar el perfil. Intenta nuevamente.',
				variant: 'destructive',
			});
		}
	};

	const handleUnseparate = async (id: number) => {
		try {
			const result = await unseparateProfile(id);
			if (result?.error) {
				const errorMessage = translateError(result.error);
				toast({
					title: 'Error',
					description: errorMessage || 'No se pudo desmarcar el perfil. Intenta nuevamente.',
					variant: 'destructive',
				});
				return;
			}
			toast({
				title: 'Éxito',
				description: 'Perfil desmarcado correctamente.',
			});
		} catch (error) {
			const errorMessage = translateError(error);
			console.error('Error al desmarcar perfil:', error);
			toast({
				title: 'Error',
				description: errorMessage || 'No se pudo desmarcar el perfil. Intenta nuevamente.',
				variant: 'destructive',
			});
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h2 className="text-2xl font-bold text-foreground text-balance">{getTitle(category, materialType)}</h2>
					<p className="text-muted-foreground mt-1">{getDescription(category, materialType)}</p>
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

					{category === 'Insumos' && user?.role === 'Admin' && (
						<Button variant="default" onClick={() => setIsThresholdsDialogOpen(true)} className="gap-2">
							<Settings className="h-5 w-5" />
							Configurar Umbrales
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
								try {
									const result = await adapter.create(newItem);
									if (result?.error) {
										const errorMessage = translateError(result.error);
										toast({
											title: 'Error',
											description: errorMessage || 'No se pudo crear el perfil. Intenta nuevamente.',
											variant: 'destructive',
										});
										return;
									}
									setIsAddDialogOpen(false);
								} catch (error) {
									console.error('Error al crear:', error);
									const errorMessage = translateError(error);
									toast({
										title: 'Error',
										description: errorMessage || 'No se pudo crear el perfil. Intenta nuevamente.',
										variant: 'destructive',
									});
								}
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
									const result = await adapter.create(newItem);
									if (result?.error) {
										const errorMessage = translateError(result.error);
										toast({
											title: 'Error',
											description: errorMessage || 'No se pudo crear el item. Intenta nuevamente.',
											variant: 'destructive',
										});
										return;
									}
									setIsAddDialogOpen(false);
								} catch (error) {
									console.error('Error al crear:', error);
									const errorMessage = translateError(error);
									toast({
										title: 'Error',
										description: errorMessage || 'No se pudo crear el item. Intenta nuevamente.',
										variant: 'destructive',
									});
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
			<div className="flex gap-4">
				<StockFilters
					searchTerm={searchTerm}
					setSearchTerm={setSearchTerm}
					selectedCategory={selectedCategory}
					setSelectedCategory={setSelectedCategory}
					showOutOfStock={showOutOfStock}
					setShowOutOfStock={setShowOutOfStock}
					showLowStock={showLowStock}
					setShowLowStock={setShowLowStock}
				/>
				{category === 'Insumos' && (
					<Button
						variant="outline"
						onClick={async () => {
							try {
								await generateStockReportPDF(filteredStock, category, showOutOfStock, showLowStock);
							} catch (error) {
								console.error('Error generating PDF:', error);
								toast({
									title: 'Error',
									description: 'No se pudo generar el PDF. Intenta nuevamente.',
									variant: 'destructive',
								});
							}
						}}
						className="h-auto"
					>
						<Download className="mr-2 h-4 w-4" />
						Descargar PDF
					</Button>
				)}
			</div>

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
								try {
									const result = await adapter.remove(id);
									if (result?.error) {
										const errorMessage = translateError(result.error);
										toast({
											title: 'Error',
											description: errorMessage || 'No se pudo eliminar el perfil. Intenta nuevamente.',
											variant: 'destructive',
										});
									}
									toast({
										title: 'Éxito',
										description: 'Perfil eliminado correctamente.',
									});
								} catch (error) {
									const errorMessage = translateError(error);
									console.error('Error al eliminar:', error);
									toast({
										title: 'Error',
										description: errorMessage || 'No se pudo eliminar el perfil. Intenta nuevamente.',
										variant: 'destructive',
									});
								}
							}}
							onUpdateQuantity={async (id, newQuantity) => {
								if (newQuantity < 0) return;
								try {
									const result = await adapter.updateQuantity(id, newQuantity);
									if (result?.error) {
										const errorMessage = translateError(result.error);
										toast({
											title: 'Error',
											description: errorMessage || 'No se pudo actualizar la cantidad. Intenta nuevamente.',
											variant: 'destructive',
										});
									}
								} catch (error) {
									console.error('Error al actualizar cantidad:', error);
									toast({
										title: 'Error',
										description: 'No se pudo actualizar la cantidad. Intenta nuevamente.',
										variant: 'destructive',
									});
								}
							}}
							onSeparate={handleSeparate}
							onUnseparate={handleUnseparate}
						/>
					) : (
						<AccesoriesTable
							categoryState={category as StockCategory}
							filteredStock={currentItems}
							thresholds={thresholds}
							onEdit={(id) => {
								const it = (stock || []).find((s: any) => s.id === id);
								if (it) {
									setEditingItem(it);
									setIsEditDialogOpen(true);
								}
							}}
							onDelete={async (id) => {
								try {
									const result = await adapter.remove(id);
									if (result?.error) {
										const errorMessage = translateError(result.error);
										toast({
											title: 'Error',
											description: errorMessage || 'No se pudo eliminar el item. Intenta nuevamente.',
											variant: 'destructive',
										});
									}
									toast({
										title: 'Éxito',
										description: 'Item eliminado correctamente.',
									});
								} catch (error) {
									const errorMessage = translateError(error);
									toast({
										title: 'Error',
										description: errorMessage || 'No se pudo eliminar el item. Intenta nuevamente.',
										variant: 'destructive',
									});
								}
							}}
							onUpdateQuantity={async (id, newQuantity) => {
								if (newQuantity < 0) return;
								try {
									const result = await adapter.updateQuantity(id, newQuantity);
									if (result?.error) {
										const errorMessage = translateError(result.error);
										toast({
											title: 'Error',
											description: errorMessage || 'No se pudo actualizar la cantidad. Intenta nuevamente.',
											variant: 'destructive',
										});
									}
								} catch (error) {
									console.error('Error al actualizar cantidad:', error);
									const errorMessage = translateError(error);
									toast({
										title: 'Error',
										description: errorMessage || 'No se pudo actualizar la cantidad. Intenta nuevamente.',
										variant: 'destructive',
									});
								}
							}}
						/>
					)}

					{/* Edit dialog for selected item */}
					{isEditDialogOpen &&
						editingItem &&
						(category === 'Perfiles' ? (
							<StockFormDialog
								open={isEditDialogOpen}
								onOpenChange={setIsEditDialogOpen}
								editItem={editingItem}
								materialType={materialType}
								onSave={async (changes) => {
									try {
										const result = await adapter.update(editingItem.id, changes);
										if (result?.error) {
											const errorMessage = translateError(result.error);
											toast({
												title: 'Error',
												description:
													errorMessage || 'No se pudo actualizar el perfil. Intenta nuevamente.',
												variant: 'destructive',
											});
											return;
										}
										setIsEditDialogOpen(false);
									} catch (error) {
										console.error('Error al actualizar:', error);
										const errorMessage = translateError(error);
										toast({
											title: 'Error',
											description:
												errorMessage || 'No se pudo actualizar el perfil. Intenta nuevamente.',
											variant: 'destructive',
										});
									}
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
										const result = await adapter.update(editingItem.id, changes);
										if (result?.error) {
											const errorMessage = translateError(result.error);
											toast({
												title: 'Error',
												description: errorMessage || 'No se pudo actualizar el item. Intenta nuevamente.',
												variant: 'destructive',
											});
											return;
										}
										setIsEditDialogOpen(false);
									} catch (error) {
										console.error('Error al actualizar:', error);
										const errorMessage = translateError(error);
										toast({
											title: 'Error',
											description: errorMessage || 'No se pudo actualizar el item. Intenta nuevamente.',
											variant: 'destructive',
										});
									}
								}}
							/>
						))}

					{/* Pagination */}
					{filteredStock.length > itemsPerPage && (
						<div className="flex items-center justify-between px-2 mt-4">
							<div className="text-sm text-muted-foreground">
								Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filteredStock.length)}-
								{Math.min(currentPage * itemsPerPage, filteredStock.length)} de{' '}
								{filteredStock.length} elementos
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

			{category === 'Insumos' && (
				<StockThresholdsDialog
					open={isThresholdsDialogOpen}
					onOpenChange={setIsThresholdsDialogOpen}
				/>
			)}
		</div>
	);
}
