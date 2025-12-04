import { toast } from '@/components/ui/use-toast';

export const handleUpload = async ({
	file,
	materialType,
	categoryState,
	nameCategory,
	nameBrand,
	nameLine,
	nameCode,
	setLoading,
	setFile,
	setNameLine,
	setNameCode,
	setNameBrand,
	setNameCategory,
}: {
	file: File | null;
	materialType?: string;
	categoryState?: string;
	nameCategory: string;
	nameBrand: string;
	nameLine: string;
	nameCode: string;
	setLoading: (v: boolean) => void;
	setFile: (v: File | null) => void;
	setNameLine: (v: string) => void;
	setNameCode: (v: string) => void;
	setNameBrand: (v: string) => void;
	setNameCategory: (v: string) => void;
}) => {
	if (!file) {
		toast({
			title: 'Error',
			description: 'Seleccioná una imagen',
			variant: 'destructive',
		});
		return;
	}

	if (
		(categoryState === 'Perfiles' && (!materialType || !nameLine || !nameCode)) ||
		((categoryState === 'Accesorios' || categoryState === 'Herrajes') &&
			(!nameCategory || !nameBrand || !nameLine || !nameCode))
	) {
		toast({
			title: 'Error',
			description: 'Completá todos los campos',
			variant: 'destructive',
		});
		return;
	}

	try {
		setLoading(true);
		const formData = new FormData();
		formData.append('file', file);
		if (categoryState) formData.append('categoryState', categoryState);
		if (categoryState === 'Perfiles') {
			formData.append('material_type', materialType ?? '');
		} else {
			formData.append('name_category', nameCategory);
			formData.append('name_brand', nameBrand);
		}
		formData.append('name_line', nameLine);
		formData.append('name_code', nameCode);

		const res = await fetch('/api/gallery/upload', {
			method: 'POST',
			body: formData,
		});
		const data = await res.json();

		if (data.success) {
			toast({
				title: '¡Éxito!',
				description: 'Imagen subida correctamente',
				duration: 3000,
			});
			setFile(null);
			setNameLine('');
			setNameCode('');
			setNameBrand('');
			setNameCategory('');
		} else {
			toast({
				title: 'Error',
				description: data.error || 'Ocurrió un error al subir la imagen',
				variant: 'destructive',
				duration: 5000,
			});
		}
	} catch (err) {
		console.error('Error al subir la imagen:', err);
		toast({
			title: 'Error',
			description: 'Ocurrió un error al subir la imagen',
			variant: 'destructive',
		});
	} finally {
		setLoading(false);
	}
};
