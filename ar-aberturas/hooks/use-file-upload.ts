import { useState, useRef } from 'react';
import { uploadClientFile } from '@/lib/clients/files';
import { toast } from '@/components/ui/use-toast';
import { translateError } from '@/lib/error-translator';
import {
	CLIENT_FILE_TYPES,
	MAX_FILE_SIZE_CLIENT,
	validateFileForUpload,
} from '@/utils/file-upload-utils';

interface UseFileUploadOptions {
	clientId: string;
	onUploadSuccess?: () => void;
}

export function useFileUpload({ clientId, onUploadSuccess }: UseFileUploadOptions) {
	const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [displayName, setDisplayName] = useState('');
	const [description, setDescription] = useState('');
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = e.target.files;
		if (!selectedFiles || selectedFiles.length === 0) return;

		const file = selectedFiles[0];

		const validation = validateFileForUpload(file, CLIENT_FILE_TYPES, MAX_FILE_SIZE_CLIENT);
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

		setSelectedFile(file);
		setDisplayName(file.name.replace(/\.[^/.]+$/, ''));
		setDescription('');
		setIsUploadDialogOpen(true);
	};

	const handleUploadSubmit = async () => {
		if (!selectedFile) return;

		setIsUploading(true);

		try {
			const { error } = await uploadClientFile(
				clientId,
				selectedFile,
				displayName.trim() || null,
				description.trim() || null
			);

			if (error) {
				toast({
					variant: 'destructive',
					title: 'Error al subir archivo',
					description: translateError(error),
				});
			} else {
				toast({
					title: 'Archivo subido',
					description: 'El archivo se subió exitosamente.',
				});
				handleCloseUploadDialog();
				onUploadSuccess?.();
			}
		} catch (error) {
			console.error('Error uploading file:', error);
			toast({
				variant: 'destructive',
				title: 'Error al subir archivo',
				description: translateError(error),
			});
		} finally {
			setIsUploading(false);
		}
	};

	const handleCloseUploadDialog = () => {
		setIsUploadDialogOpen(false);
		setSelectedFile(null);
		setDisplayName('');
		setDescription('');
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const triggerFileUpload = () => {
		fileInputRef.current?.click();
	};

	return {
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
	};
}
