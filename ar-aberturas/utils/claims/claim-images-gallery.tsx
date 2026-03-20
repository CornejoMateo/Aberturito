'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Trash2, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { getSupabaseClient } from '@/lib/supabase-client';
import { translateError } from '@/lib/error-translator';
import { deleteClientFile, getClientFilesByClaim } from '@/lib/clients/files';
import { useFileUpload } from '@/hooks/use-file-upload';
import { UploadFileDialog } from '@/components/ui/upload-file-dialog';
import { FileViewerModal } from '@/components/ui/file-viewer-modal';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CLAIM_FILE_TYPES, MAX_FILE_SIZE_CLAIM, formatFileSize } from '@/utils/file-upload-utils';

interface ClaimImage {
	id: string;
	name: string;
	title: string | null;
	url: string;
	size: number;
	uploaded_at: string;
}

interface ClaimImagesGalleryProps {
	claimId: string;
	clientId?: string | null;
	claimDescription?: string | null;
	workLocality?: string | null;
	workZone?: string | null;
	workAddress?: string | null;
}

export function ClaimImagesGallery({
	claimId,
	clientId,
	claimDescription,
	workLocality,
	workZone,
	workAddress,
}: ClaimImagesGalleryProps) {
	const [images, setImages] = useState<ClaimImage[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [imageToDelete, setImageToDelete] = useState<ClaimImage | null>(null);
	const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

	const locationParts = [workLocality, workZone, workAddress]
		.map((part) => part?.trim())
		.filter((part): part is string => Boolean(part));

	const loadImages = async () => {
		setIsLoading(true);
		try {
			images.forEach((image) => {
				if (image.url) {
					URL.revokeObjectURL(image.url);
				}
			});

			const { data, error } = await getClientFilesByClaim(claimId);

			if (error) {
				console.error('Error loading images:', error);
				setImages([]);
				return;
			}

			if (!data || data.length === 0) {
				setImages([]);
				return;
			}

			const supabase = getSupabaseClient();
			const imagesWithUrls = await Promise.all(
				data.map(async (file) => {
					try {
						if (!file.path) {
							return null;
						}

						const { data: blob, error: downloadError } = await supabase.storage
							.from('clients')
							.download(file.path);

						if (downloadError || !blob) {
							console.error('Error downloading image:', file.path, downloadError);
							return null;
						}

						const name = file.path.split('/').pop() || 'archivo sin nombre';
						const url = URL.createObjectURL(blob);
						return {
							id: file.id,
							name,
							title: file.title,
							url,
							size: blob.size,
							uploaded_at: file.uploaded_at || new Date().toISOString(),
						};
					} catch (err) {
						console.error('Error processing image:', file.path, err);
						return null;
					}
				})
			);

			const validImages = imagesWithUrls.filter((img): img is ClaimImage => img !== null);
			setImages(validImages);
		} catch (error) {
			console.error('Unexpected error loading images:', error);
			setImages([]);
		} finally {
			setIsLoading(false);
		}
	};

	const {
		isUploadDialogOpen,
		selectedFile,
		displayName,
		description,
		isUploading,
		fileInputRef,
		setDisplayName,
		setDescription,
		handleFileSelect,
		handleUploadSubmit,
		handleCloseUploadDialog,
		triggerFileUpload,
		acceptedFileTypes,
	} = useFileUpload({
		clientId: clientId || '',
		claimId,
		allowedFileTypes: CLAIM_FILE_TYPES,
		maxFileSize: MAX_FILE_SIZE_CLAIM,
		getDefaultDisplayName: (file) =>
			locationParts.join(' - ') || file.name.replace(/\.[^/.]+$/, ''),
		getDefaultDescription: () => claimDescription?.trim() || '',
		beforeUpload: () => {
			if (!clientId) {
				return 'Este reclamo no tiene cliente asociado para guardar el archivo.';
			}

			return null;
		},
		onUploadSuccess: loadImages,
	});

	useEffect(() => {
		loadImages();

		return () => {
			images.forEach((image) => {
				if (image.url) {
					URL.revokeObjectURL(image.url);
				}
			});
		};
	}, [claimId]);

	const handleDeleteImage = async () => {
		if (!imageToDelete) return;

		try {
			const { error } = await deleteClientFile(imageToDelete.id);

			if (error) {
				const errorMessage = translateError(error.message);
				toast({
					variant: 'destructive',
					title: 'Error al eliminar imagen',
					description: errorMessage,
				});
			} else {
				toast({
					title: 'Imagen eliminada',
					description: 'La imagen se eliminó exitosamente.',
				});
				await loadImages();
			}
		} catch (error) {
			console.error('Error deleting image:', error);
			const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
			toast({
				variant: 'destructive',
				title: 'Error',
				description: translateError(errorMessage),
			});
		} finally {
			setImageToDelete(null);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-32">
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h4 className="text-sm font-medium">Imágenes ({images.length})</h4>
				<div>
					<input
						ref={fileInputRef}
						type="file"
						accept={acceptedFileTypes.join(',')}
						className="hidden"
						onChange={handleFileSelect}
						disabled={isUploading}
					/>
					<Button size="sm" onClick={triggerFileUpload} disabled={isUploading}>
						{isUploading ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Subiendo...
							</>
						) : (
							<>
								<Upload className="h-4 w-4 mr-2" />
								Subir imagen
							</>
						)}
					</Button>
				</div>
			</div>

			{images.length === 0 ? (
				<div className="flex items-center justify-center h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg">
					<p className="text-sm text-muted-foreground">No hay imágenes</p>
				</div>
			) : (
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
					{images.map((image, index) => (
						<div
							key={image.id}
							className="group relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
							onClick={() => setSelectedImageIndex(index)}
						>
							<img src={image.url} alt={image.name} className="w-full h-full object-cover" />

							<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
								<Button
									size="icon"
									variant="destructive"
									className="h-7 w-7"
									onClick={(e) => {
										e.stopPropagation();
										setImageToDelete(image);
									}}
								>
									<Trash2 className="h-3 w-3" />
								</Button>
							</div>

							<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
								{image.title && <p className="text-white text-xs truncate">{image.title}</p>}
								<p className="text-white text-xs truncate">{formatFileSize(image.size)}</p>
							</div>
						</div>
					))}
				</div>
			)}

			<AlertDialog open={!!imageToDelete} onOpenChange={() => setImageToDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Eliminar imagen?</AlertDialogTitle>
						<AlertDialogDescription>
							Esta acción no se puede deshacer. La imagen será eliminada permanentemente.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteImage}
							className="bg-destructive hover:bg-destructive/90"
						>
							Eliminar
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<FileViewerModal
				files={images.map((image) => ({
					id: image.id,
					url: image.url,
					name: image.name,
					displayName: image.title,
					description: image.title,
					mimetype: 'image/jpeg',
					size: image.size,
					uploadedAt: image.uploaded_at,
				}))}
				selectedIndex={selectedImageIndex}
				onSelectedIndexChange={setSelectedImageIndex}
			/>

			<UploadFileDialog
				open={isUploadDialogOpen}
				onOpenChange={(open) => !open && handleCloseUploadDialog()}
				displayName={displayName}
				description={description}
				selectedFile={selectedFile}
				isUploading={isUploading}
				onDisplayNameChange={setDisplayName}
				onDescriptionChange={setDescription}
				onSubmit={handleUploadSubmit}
				title="Subir imagen"
				descriptionText="Completa la información de la imagen que deseas subir."
				submitText="Subir imagen"
			/>
		</div>
	);
}
