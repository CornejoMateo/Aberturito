import { useEffect, useState } from 'react';
import { getClientFilesByChecklist, deleteClientFile } from '@/lib/clients/files';
import { getSupabaseClient } from '@/lib/supabase-client';
import { toast } from '@/components/ui/use-toast';
import { translateError } from '@/lib/error-translator';

export interface ChecklistImage {
	id: string;
	name: string;
	title: string | null;
	url: string;
	uploaded_at: string;
}

export function useChecklistImages(checklistId: string) {
	const [images, setImages] = useState<ChecklistImage[]>([]);
	const [loading, setLoading] = useState(false);

	const loadImages = async () => {
		setLoading(true);
		try {
			const { data, error } = await getClientFilesByChecklist(checklistId);

			if (error || !data) {
				setImages([]);
				return;
			}

			const supabase = getSupabaseClient();

			const imagesData: ChecklistImage[] = await Promise.all(
				data
					.filter((file) => file.path)
					.map(async (file) => {
						const { data: signedUrlData } = await supabase.storage
							.from('clients')
							.createSignedUrl(file.path || '', 60 * 60);

						return {
							id: file.id,
							name: file.path?.split('/').pop() || '',
							title: file.title,
							url: signedUrlData?.signedUrl || '',
							uploaded_at: file.uploaded_at,
						};
					})
			);

			setImages(imagesData.filter((img) => img.url));
		} catch (err) {
			console.error(err);
			setImages([]);
		} finally {
			setLoading(false);
		}
	};

	const deleteImage = async (id: string) => {
		try {
			const { success, error } = await deleteClientFile(id);

			if (error) {
				toast({
					variant: 'destructive',
					title: 'Error al eliminar archivo',
					description: translateError(error),
				});
				return;
			}

			if (success) {
				toast({
					title: 'Archivo eliminado',
					description: 'El archivo se eliminó exitosamente.',
				});
				await loadImages();
			}
		} catch (err) {
			console.error(err);
		}
	};

	useEffect(() => {
		loadImages();
	}, [checklistId]);

	return {
		images,
		loading,
		reload: loadImages,
		deleteImage,
	};
}
