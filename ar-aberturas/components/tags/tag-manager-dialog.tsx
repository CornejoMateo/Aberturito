'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from '@/components/ui/use-toast';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { SurveyTag, getAllTags, createTag, updateTag, deleteTag } from '@/lib/tags/tags';
import { TAG_COLORS } from '@/constants/tags';
import { translateError } from '@/lib/error-translator';

interface TagManagerDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

type EditTagState = {
	open: boolean;
	tag: SurveyTag | null;
};

type DeleteTagState = {
	open: boolean;
	tagId: string | null;
};

export function TagManagerDialog({ open, onOpenChange }: TagManagerDialogProps) {
	const [tags, setTags] = useState<SurveyTag[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [newTagName, setNewTagName] = useState('');
	const [newTagColor, setNewTagColor] = useState<string>(TAG_COLORS[0].value);
	const [editTag, setEditTag] = useState<EditTagState>({ open: false, tag: null });
	const [deleteTagConfirm, setDeleteTagConfirm] = useState<DeleteTagState>({ open: false, tagId: null });

	const loadTags = async () => {
		setIsLoading(true);
		try {
			const { data, error } = await getAllTags();
			if (error) throw error;
			setTags(data ?? []);
		} catch (err) {
			console.error('Error loading tags:', err);
			toast({
				variant: 'destructive',
				title: 'Error',
				description: translateError(err) || 'No se pudieron cargar las etiquetas.',
			});
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (open) {
			loadTags();
		}
	}, [open]);

	const handleCreateTag = async () => {
		if (!newTagName.trim()) return;

		setIsLoading(true);
		try {
			const { data, error } = await createTag({ name: newTagName.trim(), color: newTagColor });
			if (error) throw error;
			
			toast({ title: 'Etiqueta creada' });
			setNewTagName('');
			setNewTagColor(TAG_COLORS[0].value);
			loadTags();
		} catch (err) {
			toast({
				variant: 'destructive',
				title: 'Error',
				description: translateError(err) || 'No se pudo crear la etiqueta.',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleEditTag = async (name: string, color: string) => {
		if (!editTag.tag) return;

		setIsLoading(true);
		try {
			const { error } = await updateTag(editTag.tag.id, { name: name.trim(), color });
			if (error) throw error;
			
			toast({ title: 'Etiqueta actualizada' });
			setEditTag({ open: false, tag: null });
			loadTags();
		} catch (err) {
			toast({
				variant: 'destructive',
				title: 'Error',
				description: translateError(err) || 'No se pudo actualizar la etiqueta.',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteTag = async () => {
		if (!deleteTagConfirm.tagId) return;

		setIsLoading(true);
		try {
			const { error } = await deleteTag(deleteTagConfirm.tagId);
			if (error) throw error;
			
			toast({ title: 'Etiqueta eliminada' });
			setDeleteTagConfirm({ open: false, tagId: null });
			loadTags();
		} catch (err) {
			toast({
				variant: 'destructive',
				title: 'Error',
				description: translateError(err) || 'No se pudo eliminar la etiqueta.',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const getColorClass = (colorValue: string) => {
		const color = TAG_COLORS.find((c) => c.value === colorValue);
		return color?.bg ?? 'bg-gray-500';
	};

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Gestionar etiquetas</DialogTitle>
						<DialogDescription>
							Crea, edita o elimina etiquetas para usarlas en los relevamientos.
						</DialogDescription>
					</DialogHeader>
					
					<div className="space-y-4">
						{/* Create new tag */}
						<div className="flex gap-2">
							<Input
								placeholder="Nombre de la etiqueta"
								value={newTagName}
								onChange={(e) => setNewTagName(e.target.value)}
								onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
								disabled={isLoading}
							/>
							<div className="flex gap-1">
								{TAG_COLORS.map((color) => (
									<button
										key={color.value}
										type="button"
										className={`w-6 h-6 rounded ${color.bg} ${newTagColor === color.value ? 'ring-2 ring-offset-2 ring-foreground' : ''}`}
										onClick={() => setNewTagColor(color.value)}
										title={color.name}
									/>
								))}
							</div>
							<Button onClick={handleCreateTag} disabled={isLoading || !newTagName.trim()}>
								<Plus className="h-4 w-4" />
							</Button>
						</div>

						{/* Tags list */}
						<div className="space-y-2 max-h-[300px] overflow-y-auto">
							{tags.length === 0 ? (
								<p className="text-sm text-muted-foreground text-center py-4">
									No hay etiquetas. Crea la primera arriba.
								</p>
							) : (
								tags.map((tag) => (
									<div
										key={tag.id}
										className="flex items-center justify-between p-2 rounded border bg-card"
									>
										<div className="flex items-center gap-2">
											<div className={`w-4 h-4 rounded ${getColorClass(tag.color)}`} />
											<span className="text-sm">{tag.name}</span>
										</div>
										<div className="flex items-center gap-1">
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7"
												onClick={() => setEditTag({ open: true, tag })}
												disabled={isLoading}
											>
												<Pencil className="h-3 w-3" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7 text-destructive hover:text-destructive"
												onClick={() => setDeleteTagConfirm({ open: true, tagId: tag.id })}
												disabled={isLoading}
											>
												<Trash2 className="h-3 w-3" />
											</Button>
										</div>
									</div>
								))
							)}
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Edit tag dialog */}
			<Dialog open={editTag.open} onOpenChange={(open) => !open && setEditTag({ open: false, tag: null })}>
				<DialogContent className="sm:max-w-[400px]">
					<DialogHeader>
						<DialogTitle>Editar etiqueta</DialogTitle>
					</DialogHeader>
					{editTag.tag && (
						<div className="space-y-4">
							<Input
								defaultValue={editTag.tag.name}
								id="edit-tag-name"
								placeholder="Nombre de la etiqueta"
							/>
							<div>
								<label className="text-sm font-medium mb-2 block">Color</label>
								<div className="flex gap-2 flex-wrap">
									{TAG_COLORS.map((color) => (
										<button
											key={color.value}
											type="button"
											className={`w-8 h-8 rounded ${color.bg} ${editTag.tag?.color === color.value ? 'ring-2 ring-offset-2 ring-foreground' : ''}`}
											onClick={() => setEditTag({ ...editTag, tag: { ...editTag.tag!, color: color.value } })}
											title={color.name}
										/>
									))}
								</div>
							</div>
							<div className="flex justify-end gap-2">
								<Button
									variant="outline"
									onClick={() => setEditTag({ open: false, tag: null })}
								>
									Cancelar
								</Button>
								<Button
									onClick={() => {
										const nameInput = document.getElementById('edit-tag-name') as HTMLInputElement;
										handleEditTag(nameInput.value, editTag.tag!.color);
									}}
									disabled={isLoading}
								>
									Guardar
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Delete tag confirmation */}
			<ConfirmDialog
				open={deleteTagConfirm.open}
				onOpenChange={(open) => setDeleteTagConfirm({ ...deleteTagConfirm, open })}
				title="Eliminar etiqueta"
				description="¿Estás seguro de que querés eliminar esta etiqueta? Esta acción no se puede deshacer y la etiqueta se eliminará de todos los relevamientos."
				onConfirm={handleDeleteTag}
				isLoading={isLoading}
			/>
		</>
	);
}
