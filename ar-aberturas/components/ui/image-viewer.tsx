'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import React from 'react';
import { set } from 'date-fns';

interface ImageViewerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	src?: string | null;
	alt?: string;
	trash?: boolean;
	onDelete?: () => void;
}

export function ImageViewer({
	open,
	onOpenChange,
	src,
	alt = 'Imagen',
	trash = false,
	onDelete,
}: ImageViewerProps) {
	const [confirmOpen, setConfirmOpen] = React.useState(false);
	const [remove, setRemove] = React.useState(false);
	if (!src) return null;

	// Try to request a larger version if URL pattern contains '/upload/' (cloudinary style)
	const largeSrc = src.includes('/upload/')
		? src.replace('/upload/', '/upload/f_auto,q_auto,w_1200/')
		: src;

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent
					className="max-w-[95vw] w-full max-h-[95vh] p-0 overflow-hidden"
					showCloseButton={false}
				>
					<DialogHeader className="p-6 pb-0">
						<DialogTitle>Imagen</DialogTitle>
					</DialogHeader>

					<div className="flex-1 p-6 pt-4 overflow-auto">
						<div className="flex justify-center items-center w-full h-full min-h-[50vh]">
							<img
								src={largeSrc}
								alt={alt}
								className="max-w-full max-h-[70vh] w-auto h-auto object-contain rounded-md shadow-md"
								style={{
									maxWidth: '100%',
									maxHeight: 'calc(100vh - 200px)',
									width: 'auto',
									height: 'auto',
								}}
							/>
						</div>
					</div>

					<div className="flex justify-between p-6 pt-0">
						{trash && onDelete && (
							<Button
								onClick={() => {
									setConfirmOpen(true);
								}}
								variant="destructive"
								className="gap-2"
							>
								<Trash2 className="h-4 w-4" />
								Eliminar
							</Button>
						)}
						<Button
							onClick={() => {
								onOpenChange(false);
							}}
							className="px-6 ml-auto"
						>
							Cerrar
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Modal de confirmación de eliminación */}
			<Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>¿Eliminar imagen?</DialogTitle>
					</DialogHeader>
					<p className="mb-4">
						¿Estás seguro que deseas eliminar esta foto? Esta acción no se puede deshacer.
					</p>
					<div className="flex justify-end gap-2">
						<Button
							variant="outline"
							onClick={() => {
								setConfirmOpen(false);
							}}
						>
							Cancelar
						</Button>
						<Button
							variant="destructive"
							onClick={() => {
								setConfirmOpen(false);
								onDelete && onDelete();
							}}
						>
							Eliminar
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}

export default ImageViewer;
