import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Edit, Trash2, Plus, Minus, Bookmark, BookmarkCheck } from 'lucide-react';
import { type ProfileItemStock } from '@/lib/stock/profile-stock';
import { useState, useEffect } from 'react';
import { ConfirmUpdateDialog } from '@/utils/stock/confirm-update-dialog';
import ImageViewer from '@/components/ui/image-viewer';
import {
	AlertDialog,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogAction,
	AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { formatCreatedAt } from '@/helpers/date/format-date';
import { listWorks } from '@/lib/works/works';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/components/ui/use-toast';
import { getSupabaseClient } from '@/lib/supabase-client';

interface ProfileTableProps {
	filteredStock: ProfileItemStock[];
	onEdit: (id: number) => void;
	onDelete: (id: number) => void;
	onUpdateQuantity: (id: number, newQuantity: number) => Promise<void>;
	onSeparate?: (id: number, workId: number) => Promise<void>;
	onUnseparate?: (id: number) => Promise<void>;
}

export function ProfileTable({
	filteredStock,
	onEdit,
	onDelete,
	onUpdateQuantity,
	onSeparate,
	onUnseparate,
}: ProfileTableProps) {
	const [updatingId, setUpdatingId] = useState<number | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);
	const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
	const [currentAction, setCurrentAction] = useState<{
		id: number;
		action: 'increment' | 'decrement';
		currentQty: number;
	} | null>(null);
	const [openImageUrl, setOpenImageUrl] = useState<string | null>(null);
	const [separateDialogOpen, setSeparateDialogOpen] = useState(false);
	const [selectedProfile, setSelectedProfile] = useState<ProfileItemStock | null>(null);
	const [selectedWorkId, setSelectedWorkId] = useState<string>('');
	const [works, setWorks] = useState<any[]>([]);
	const [workSelectDialogOpen, setWorkSelectDialogOpen] = useState(false);

	useEffect(() => {
		const loadWorks = async () => {
			const { data } = await listWorks();
			if (data) {
				setWorks(data);
			}
		};
		loadWorks();
	}, []);

	const handleOpenSeparateDialog = (profile: ProfileItemStock) => {
		setSelectedProfile(profile);
		setSelectedWorkId(profile.separated_for_work_id ? String(profile.separated_for_work_id) : '');
		setSeparateDialogOpen(true);
	};

	const handleSeparate = async () => {
		if (!selectedProfile || !selectedWorkId || !onSeparate) return;
		try {
			setIsUpdating(true);
			setUpdatingId(selectedProfile.id!);
			await onSeparate(selectedProfile.id!, parseInt(selectedWorkId));
			setSeparateDialogOpen(false);
		} finally {
			setIsUpdating(false);
			setUpdatingId(null);
		}
	};

	const handleUnseparate = async (id: number) => {
		if (!onUnseparate) return;
		try {
			setIsUpdating(true);
			setUpdatingId(id);
			await onUnseparate(id);
		} finally {
			setIsUpdating(false);
			setUpdatingId(null);
		}
	};
	const [imageUrlsById, setImageUrlsById] = useState<Record<number, string>>({});

	useEffect(() => {
		let isMounted = true;

		const loadImageUrls = async () => {
			const imageIds = Array.from(
				new Set(filteredStock.map((item) => item.image_id).filter((id): id is number => !!id))
			);

			if (imageIds.length === 0) {
				if (isMounted) {
					setImageUrlsById({});
				}
				return;
			}

			const supabase = getSupabaseClient();
			const { data, error } = await supabase
				.from('gallery_profiles')
				.select('id, image_url')
				.in('id', imageIds);

			if (!isMounted) return;

			if (error) {
				console.error('Error loading profile images:', error);
				return;
			}

			const nextImageUrlsById = (data ?? []).reduce<Record<number, string>>((acc, row) => {
				if (row.image_url) {
					acc[row.id] = row.image_url;
				}
				return acc;
			}, {});

			setImageUrlsById(nextImageUrlsById);
		};

		loadImageUrls();

		return () => {
			isMounted = false;
		};
	}, [filteredStock]);

	const handleQuantityAction = (
		id: number,
		action: 'increment' | 'decrement',
		currentQty: number
	) => {
		setCurrentAction({ id, action, currentQty });
		setConfirmDialogOpen(true);
	};

	const handleConfirmUpdate = async () => {
		if (!currentAction) return;

		const { id, action, currentQty } = currentAction;
		const newQuantity = action === 'increment' ? currentQty + 1 : currentQty - 1;

		try {
			setIsUpdating(true);
			setUpdatingId(id);
			await onUpdateQuantity(id, newQuantity);
			toast({
				title: 'Cantidad actualizada',
				description: `La cantidad ha sido ${action === 'increment' ? 'incrementada' : 'disminuida'} a ${newQuantity}.`,
			});
		} finally {
			setIsUpdating(false);
			setUpdatingId(null);
			setConfirmDialogOpen(false);
			setCurrentAction(null);
		}
	};

	const getItemName = (item: ProfileItemStock) => {
		return [item.line, item.code, item.color].filter(Boolean).join(' ') || 'este ítem';
	};

	return (
		<Card className="bg-card border-border overflow-hidden">
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead className="border-b border-border bg-secondary">
						<tr>
							<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Linea
							</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Código
							</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Color
							</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Largo (mm)
							</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Cantidad
							</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Estado
							</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Ubicación
							</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Fecha de creación
							</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Separado para obra
							</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Acciones
							</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Imagen
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border">
						{filteredStock.length === 0 ? (
							<tr>
								<td colSpan={11} className="px-6 py-12 text-center">
									<div className="flex flex-col items-center gap-2 text-muted-foreground">
										<Package className="h-12 w-12 opacity-50" />
										<p className="text-lg font-medium">No hay items en stock</p>
									</div>
								</td>
							</tr>
						) : (
							filteredStock.map((item) => {
								return (
									<tr
										key={item.id}
										className={`hover:bg-secondary/50 transition-colors ${
											item.separated_for_work_id ? 'bg-yellow-100 dark:bg-yellow-900/20' : ''
										}`}
									>
										<td className="px-2 py-2 whitespace-nowrap">
											<p className="text-center text-sm text-foreground">{item.line || 'N/A'}</p>
										</td>
										<td className="px-2 py-2 whitespace-nowrap">
											<p className="text-center text-sm text-foreground">{item.code || 'N/A'}</p>
										</td>
										<td className="px-2 py-2 whitespace-nowrap">
											<p className="text-center text-sm text-foreground">{item.color || 'N/A'}</p>
										</td>
										<td className="px-2 py-2 whitespace-nowrap">
											<p className="text-center text-sm text-foreground">
												{item.width ? `${item.width} mm` : 'N/A'}
											</p>
										</td>
										<td className="px-2 py-2 whitespace-nowrap">
											<div className="flex items-center justify-center gap-1">
												<Button
													variant="outline"
													size="icon"
													className="h-7 w-7"
													onClick={() =>
														handleQuantityAction(item.id!, 'decrement', item.quantity ?? 0)
													}
													disabled={
														(isUpdating && updatingId === item.id) || (item.quantity ?? 0) <= 0
													}
												>
													<Minus className="h-3.5 w-3.5" />
												</Button>
												<div className="text-center min-w-[50px]">
													<p className="text-sm font-medium">{item.quantity ?? 0}</p>
													<p className="text-xs text-muted-foreground">unidades</p>
												</div>
												<Button
													variant="outline"
													size="icon"
													className="h-7 w-7"
													onClick={() =>
														handleQuantityAction(item.id!, 'increment', item.quantity ?? 0)
													}
													disabled={isUpdating && updatingId === item.id}
												>
													<Plus className="h-3.5 w-3.5" />
												</Button>
											</div>
										</td>
										<td className="px-2 py-2 whitespace-nowrap">
											<div className="flex justify-center">
												{(() => {
													let badgeColor = 'bg-green-500 text-white';
													let label = item.status || 'N/A';
													if (label === 'Malo') {
														badgeColor = 'bg-red-500 text-white';
													} else if (label === 'Medio') {
														badgeColor = 'bg-yellow-400 text-white';
													} else if (label === 'Bueno') {
														badgeColor = 'bg-green-500 text-white';
													} else {
														badgeColor = 'bg-muted-foreground text-white';
													}
													return <Badge className={`gap-1 text-sm ${badgeColor}`}>{label}</Badge>;
												})()}
											</div>
										</td>
										<td className="px-2 py-2 whitespace-nowrap">
											<p className="text-center text-sm text-muted-foreground">
												{item.site || 'N/A'}
											</p>
										</td>
										<td className="px-2 py-2 whitespace-nowrap">
											<p className="text-center text-xs text-muted-foreground">
												{formatCreatedAt(item.created_at)}
											</p>
										</td>
										<td className="px-2 py-2 whitespace-nowrap text-center">
											{item.separated_for_work_id && item.separated_for_work ? (
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<Badge
																variant="outline"
																className="bg-yellow-200 dark:bg-yellow-900/30 border-yellow-400 max-w-[150px] truncate cursor-help"
															>
																{item.separated_for_work.clients?.name ||
																	item.separated_for_work.locality ||
																	item.separated_for_work.address ||
																	'Obra'}
															</Badge>
														</TooltipTrigger>
														<TooltipContent>
															<div className="flex flex-col gap-1">
																{item.separated_for_work.clients && (
																	<p className="font-medium">
																		{item.separated_for_work.clients.name}{' '}
																		{item.separated_for_work.clients.last_name}
																	</p>
																)}
																{item.separated_for_work.locality && (
																	<p className="text-sm text-muted-foreground">
																		{item.separated_for_work.locality}
																	</p>
																)}
																{item.separated_for_work.address && (
																	<p className="text-sm text-muted-foreground">
																		{item.separated_for_work.address}
																	</p>
																)}
															</div>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											) : (
												<span className="text-muted-foreground text-sm">-</span>
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right">
											<div className="flex justify-end gap-2">
												{onSeparate && onUnseparate && (
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8"
														onClick={() =>
															item.separated_for_work_id
																? handleUnseparate(item.id!)
																: handleOpenSeparateDialog(item)
														}
														disabled={isUpdating && updatingId === item.id}
														title={
															item.separated_for_work_id
																? 'Desmarcar como separado'
																: 'Marcar como separado'
														}
													>
														{item.separated_for_work_id ? (
															<BookmarkCheck className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
														) : (
															<Bookmark className="h-4 w-4" />
														)}
													</Button>
												)}
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8"
													onClick={() => item.id && onEdit(item.id)}
												>
													<Edit className="h-4 w-4" />
												</Button>
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8 text-destructive hover:text-destructive"
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogTitle>¿Eliminar perfil del stock?</AlertDialogTitle>
														<AlertDialogDescription>
															¿Estás seguro que deseas eliminar este perfil? Esta acción no se puede
															deshacer.
														</AlertDialogDescription>
														<div className="flex justify-end gap-2 mt-4">
															<AlertDialogCancel>Cancelar</AlertDialogCancel>
															<AlertDialogAction
																className="bg-destructive text-white hover:bg-destructive/90"
																onClick={() => item.id && onDelete(item.id)}
															>
																Eliminar
															</AlertDialogAction>
														</div>
													</AlertDialogContent>
												</AlertDialog>
											</div>
										</td>
										<td className="px-2 py-2 whitespace-nowrap">
											<div className="flex justify-center">
												{item.image_id && imageUrlsById[item.image_id] ? (
													<Button
														variant="outline"
														size="sm"
														onClick={() => setOpenImageUrl(imageUrlsById[item.image_id!])}
													>
														Ver
													</Button>
												) : (
													<span className="text-muted-foreground text-sm">No tiene</span>
												)}
											</div>
										</td>
									</tr>
								);
							})
						)}
					</tbody>
				</table>
			</div>

			{currentAction && (
				<ConfirmUpdateDialog
					open={confirmDialogOpen}
					onOpenChange={setConfirmDialogOpen}
					onConfirm={handleConfirmUpdate}
					itemName={getItemName(
						filteredStock.find((item) => item.id === currentAction.id) || ({} as ProfileItemStock)
					)}
					action={currentAction.action}
					quantity={currentAction.currentQty}
					isLoading={isUpdating && updatingId === currentAction.id}
				/>
			)}

			<ImageViewer
				open={!!openImageUrl}
				onOpenChange={(v) => (v ? null : setOpenImageUrl(null))}
				src={openImageUrl}
			/>

			<Dialog open={separateDialogOpen} onOpenChange={setSeparateDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Separar perfil para obra</DialogTitle>
						<DialogDescription>
							Selecciona la obra para la cual deseas separar este perfil:{' '}
							<strong>
								{selectedProfile?.code} {selectedProfile?.line} {selectedProfile?.color}
							</strong>
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<Label htmlFor="work-select">Obra</Label>
						<Button
							variant="outline"
							className="w-full justify-between mt-3"
							onClick={() => setWorkSelectDialogOpen(true)}
							id="work-select"
						>
							{selectedWorkId
								? (() => {
										const selectedWork = works.find((work) => String(work.id) === selectedWorkId);
										return selectedWork?.client_name
											? `${selectedWork.client_name}${selectedWork.client_last_name ? ` ${selectedWork.client_last_name}` : ''}`
											: selectedWork?.locality || selectedWork?.address || `Obra ${selectedWorkId}`;
									})()
								: 'Selecciona una obra'}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setSeparateDialogOpen(false)}>
							Cancelar
						</Button>
						<Button onClick={handleSeparate} disabled={!selectedWorkId || isUpdating}>
							{isUpdating ? 'Separando...' : 'Separar'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={workSelectDialogOpen} onOpenChange={setWorkSelectDialogOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Seleccionar obra</DialogTitle>
						<DialogDescription>
							Busca y selecciona la obra para separar el perfil.
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<Command className="rounded-lg border shadow-md">
							<CommandInput placeholder="Buscar obra por cliente, localidad o dirección..." />
							<CommandList className="max-h-[400px] overflow-y-auto">
								<CommandEmpty>No se encontraron obras.</CommandEmpty>
								<CommandGroup>
									{works.map((work) => (
										<CommandItem
											key={work.id}
											value={`${work.client_name || ''} ${work.client_last_name || ''} ${work.locality || ''} ${work.address || ''} ${work.id}`}
											onSelect={() => {
												setSelectedWorkId(String(work.id));
												setWorkSelectDialogOpen(false);
											}}
											className="cursor-pointer"
										>
											<Check
												className={cn(
													'mr-2 h-4 w-4',
													String(work.id) === selectedWorkId ? 'opacity-100' : 'opacity-0'
												)}
											/>
											<div className="flex flex-col">
												{work.client_name && (
													<span className="font-medium">
														{[work.client_name, work.client_last_name]
															.filter(Boolean)
															.join(' ')}{' '}
													</span>
												)}
												<span
													className={
														work.client_name ? 'text-sm text-muted-foreground' : 'font-medium'
													}
												>
													{work.locality || 'Sin localidad'}
												</span>
												{work.address && (
													<span className="text-sm text-muted-foreground">{work.address}</span>
												)}
											</div>
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</Command>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setWorkSelectDialogOpen(false)}>
							Cancelar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Card>
	);
}
