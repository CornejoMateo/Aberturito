import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
} from '@/components/ui/alert-dialog';
import { Loader2, Trash2 } from 'lucide-react';
import { useChecklistImages } from '@/hooks/checklists/use-checklist-images';
import { FileViewerModal } from '@/components/ui/file-viewer-modal';

interface Props {
	checklistId: string;
}

export function ChecklistImages({ checklistId }: Props) {
	const { images, loading, deleteImage } = useChecklistImages(checklistId);

	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
	const [imageToDelete, setImageToDelete] = useState<string | null>(null);

	if (images.length === 0 && !loading) return null;

	return (
		<div className="space-y-3 mt-6 pt-6 border-t">
			<h4 className="font-medium text-sm text-muted-foreground">Fotos de la checklist</h4>

			{loading ? (
				<div className="flex justify-center py-8">
					<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
				</div>
			) : (
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
					{images.map((image, index) => (
						<div
							key={image.id}
							className="relative group cursor-pointer bg-muted rounded-lg overflow-hidden aspect-square"
							onClick={() => setSelectedIndex(index)}
						>
							<img
								src={image.url}
								alt={image.title || 'Imagen'}
								className="w-full h-full object-cover"
							/>

							<div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center">
								<Button
									size="icon"
									variant="ghost"
									className="h-8 w-8"
									onClick={(e) => {
										e.stopPropagation();
										setImageToDelete(image.id);
									}}
								>
									<Trash2 className="h-4 w-4 text-red-400" />
								</Button>
							</div>
						</div>
					))}
				</div>
			)}

			<FileViewerModal
				files={images.map((image) => ({
					id: image.id,
					url: image.url,
					name: image.name,
					displayName: image.title,
					description: image.title,
					mimetype: 'image/jpeg',
					uploadedAt: image.uploaded_at,
				}))}
				selectedIndex={selectedIndex}
				onSelectedIndexChange={setSelectedIndex}
			/>

			<AlertDialog open={imageToDelete !== null} onOpenChange={() => setImageToDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Eliminar archivo</AlertDialogTitle>
						<AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
					</AlertDialogHeader>

					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction asChild>
							<Button
								variant="destructive"
								onClick={async () => {
									if (imageToDelete) {
										await deleteImage(imageToDelete);
										setImageToDelete(null);
									}
								}}
							>
								Eliminar
							</Button>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
