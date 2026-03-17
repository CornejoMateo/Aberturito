'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Trash2, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { getSupabaseClient } from '@/lib/supabase-client';
import { translateError } from '@/lib/error-translator';
import {
	deleteClientFile,
	getClientFilesByClaim,
	uploadClientFile,
} from '@/lib/clients/files';
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
import {
	CLAIM_FILE_TYPES,
	MAX_FILE_SIZE_CLAIM,
	validateFileForUpload,
	formatFileSize,
} from '@/utils/file-upload-utils';

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
	const [isUploading, setIsUploading] = useState(false);
	const [imageToDelete, setImageToDelete] = useState<ClaimImage | null>(null);
	const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		loadImages();

		// Cleanup object URLs on unmount
		return () => {
			images.forEach((image) => {
				if (image.url) {
					URL.revokeObjectURL(image.url);
				}
			});
		};
	}, [claimId]);

	const loadImages = async () => {
		setIsLoading(true);
		try {
			// Cleanup old URLs
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

			// Download images from storage and create object URLs
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

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = e.target.files;
		if (!selectedFiles || selectedFiles.length === 0) return;

		const file = selectedFiles[0]; // only handle single file upload

		// Validate file type and size
		const validation = validateFileForUpload(file, CLAIM_FILE_TYPES, MAX_FILE_SIZE_CLAIM);
		if (!validation.isValid) {
			toast({
				variant: 'destructive',
				title: 'Archivo no válido',
				description: validation.error,
			});
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
			return;
		}

		// Upload file directly
		await handleUpload(file);
	};

	const handleUpload = async (file: File) => {
		setIsUploading(true);

		try {
			if (!clientId) {
				toast({
					variant: 'destructive',
					title: 'No se puede subir imagen',
					description: 'Este reclamo no tiene cliente asociado para guardar el archivo.',
				});
				return;
			}

			const locationParts = [workLocality, workZone, workAddress]
				.map((part) => part?.trim())
				.filter((part): part is string => Boolean(part));
			const uploadTitle = locationParts.join(' - ') || file.name;

			const { error } = await uploadClientFile(
				clientId,
				file,
				uploadTitle,
				claimDescription || null,
				null,
				claimId
			);

			if (error) {
				toast({
					variant: 'destructive',
					title: 'Error al subir imagen',
					description: translateError(error.message),
				});
			} else {
				toast({
					title: 'Imagen subida',
					description: translateError('La imagen se subió exitosamente.'),
				});
				await loadImages();
				if (fileInputRef.current) {
					fileInputRef.current.value = '';
				}
			}
		} catch (error) {
			console.error('Error uploading image:', error);
			toast({
				variant: 'destructive',
				title: 'Error al subir imagen',
				description: translateError(error instanceof Error ? error.message : 'Ocurrió un error inesperado.'),
			});
		} finally {
			setIsUploading(false);
		}
	};

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
					description: translateError('La imagen se eliminó exitosamente.'),
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

	const handlePrevious = () => {
		if (selectedImageIndex !== null && selectedImageIndex > 0) {
			setSelectedImageIndex(selectedImageIndex - 1);
		}
	};

	const handleNext = () => {
		if (selectedImageIndex !== null && selectedImageIndex < images.length - 1) {
			setSelectedImageIndex(selectedImageIndex + 1);
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
						accept="image/*"
						className="hidden"
						onChange={handleFileSelect}
						disabled={isUploading}
					/>
					<Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
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
					{images.map((image) => (
						<div
							key={image.id}
							className="group relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
							onClick={() => setSelectedImageIndex(images.indexOf(image))}
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
								{image.title && (
									<p className="text-white text-xs truncate">{image.title}</p>
								)}
								<p className="text-white text-xs truncate">{formatFileSize(image.size)}</p>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Delete Confirmation Dialog */}
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

			{/* Image Viewer Modal */}
			{selectedImageIndex !== null && images[selectedImageIndex] && (
				<div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
					<Button
						size="icon"
						variant="ghost"
						className="absolute top-4 right-4 text-white hover:bg-white/20"
						onClick={() => setSelectedImageIndex(null)}
					>
						<X className="h-6 w-6" />
					</Button>

					{selectedImageIndex > 0 && (
						<Button
							size="icon"
							variant="ghost"
							className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
							onClick={handlePrevious}
						>
							<ChevronLeft className="h-8 w-8" />
						</Button>
					)}

					{selectedImageIndex < images.length - 1 && (
						<Button
							size="icon"
							variant="ghost"
							className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
							onClick={handleNext}
						>
							<ChevronRight className="h-8 w-8" />
						</Button>
					)}

					<div className="max-w-[80vw] max-h-[80vh] flex flex-col items-center overflow-auto">
						<img
							src={images[selectedImageIndex].url}
							alt={images[selectedImageIndex].name}
							className="max-w-full max-h-full object-contain"
						/>

						<div className="mt-4 text-white text-center px-4 max-w-xl">
							<p className="text-sm text-white/70 mt-2">
								{selectedImageIndex + 1} de {images.length}
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
