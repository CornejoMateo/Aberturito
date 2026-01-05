'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogCancel,
	AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { OptionDialog } from './option-add';
import { toast } from '@/components/ui/use-toast';

import { deleteOption } from '@/lib/stock/stock-options';
import {
	listOptions,
	type LineOption,
	CodeOption,
	ColorOption,
	SiteOption,
} from '@/lib/stock/stock-options';
import { useOptions } from '@/hooks/use-options';

interface OptionsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	materialType?: 'Aluminio' | 'PVC';
}

export function OptionsModal({ materialType, open, onOpenChange }: OptionsModalProps) {
	// Estados para abrir los diálogos de agregar
	const [isAddLineOpen, setIsAddLineOpen] = useState(false);
	const [isAddColorOpen, setIsAddColorOpen] = useState(false);
	const [isAddCodeOpen, setIsAddCodeOpen] = useState(false);
	const [isAddSiteOpen, setIsAddSiteOpen] = useState(false);

	// Estados para controlar qué secciones están abiertas
	const [openSections, setOpenSections] = useState({
		lines: true,
		codes: true,
		colors: true,
		sites: true,
	});

	const toggleSection = (section: keyof typeof openSections) => {
		setOpenSections((prev) => ({
			...prev,
			[section]: !prev[section],
		}));
	};

	// AlertDialog for delete option
	const [deleteDialog, setDeleteDialog] = useState<{
		open: boolean;
		table: string;
		id: number | undefined;
		label: string;
	}>({ open: false, table: '', id: undefined, label: '' });

	const {
		options: lines,
		loading: loadingLines,
		updateOptions: updateLines,
	} = useOptions<LineOption>('lines', () =>
		listOptions('lines').then((res) => (res.data ?? []) as LineOption[])
	);

	// Filtrar líneas según materialType
	const filteredLines = materialType
		? lines.filter((line) => line.opening === materialType)
		: lines;

	const {
		options: codes,
		loading: loadingCodes,
		updateOptions: updateCodes,
	} = useOptions<CodeOption>('codes', () =>
		listOptions('codes').then((res) => (res.data ?? []) as CodeOption[])
	);

	// Filtrar códigos según las líneas del materialType actual
	const filteredCodes = materialType
		? codes.filter((code) => filteredLines.some((line) => line.name_line === code.line_name))
		: codes;

	const {
		options: colors,
		loading: loadingColors,
		updateOptions: updateColors,
	} = useOptions<ColorOption>('colors', () =>
		listOptions('colors').then((res) => (res.data ?? []) as ColorOption[])
	);

	// Filtrar colores según las líneas del materialType actual
	const filteredColors = materialType
		? colors.filter((color) => filteredLines.some((line) => line.name_line === color.line_name))
		: colors;

	const {
		options: sites,
		loading: loadingSites,
		updateOptions: updateSites,
	} = useOptions<SiteOption>('sites', () =>
		listOptions('sites').then((res) => (res.data ?? []) as SiteOption[])
	);

	const handleDeleteOption = async (table: string, id: number, material_type: string) => {
		try {
			const { error } = await deleteOption(table, id, material_type);

			if (error) {
				console.error('Error al eliminar:', error);
				let errorMessage = 'Ocurrió un error al eliminar el elemento.';
				if (error.message?.includes('violates foreign key constraint')) {
					errorMessage =
						'No se puede eliminar este elemento porque está siendo utilizado por otra de las opciones.';
				}
				toast({
					title: 'Error al eliminar',
					description: errorMessage,
					variant: 'destructive',
					duration: 5000,
				});
				console.log('Mostrando toast de error:', errorMessage);
				return;
			}

			if (table === 'lines') {
				const updated = lines.filter((opt: LineOption) => opt.id !== id);
				updateLines(updated);
				localStorage.setItem('lines', JSON.stringify(updated));
			} else if (table === 'codes') {
				const updated = codes.filter((opt: CodeOption) => opt.id !== id);
				updateCodes(updated);
				localStorage.setItem('codes', JSON.stringify(updated));
			} else if (table === 'colors') {
				const updated = colors.filter((opt: ColorOption) => opt.id !== id);
				updateColors(updated);
				localStorage.setItem('colors', JSON.stringify(updated));
			} else if (table === 'sites') {
				const updated = sites.filter((opt: SiteOption) => opt.id !== id);
				updateSites(updated);
				localStorage.setItem('sites', JSON.stringify(updated));
			}

			toast({
				title: 'Éxito',
				description: 'Elemento eliminado correctamente',
				duration: 3000,
			});
			console.log('Mostrando toast de éxito');
		} catch (err) {
			console.error('Error inesperado:', err);
			toast({
				title: 'Error inesperado',
				description: 'Ocurrió un error inesperado al eliminar el elemento.',
				variant: 'destructive',
				duration: 5000,
			});
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent showCloseButton={false} className="bg-card max-h-[90vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>Administrar opciones</DialogTitle>
					<DialogDescription>
						Gestione colores, líneas, códigos/nombres y ubicaciones
					</DialogDescription>
				</DialogHeader>

				<div className="overflow-y-auto flex-1 py-4 pr-2 -mr-2 grid gap-6">
					{/* Table lines */}
					<Collapsible
						open={openSections.lines}
						onOpenChange={() => toggleSection('lines')}
						className="border rounded"
					>
						<CollapsibleTrigger asChild>
							<div className="flex justify-between items-center p-3 hover:bg-accent/50 cursor-pointer">
								<h3 className="font-semibold text-base">Líneas</h3>
								<div className="flex items-center gap-2">
									<OptionDialog
										open={isAddLineOpen}
										onOpenChange={setIsAddLineOpen}
										materialType={materialType}
										onSave={async (option) => {
											const updated = [...lines, option as LineOption].sort((a, b) => a.name_line.localeCompare(b.name_line));
											localStorage.setItem('lines', JSON.stringify(updated));
											updateLines(updated);
										}}
										triggerButton={true}
										table="lines"
									/>
									{openSections.lines ? (
										<ChevronUp className="w-4 h-4" />
									) : (
										<ChevronDown className="w-4 h-4" />
									)}
								</div>
							</div>
						</CollapsibleTrigger>
						<CollapsibleContent>
							<div className="px-3 pb-3">
								<table className="table-auto w-full border-collapse">
									<thead>
										<tr className="border-b">
											<th className="text-left p-1">Linea</th>
											<th className="text-left p-1">Abertura</th>
											<th className="text-center p-1">Eliminar</th>
										</tr>
									</thead>
									<tbody>
										{filteredLines.map((line: LineOption, idx: number) => (
											<tr key={`${line.id}-${line.name_line}-${idx}`} className="border-b">
												<td className="p-1">{line.name_line}</td>
												<td className="p-1">{line.opening}</td>
												<td className="p-1 text-center">
													<Button
														variant="ghost"
														size="icon"
														className="mx-auto"
														onClick={() =>
															setDeleteDialog({
																open: true,
																table: 'lines',
																id: line.id,
																label: line.name_line ?? '',
															})
														}
													>
														<Trash2 className="w-4 h-4 text-destructive" />
													</Button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</CollapsibleContent>
					</Collapsible>

					{/* Table codes */}
					<Collapsible
						open={openSections.codes}
						onOpenChange={() => toggleSection('codes')}
						className="border rounded"
					>
						<CollapsibleTrigger asChild>
							<div className="flex justify-between items-center p-3 hover:bg-accent/50 cursor-pointer">
								<h3 className="font-semibold text-base">Códigos</h3>
								<div className="flex items-center gap-2">
									<OptionDialog
										open={isAddCodeOpen}
										onOpenChange={setIsAddCodeOpen}
										onSave={async (option) => {
											const updated = [option as CodeOption, ...codes];
											localStorage.setItem('codes', JSON.stringify(updated));
											updateCodes(updated);
										}}
										triggerButton={true}
										table="codes"
										materialType={materialType}
									/>
									{openSections.codes ? (
										<ChevronUp className="w-4 h-4" />
									) : (
										<ChevronDown className="w-4 h-4" />
									)}
								</div>
							</div>
						</CollapsibleTrigger>
						<CollapsibleContent>
							<div className="px-3 pb-3">
								<table className="table-auto w-full border-collapse">
									<thead>
										<tr className="border-b">
											<th className="text-left p-1">Código</th>
											<th className="text-left p-1">Línea</th>
											<th className="text-center p-1">Eliminar</th>
										</tr>
									</thead>
									<tbody>
										{filteredCodes.map((code: CodeOption, idx: number) => (
											<tr key={`${code.id}-${code.name_code}-${idx}`} className="border-b">
												<td className="p-1">{code.name_code}</td>
												<td className="p-1">{code.line_name}</td>
												<td className="p-1 text-center">
													<Button
														variant="ghost"
														size="icon"
														className="mx-auto"
														onClick={() =>
															setDeleteDialog({
																open: true,
																table: 'codes',
																id: code.id,
																label: code.name_code ?? '',
															})
														}
													>
														<Trash2 className="w-4 h-4 text-destructive" />
													</Button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</CollapsibleContent>
					</Collapsible>

					{/* Table colors */}
					<Collapsible
						open={openSections.colors}
						onOpenChange={() => toggleSection('colors')}
						className="border rounded"
					>
						<CollapsibleTrigger asChild>
							<div className="flex justify-between items-center p-3 hover:bg-accent/50 cursor-pointer">
								<h3 className="font-semibold text-base">Colores</h3>
								<div className="flex items-center gap-2">
									<OptionDialog
										open={isAddColorOpen}
										onOpenChange={setIsAddColorOpen}
										onSave={async (option) => {
											const updated = [option as ColorOption, ...colors];
											localStorage.setItem('colors', JSON.stringify(updated));
											updateColors(updated);
										}}
										triggerButton={true}
										table="colors"
										materialType={materialType}
									/>
									{openSections.colors ? (
										<ChevronUp className="w-4 h-4" />
									) : (
										<ChevronDown className="w-4 h-4" />
									)}
								</div>
							</div>
						</CollapsibleTrigger>
						<CollapsibleContent>
							<div className="px-3 pb-3">
								<table className="table-auto w-full border-collapse">
									<thead>
										<tr className="border-b">
											<th className="text-left p-1">Color</th>
											<th className="text-left p-1">Línea</th>
											<th className="text-center p-1">Eliminar</th>
										</tr>
									</thead>
									<tbody>
										{filteredColors.map((color: ColorOption, idx: number) => (
											<tr key={`${color.id}-${color.name_color}-${idx}`} className="border-b">
												<td className="p-1">{color.name_color}</td>
												<td className="p-1">{color.line_name}</td>
												<td className="p-1 text-center">
													<Button
														variant="ghost"
														size="icon"
														className="mx-auto"
														onClick={() =>
															setDeleteDialog({
																open: true,
																table: 'colors',
																id: color.id,
																label: color.name_color ?? '',
															})
														}
													>
														<Trash2 className="w-4 h-4 text-destructive" />
													</Button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</CollapsibleContent>
					</Collapsible>

					{/* Table sites */}
					<Collapsible
						open={openSections.sites}
						onOpenChange={() => toggleSection('sites')}
						className="border rounded"
					>
						<CollapsibleTrigger asChild>
							<div className="flex justify-between items-center p-3 hover:bg-accent/50 cursor-pointer">
								<h3 className="font-semibold text-base">Ubicaciones</h3>
								<div className="flex items-center gap-2">
									<OptionDialog
										open={isAddSiteOpen}
										onOpenChange={setIsAddSiteOpen}
										onSave={async (option) => {
											const updated = [option as SiteOption, ...sites];
											localStorage.setItem('sites', JSON.stringify(updated));
											updateSites(updated);
										}}
										triggerButton={true}
										table="sites"
									/>
									{openSections.sites ? (
										<ChevronUp className="w-4 h-4" />
									) : (
										<ChevronDown className="w-4 h-4" />
									)}
								</div>
							</div>
						</CollapsibleTrigger>
						<CollapsibleContent>
							<div className="px-3 pb-3">
								<table className="table-auto w-full border-collapse">
									<thead>
										<tr className="border-b">
											<th className="text-left p-1">Ubicación</th>
											<th className="text-center p-1">Eliminar</th>
										</tr>
									</thead>
									<tbody>
										{sites.map((site: SiteOption) => (
											<tr key={`${site.id}-${site.name_site}`} className="border-b">
												<td className="p-1">{site.name_site}</td>
												<td className="p-1 text-center">
													<Button
														variant="ghost"
														size="icon"
														className="mx-auto"
														onClick={() =>
															setDeleteDialog({
																open: true,
																table: 'sites',
																id: site.id,
																label: site.name_site ?? '',
															})
														}
													>
														<Trash2 className="w-4 h-4 text-destructive" />
													</Button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</CollapsibleContent>
					</Collapsible>
				</div>

				{/* AlertDialog for delete option */}
				<AlertDialog
					open={deleteDialog.open}
					onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
				>
					<AlertDialogContent>
						<AlertDialogTitle>¿Eliminar opción?</AlertDialogTitle>
						<AlertDialogDescription>
							¿Estás seguro que deseas eliminar{' '}
							<span className="font-semibold">{deleteDialog.label}</span>? Esta acción no se puede
							deshacer.
						</AlertDialogDescription>
						<div className="flex justify-end gap-2 mt-4">
							<AlertDialogCancel>Cancelar</AlertDialogCancel>
							<AlertDialogAction
								className="bg-destructive text-white hover:bg-destructive/90"
								onClick={async () => {
									if (deleteDialog.id)
										await handleDeleteOption(deleteDialog.table, deleteDialog.id, materialType || '');
									setDeleteDialog({ open: false, table: '', id: undefined, label: '' });
								}}
							>
								Eliminar
							</AlertDialogAction>
						</div>
					</AlertDialogContent>
				</AlertDialog>

				<DialogFooter className="flex-shrink-0 pt-4 border-t border-border">
					<Button
						variant="outline"
						onClick={() => {
							onOpenChange(false);
							window.location.reload(); // Navega a la misma ruta, forzando recarga
						}}
					>
						Cerrar
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
