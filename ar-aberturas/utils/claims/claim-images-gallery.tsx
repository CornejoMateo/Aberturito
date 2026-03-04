'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Trash2, X, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { getSupabaseClient } from '@/lib/supabase-client';
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

interface ClaimImage {
	id: string;
	name: string;
	url: string;
	size: number;
	uploaded_at: string;
}

interface ClaimImagesGalleryProps {
	claimId: string;
}

export function ClaimImagesGallery({ claimId }: ClaimImagesGalleryProps) {
	const [images, setImages] = useState<ClaimImage[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [imageToDelete, setImageToDelete] = useState<ClaimImage | null>(null);
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

			const supabase = getSupabaseClient();
			const { data, error } = await supabase.storage
				.from('claims')
				.list(`${claimId}/images`);

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
			const imagesWithUrls = await Promise.all(
				data.map(async (file) => {
					try {
						const { data: blob, error: downloadError } = await supabase.storage
							.from('claims')
							.download(`${claimId}/images/${file.name}`);

						if (downloadError || !blob) {
							console.error('Error downloading image:', file.name, downloadError);
							return null;
						}

						const url = URL.createObjectURL(blob);
						return {
							id: file.id,
							name: file.name,
							url,
							size: file.metadata?.size || 0,
							uploaded_at: file.created_at || new Date().toISOString(),
						};
					} catch (err) {
						console.error('Error processing image:', file.name, err);
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

		// Validate file type (images only)
		const validTypes = [
			'image/jpeg',
			'image/jpg',
			'image/png',
			'image/gif',
			'image/webp',
		];

		if (!validTypes.includes(file.type)) {
			toast({
				variant: 'destructive',
				title: 'Tipo de archivo no válido',
				description: 'Solo se permiten archivos de imagen (JPG, PNG, GIF, WebP).',
			});
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
			return;
		}

		// Validate file size (max 10MB)
		const maxSize = 10 * 1024 * 1024;
		if (file.size > maxSize) {
			toast({
				variant: 'destructive',
				title: 'Archivo muy grande',
				description: 'El archivo excede el tamaño máximo de 10MB.',
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
			const supabase = getSupabaseClient();
			const fileName = `${Date.now()}-${file.name}`;
			const filePath = `${claimId}/images/${fileName}`;

			const { error } = await supabase.storage
				.from('claims')
				.upload(filePath, file, {
					contentType: file.type,
					upsert: true,
				});

			if (error) {
				toast({
					variant: 'destructive',
					title: 'Error al subir imagen',
					description: 'Ocurrió un error al subir la imagen.',
				});
			} else {
				toast({
					title: 'Imagen subida',
					description: 'La imagen se subió exitosamente.',
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
				description: 'Ocurrió un error inesperado.',
			});
		} finally {
			setIsUploading(false);
		}
	};

	const handleDeleteImage = async () => {
		if (!imageToDelete) return;

		try {
			const supabase = getSupabaseClient();
			const filePath = `${claimId}/images/${imageToDelete.name}`;

			const { error } = await supabase.storage
				.from('claims')
				.remove([filePath]);

			if (error) {
				toast({
					variant: 'destructive',
					title: 'Error al eliminar imagen',
					description: 'No se pudo eliminar la imagen.',
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
			toast({
				variant: 'destructive',
				title: 'Error',
				description: 'Ocurrió un error inesperado.',
			});
		} finally {
			setImageToDelete(null);
		}
	};

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
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
							className="group relative aspect-square rounded-lg overflow-hidden bg-muted"
						>
							<img src={image.url} alt={image.name} className="w-full h-full object-cover" />

							<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
								<Button
									size="icon"
									variant="destructive"
									className="h-7 w-7"
									onClick={() => setImageToDelete(image)}
								>
									<Trash2 className="h-3 w-3" />
								</Button>
							</div>

							<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
		</div>
	);
}
