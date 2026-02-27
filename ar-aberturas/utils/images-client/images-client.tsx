'use client';

import { useState, useEffect, useRef } from 'react';
import { Client } from '@/lib/clients/clients';
import {
	listClientFiles,
	uploadClientFile,
	deleteClientFile,
	ClientFile,
} from '@/lib/clients/clients';
import { Button } from '@/components/ui/button';
import { Upload, Trash2, X, ChevronLeft, ChevronRight, Download, Loader2 } from 'lucide-react';
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ClientImagesGalleryProps {
	client: Client;
}

type FileWithUrl = ClientFile & {
	url: string;
};

export function ClientImagesGallery({ client }: ClientImagesGalleryProps) {
	const [files, setFiles] = useState<FileWithUrl[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null);
	const [fileToDelete, setFileToDelete] = useState<FileWithUrl | null>(null);
	const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [displayName, setDisplayName] = useState('');
	const [description, setDescription] = useState('');
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		loadFiles();

		// Cleanup object URLs on unmount
		return () => {
			files.forEach((file) => {
				if (file.url) {
					URL.revokeObjectURL(file.url);
				}
			});
		};
	}, [client.id]);

	const loadFiles = async () => {
		setIsLoading(true);
		try {
			// Cleanup old URLs
			files.forEach((file) => {
				if (file.url) {
					URL.revokeObjectURL(file.url);
				}
			});

			const { data, error } = await listClientFiles(client.id);

			if (error) {
				console.error('Error loading files:', error);
				toast({
					variant: 'destructive',
					title: 'Error al cargar archivos',
					description: 'No se pudieron cargar los archivos del cliente.',
				});
				setFiles([]);
				return;
			}

			if (!data || data.length === 0) {
				setFiles([]);
				return;
			}

			// Download files from storage and create object URLs
			const supabase = getSupabaseClient();
			const filesWithUrls = await Promise.all(
				data.map(async (file) => {
					try {
						const { data: blob, error: downloadError } = await supabase.storage
							.from('clients')
							.download(file.path);

						if (downloadError || !blob) {
							console.error('Error downloading file:', file.path, downloadError);
							return null;
						}

						const url = URL.createObjectURL(blob);
						return { ...file, url };
					} catch (err) {
						console.error('Error processing file:', file.path, err);
						return null;
					}
				})
			);

			const validFiles = filesWithUrls.filter((f): f is FileWithUrl => f !== null);
			setFiles(validFiles);
		} catch (error) {
			console.error('Unexpected error loading files:', error);
			setFiles([]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = e.target.files;
		if (!selectedFiles || selectedFiles.length === 0) return;

		const file = selectedFiles[0]; // only handle single file upload

		// Validate file type (images and videos)
		const validTypes = [
			'image/jpeg',
			'image/jpg',
			'image/png',
			'image/gif',
			'image/webp',
			'video/mp4',
			'video/webm',
			'video/ogg',
			'video/quicktime',
		];

		if (!validTypes.includes(file.type)) {
			toast({
				variant: 'destructive',
				title: 'Tipo de archivo no válido',
				description: `El archivo ${file.name} no es una imagen o video válido.`,
			});
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
			return;
		}

		// Validate file size (max 50MB)
		const maxSize = 50 * 1024 * 1024;
		if (file.size > maxSize) {
			toast({
				variant: 'destructive',
				title: 'Archivo muy grande',
				description: `El archivo ${file.name} excede el tamaño máximo de 50MB.`,
			});
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
			return;
		}

		// Open dialog with file info
		setSelectedFile(file);
		setDisplayName(file.name.replace(/\.[^/.]+$/, '')); // Remove extension
		setDescription('');
		setIsUploadDialogOpen(true);
	};

	const handleUploadSubmit = async () => {
		if (!selectedFile) return;

		setIsUploading(true);

		try {
			const { error } = await uploadClientFile(
				client.id,
				selectedFile,
				displayName.trim() || undefined,
				description.trim() || undefined
			);

			if (error) {
				toast({
					variant: 'destructive',
					title: 'Error al subir archivo',
					description: 'Ocurrió un error al subir el archivo.',
				});
			} else {
				toast({
					title: 'Archivo subido',
					description: 'El archivo se subió exitosamente.',
				});
				await loadFiles();
				handleCloseUploadDialog();
			}
		} catch (error) {
			console.error('Error uploading file:', error);
			toast({
				variant: 'destructive',
				title: 'Error al subir archivo',
				description: 'Ocurrió un error inesperado.',
			});
		} finally {
			setIsUploading(false);
		}
	};

    // when closing the upload dialog, reset all related states and clear file input
	const handleCloseUploadDialog = () => {
		setIsUploadDialogOpen(false);
		setSelectedFile(null);
		setDisplayName('');
		setDescription('');
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const handleDeleteFile = async () => {
		if (!fileToDelete) return;

		try {
			const { error } = await deleteClientFile(client.id, fileToDelete.name);

			if (error) {
				toast({
					variant: 'destructive',
					title: 'Error al eliminar archivo',
					description: 'No se pudo eliminar el archivo.',
				});
			} else {
				toast({
					title: 'Archivo eliminado',
					description: 'El archivo se eliminó exitosamente.',
				});

				// Close viewer if the deleted file was being viewed
				if (selectedFileIndex !== null && files[selectedFileIndex]?.name === fileToDelete.name) {
					setSelectedFileIndex(null);
				}

				await loadFiles();
			}
		} catch (error) {
			console.error('Error deleting file:', error);
			toast({
				variant: 'destructive',
				title: 'Error',
				description: 'Ocurrió un error inesperado.',
			});
		} finally {
			setFileToDelete(null);
		}
	};

	const isVideo = (mimetype: string) => {
		return mimetype.startsWith('video/');
	};

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
	};

	const formatDate = (dateString: string) => {
		if (!dateString) return '';
		const date = new Date(dateString);
		return date.toLocaleDateString('es-AR', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const handlePrevious = () => {
		if (selectedFileIndex !== null && selectedFileIndex > 0) {
			setSelectedFileIndex(selectedFileIndex - 1);
		}
	};

	const handleNext = () => {
		if (selectedFileIndex !== null && selectedFileIndex < files.length - 1) {
			setSelectedFileIndex(selectedFileIndex + 1);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-full">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col">
			<div className="flex items-center justify-between mb-4">
				<h4 className="text-sm font-medium">Archivos ({files.length})</h4>
				<div>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*,video/*"
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
								Subir archivo
							</>
						)}
					</Button>
				</div>
			</div>

			{files.length === 0 ? (
				<div className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<p className="text-sm text-muted-foreground mb-4">No hay archivos para este cliente</p>
						<Button
							size="sm"
							variant="outline"
							onClick={() => fileInputRef.current?.click()}
							disabled={isUploading}
						>
							<Upload className="h-4 w-4 mr-2" />
							Subir primer archivo
						</Button>
					</div>
				</div>
			) : (
				<div className="flex-1 overflow-y-auto">
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
						{files.map((file, index) => (
							<div
								key={file.id}
								className="group relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover:ring-2 ring-primary transition-all"
								onClick={() => setSelectedFileIndex(index)}
							>
								{isVideo(file.mimetype) ? (
									<div className="w-full h-full flex items-center justify-center bg-black">
										<video
											src={file.url}
											className="w-full h-full object-cover"
											muted
											playsInline
										/>
										<div className="absolute inset-0 bg-black/20 flex items-center justify-center">
											<div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
												<div className="w-0 h-0 border-l-[12px] border-l-black border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1" />
											</div>
										</div>
									</div>
								) : (
									<img src={file.url} alt={file.name} className="w-full h-full object-cover" />
								)}

								<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
									<Button
										size="icon"
										variant="destructive"
										className="h-7 w-7"
										onClick={(e) => {
											e.stopPropagation();
											setFileToDelete(file);
										}}
									>
										<Trash2 className="h-3 w-3" />
									</Button>
								</div>

								<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
									<p className="text-white text-xs truncate font-medium">
										{file.display_name || file.name}
									</p>
									{file.description && (
										<p className="text-white/80 text-xs truncate">{file.description}</p>
									)}
									<p className="text-white/70 text-xs">{formatFileSize(file.size)}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* File Viewer Modal */}
			{selectedFileIndex !== null && files[selectedFileIndex] && (
				<div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
					<Button
						size="icon"
						variant="ghost"
						className="absolute top-4 right-4 text-white hover:bg-white/20"
						onClick={() => setSelectedFileIndex(null)}
					>
						<X className="h-6 w-6" />
					</Button>

					{selectedFileIndex > 0 && (
						<Button
							size="icon"
							variant="ghost"
							className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
							onClick={handlePrevious}
						>
							<ChevronLeft className="h-8 w-8" />
						</Button>
					)}

					{selectedFileIndex < files.length - 1 && (
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
						{isVideo(files[selectedFileIndex].mimetype) ? (
							<video
								src={files[selectedFileIndex].url}
								controls
								className="max-w-full max-h-full object-contain"
								autoPlay
							/>
						) : (
							<img
								src={files[selectedFileIndex].url}
								alt={files[selectedFileIndex].display_name || files[selectedFileIndex].name}
								className="max-w-full max-h-full object-contain"
							/>
						)}

						<div className="mt-4 text-white text-center px-4 max-w-xl">
							<p className="font-medium text-lg">
								{files[selectedFileIndex].display_name || files[selectedFileIndex].name}
							</p>
							{files[selectedFileIndex].description && (
								<p className="text-sm text-white/80 mt-2">{files[selectedFileIndex].description}</p>
							)}
							<p className="text-sm text-white/70 mt-2">
								{formatFileSize(files[selectedFileIndex].size)} •{' '}
								{formatDate(files[selectedFileIndex].uploaded_at)}
							</p>
							<p className="text-xs text-white/50 mt-1">
								{selectedFileIndex + 1} de {files.length}
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={!!fileToDelete} onOpenChange={() => setFileToDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Eliminar archivo?</AlertDialogTitle>
						<AlertDialogDescription>
							Esta acción no se puede deshacer. El archivo "
							{fileToDelete?.display_name || fileToDelete?.name}" será eliminado permanentemente.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteFile}
							className="bg-destructive hover:bg-destructive/90"
						>
							Eliminar
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Upload Dialog */}
			<Dialog open={isUploadDialogOpen} onOpenChange={(open) => !open && handleCloseUploadDialog()}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Subir archivo</DialogTitle>
						<DialogDescription>
							Completa la información del archivo que deseas subir.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="file-name">Nombre del archivo *</Label>
							<Input
								id="file-name"
								value={displayName}
								onChange={(e) => setDisplayName(e.target.value)}
								disabled={isUploading}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="file-description">Descripción (opcional)</Label>
							<Textarea
								id="file-description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Ej: Vista frontal de la obra terminada"
								rows={3}
								disabled={isUploading}
							/>
						</div>
						{selectedFile && (
							<div className="rounded-lg border p-3 bg-muted/50">
								<p className="text-sm font-medium mb-1">Archivo seleccionado:</p>
								<p className="text-sm text-muted-foreground truncate">{selectedFile.name}</p>
								<p className="text-xs text-muted-foreground mt-1">
									{formatFileSize(selectedFile.size)}
								</p>
							</div>
						)}
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={handleCloseUploadDialog} disabled={isUploading}>
							Cancelar
						</Button>
						<Button onClick={handleUploadSubmit} disabled={isUploading || !displayName.trim()}>
							{isUploading ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Subiendo...
								</>
							) : (
								'Subir archivo'
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
