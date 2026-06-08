'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Trash2, Loader2, FileText, Video } from 'lucide-react';
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
import {
	CLAIM_FILE_TYPES,
	MAX_FILE_SIZE_CLAIM,
	formatFileSize,
	getFileExtension,
} from '@/utils/file-upload-utils';

interface ClaimFile {
	id: string;
	name: string;
	title: string | null;
	url: string;
	size: number;
	uploaded_at: string;
}

interface ClaimImagesGalleryProps {
	claimId: number;
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
	const [files, setFiles] = useState<ClaimFile[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [fileToDelete, setFileToDelete] = useState<ClaimFile | null>(null);
	const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null);

	const locationParts = [workLocality, workZone, workAddress]
		.map((part) => part?.trim())
		.filter((part): part is string => Boolean(part));

	const getFileKind = (fileName: string) => {
		const extension = getFileExtension(fileName).toLowerCase();

		if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(extension)) {
			return 'image';
		}

		if (['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(extension)) {
			return 'video';
		}

		return 'file';
	};

	const loadImages = async () => {
		setIsLoading(true);
		try {
			files.forEach((file) => {
				if (file.url) {
					URL.revokeObjectURL(file.url);
				}
			});

			const { data, error } = await getClientFilesByClaim(claimId);

			if (error) {
				console.error('Error loading images:', error);
				setFiles([]);
				return;
			}

			if (!data || data.length === 0) {
				setFiles([]);
				return;
			}

			const supabase = getSupabaseClient();
			const filesWithUrls = await Promise.all(
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

			const validFiles = filesWithUrls.filter((file): file is ClaimFile => file !== null);
			setFiles(validFiles);
		} catch (error) {
			console.error('Unexpected error loading files:', error);
			setFiles([]);
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
			files.forEach((file) => {
				if (file.url) {
					URL.revokeObjectURL(file.url);
				}
			});
		};
	}, [claimId]);

	const handleDeleteFile = async () => {
		if (!fileToDelete) return;

		try {
			const { error } = await deleteClientFile(fileToDelete.id);

			if (error) {
				const errorMessage = translateError(error.message);
				toast({
					variant: 'destructive',
					title: 'Error al eliminar archivo',
					description: errorMessage,
				});
			} else {
				toast({
					title: 'Archivo eliminado',
					description: 'El archivo se eliminó exitosamente.',
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
			setFileToDelete(null);
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
				<h4 className="text-sm font-medium">Archivos ({files.length})</h4>
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
								Subir archivo
							</>
						)}
					</Button>
				</div>
			</div>

			{files.length === 0 ? (
				<div className="flex items-center justify-center h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg">
					<p className="text-sm text-muted-foreground">No hay archivos</p>
				</div>
			) : (
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
					{files.map((file, index) => {
						const fileKind = getFileKind(file.name);

						return (
							<div
								key={file.id}
								className="group relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
								onClick={() => setSelectedFileIndex(index)}
							>
								{fileKind === 'image' ? (
									<img src={file.url} alt={file.name} className="w-full h-full object-cover" />
								) : fileKind === 'video' ? (
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
									<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/60">
										<FileText className="h-12 w-12 text-muted-foreground" />
									</div>
								)}

								<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
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
									{file.title && <p className="text-white text-xs truncate">{file.title}</p>}
									<p className="text-white text-xs truncate">{formatFileSize(file.size)}</p>
								</div>
							</div>
						);
					})}
				</div>
			)}

			<AlertDialog open={!!fileToDelete} onOpenChange={() => setFileToDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Eliminar archivo?</AlertDialogTitle>
						<AlertDialogDescription>
							Esta acción no se puede deshacer. El archivo será eliminado permanentemente.
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

			<FileViewerModal
				files={files.map((file) => {
					const fileKind = getFileKind(file.name);

					return {
						id: file.id,
						url: file.url,
						name: file.name,
						displayName: file.title,
						description: file.title,
						mimetype:
							fileKind === 'image'
								? 'image/jpeg'
								: fileKind === 'video'
									? 'video/mp4'
									: 'application/octet-stream',
						size: file.size,
						uploadedAt: file.uploaded_at,
					};
				})}
				selectedIndex={selectedFileIndex}
				onSelectedIndexChange={setSelectedFileIndex}
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
				title="Subir archivo"
				descriptionText="Completa la información del archivo que deseas subir."
				submitText="Subir archivo"
			/>
		</div>
	);
}
