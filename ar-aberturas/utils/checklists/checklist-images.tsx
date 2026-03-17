import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
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
import { Loader2, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { useChecklistImages } from '@/hooks/checklists/use-checklist-images';

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
			<h4 className="font-medium text-sm text-muted-foreground">
				Fotos de la checklist
			</h4>

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

							<div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
								<Button
									size="icon"
									variant="ghost"
									className="h-8 w-8 bg-white/20 hover:bg-white/40"
									onClick={(e) => {
										e.stopPropagation();
										setImageToDelete(image.id);
									}}
								>
									<Trash2 className="h-4 w-4 text-white" />
								</Button>
							</div>
						</div>
					))}
				</div>
			)}

			{selectedIndex !== null && images[selectedIndex] && (
				<Dialog open onOpenChange={() => setSelectedIndex(null)}>
					<DialogContent className="max-w-4xl p-0 bg-black">
						<VisuallyHidden.Root asChild>
							<DialogTitle>Imagen</DialogTitle>
						</VisuallyHidden.Root>

						<Button
							variant="ghost"
							size="icon"
							className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
							onClick={() => setSelectedIndex(null)}
						>
							<X className="h-6 w-6" />
						</Button>

						<div className="relative flex items-center justify-center">
							<img
								src={images[selectedIndex].url}
								className="w-full h-[70vh] object-contain"
							/>

							{images.length > 1 && (
								<>
									<Button
										variant="ghost"
										size="icon"
										className="absolute left-2 bg-white/20"
										onClick={() =>
											setSelectedIndex(
												selectedIndex === 0
													? images.length - 1
													: selectedIndex - 1
											)
										}
									>
										<ChevronLeft />
									</Button>

									<Button
										variant="ghost"
										size="icon"
										className="absolute right-2 bg-white/20"
										onClick={() =>
											setSelectedIndex(
												selectedIndex === images.length - 1
													? 0
													: selectedIndex + 1
											)
										}
									>
										<ChevronRight />
									</Button>
								</>
							)}
						</div>
					</DialogContent>
				</Dialog>
			)}

			<AlertDialog
				open={imageToDelete !== null}
				onOpenChange={() => setImageToDelete(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Eliminar archivo</AlertDialogTitle>
						<AlertDialogDescription>
							Esta acción no se puede deshacer.
						</AlertDialogDescription>
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
