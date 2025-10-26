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
import { Plus, Trash2 } from 'lucide-react';
import { OptionDialog } from './option-add';

import { deleteOption } from '@/lib/stock_options';
import {
	listOptions,
	type LineOption,
	TypeOption,
	ColorOption,
	SiteOption,
} from '@/lib/stock_options';
import { useOptions } from '@/hooks/useOptions';
import { useRouter } from 'next/navigation';

interface OptionsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	materialType?: 'Aluminio' | 'PVC';
}

export function OptionsModal({ materialType, open, onOpenChange }: OptionsModalProps) {
	// Estados para abrir los diálogos de agregar
	const [isAddLineOpen, setIsAddLineOpen] = useState(false);
	const [isAddColorOpen, setIsAddColorOpen] = useState(false);
	const [isAddTypeOpen, setIsAddTypeOpen] = useState(false);
	const [isAddSiteOpen, setIsAddSiteOpen] = useState(false);
    const router = useRouter();

	// AlertDialog for delete option
	const [deleteDialog, setDeleteDialog] = useState<{
		open: boolean;
		table: string;
		id: number | string | undefined;
		label: string;
	}>({ open: false, table: '', id: undefined, label: '' });

	const {
		options: lines,
		loading: loadingLines,
		updateOptions: updateLines,
	} = useOptions<LineOption>('lines', () =>
		listOptions('lines').then((res) => (res.data ?? []) as LineOption[])
	);
	const {
		options: types,
		loading: loadingTypes,
		updateOptions: updateTypes,
	} = useOptions<TypeOption>('types', () =>
		listOptions('types').then((res) => (res.data ?? []) as TypeOption[])
	);
	const {
		options: colors,
		loading: loadingColors,
		updateOptions: updateColors,
	} = useOptions<ColorOption>('colors', () =>
		listOptions('colors').then((res) => (res.data ?? []) as ColorOption[])
	);
	const {
		options: sites,
		loading: loadingSites,
		updateOptions: updateSites,
	} = useOptions<SiteOption>('sites', () =>
		listOptions('sites').then((res) => (res.data ?? []) as SiteOption[])
	);

	const handleDeleteOption = async (table: string, id: number | string | undefined) => {
		if (id == null) return;
		await deleteOption(table, Number(id));
		// Actualiza el localStorage y el estado del hook
		if (table === 'lines') {
			const updated = lines.filter((l: LineOption) => l.id !== id);
			localStorage.setItem('lines', JSON.stringify(updated));
			updateLines(updated);
		} else if (table === 'types') {
			const updated = types.filter((t: TypeOption) => t.id !== id);
			localStorage.setItem('types', JSON.stringify(updated));
			updateTypes(updated);
		} else if (table === 'colors') {
			const updated = colors.filter((c: ColorOption) => c.id !== id);
			localStorage.setItem('colors', JSON.stringify(updated));
			updateColors(updated);
		} else if (table === 'sites') {
			const updated = sites.filter((s: SiteOption) => s.id !== id);
			localStorage.setItem('sites', JSON.stringify(updated));
			updateSites(updated);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent showCloseButton={false} className="bg-card max-h-[90vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>Administrar opciones</DialogTitle>
					<DialogDescription>Gestione colores, líneas, tipos y ubicaciones</DialogDescription>
				</DialogHeader>

				<div className="overflow-y-auto flex-1 py-4 pr-2 -mr-2 grid gap-6">
					{/* Table lines */}
					<div className="flex flex-col border p-2 rounded">
						<div className="flex justify-between items-center mb-2">
							<span className="font-semibold">Líneas</span>
							<OptionDialog
								open={isAddLineOpen}
								onOpenChange={setIsAddLineOpen}
								materialType={materialType}
								onSave={async (newLine: LineOption) => {
									const updated = [newLine, ...lines];
									localStorage.setItem('lines', JSON.stringify(updated));
									updateLines(updated);
								}}
								triggerButton={true}
								table="lines"
							/>
						</div>
						<table className="table-auto w-full border-collapse">
							<thead>
								<tr className="border-b">
									<th className="text-left p-1">Linea</th>
									<th className="text-left p-1">Abertura</th>
									<th className="text-left p-1">Eliminar</th>
								</tr>
							</thead>
							<tbody>
								{lines.map((line: LineOption, idx: number) => (
									<tr key={`${line.id}-${line.name_line}-${idx}`} className="border-b">
										<td className="p-1">{line.name_line}</td>
										<td className="p-1">{line.opening}</td>
										<td className="p-1">
											<Button
												variant="ghost"
												size="icon"
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
					{/* Table types */}
					<div className="flex flex-col border p-2 rounded">
						<div className="flex justify-between items-center mb-2">
							<span className="font-semibold">Tipos</span>
							<OptionDialog
								open={isAddTypeOpen}
								onOpenChange={setIsAddTypeOpen}
								onSave={async (newType: TypeOption) => {
									const updated = [newType, ...types];
									localStorage.setItem('types', JSON.stringify(updated));
									updateTypes(updated);
								}}
								triggerButton={true}
								table="types"
							/>
						</div>
						<table className="table-auto w-full border-collapse">
							<thead>
								<tr className="border-b">
									<th className="text-left p-1">Tipo</th>
									<th className="text-left p-1">Linea</th>
									<th className="text-left p-1">Eliminar</th>
								</tr>
							</thead>
							<tbody>
								{types.map((type: TypeOption, idx: number) => (
									<tr key={`${type.id}-${type.name_type}-${idx}`} className="border-b">
										<td className="p-1">{type.name_type}</td>
										<td className="p-1">{type.line_name}</td>
										<td className="p-1">
											<Button
												variant="ghost"
												size="icon"
												onClick={() =>
													setDeleteDialog({
														open: true,
														table: 'types',
														id: type.id,
														label: type.name_type ?? '',
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
					{/* Table colors */}
					<div className="flex flex-col border p-2 rounded">
						<div className="flex justify-between items-center mb-2">
							<span className="font-semibold">Colores</span>
							<OptionDialog
								open={isAddColorOpen}
								onOpenChange={setIsAddColorOpen}
								onSave={async (newColor: ColorOption) => {
									const updated = [newColor, ...colors];
									localStorage.setItem('colors', JSON.stringify(updated));
									updateColors(updated);
								}}
								triggerButton={true}
								table="colors"
							/>
						</div>
						<table className="table-auto w-full border-collapse">
							<thead>
								<tr className="border-b">
									<th className="text-left p-1">Color</th>
									<th className="text-left p-1">Linea</th>
									<th className="text-left p-1">Eliminar</th>
								</tr>
							</thead>
							<tbody>
								{colors.map((color: ColorOption, idx: number) => (
									<tr key={`${color.id}-${color.name_color}-${idx}`} className="border-b">
										<td className="p-1">{color.name_color}</td>
										<td className="p-1">{color.line_name}</td>
										<td className="p-1">
											<Button
												variant="ghost"
												size="icon"
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
					{/* Table sites */}
					<div className="flex flex-col border p-2 rounded">
						<div className="flex justify-between items-center mb-2">
							<span className="font-semibold">Ubicaciones</span>
							<OptionDialog
								open={isAddSiteOpen}
								onOpenChange={setIsAddSiteOpen}
								onSave={async (newSite: SiteOption) => {
									const updated = [newSite, ...sites];
									localStorage.setItem('sites', JSON.stringify(updated));
									updateSites(updated);
								}}
								triggerButton={true}
								table="sites"
							/>
						</div>
						<table className="table-auto w-full border-collapse">
							<thead>
								<tr className="border-b">
									<th className="text-left p-1">Ubicación</th>
									<th className="text-left p-1">Eliminar</th>
								</tr>
							</thead>
							<tbody>
								{sites.map((site: SiteOption) => (
									<tr key={`${site.id}-${site.name_site}`} className="border-b">
										<td className="p-1">{site.name_site}</td>
										<td className="p-1">
											<Button
												variant="ghost"
												size="icon"
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
										await handleDeleteOption(deleteDialog.table, deleteDialog.id);
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
