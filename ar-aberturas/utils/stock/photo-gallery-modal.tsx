'use client';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PhotoGalleryModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function PhotoGalleryModal({ open, onOpenChange }: PhotoGalleryModalProps) {
	const [file, setFile] = useState<File | null>(null);
	const [materialType, setMaterialType] = useState('');
	const [nameLine, setNameLine] = useState('');
	const [nameCode, setNameCode] = useState('');
	const [loading, setLoading] = useState(false);

	const handleUpload = async () => {
		if (!file) return alert('Seleccioná una imagen');
		if (!materialType || !nameLine || !nameCode) return alert('Completá todos los campos');

		try {
			setLoading(true);

			const formData = new FormData();
			formData.append('file', file);
			formData.append('material_type', materialType);
			formData.append('name_line', nameLine);
			formData.append('name_code', nameCode);

			const res = await fetch('/api/gallery/upload', {
				method: 'POST',
				body: formData,
			});

			const data = await res.json();

			if (data.success) {
				alert('✅ Imagen subida correctamente');
				setFile(null);
				setMaterialType('');
				setNameLine('');
				setNameCode('');
			} else {
				alert(`Error: ${data.error}`);
			}
		} catch (err) {
			console.error('Error al subir la imagen:', err);
			alert('Ocurrió un error al subir la imagen');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-[600px] w-full">
				<DialogHeader>
					<DialogTitle>Agregar fotos</DialogTitle>
					<DialogDescription>
						Subí imágenes según tipo de abertura, línea y código.
					</DialogDescription>
				</DialogHeader>

				<div className="p-6 flex flex-col gap-4">
					<Input
						placeholder="Tipo de abertura"
						value={materialType}
						onChange={(e) => setMaterialType(e.target.value)}
					/>
					<Input
						placeholder="Línea"
						value={nameLine}
						onChange={(e) => setNameLine(e.target.value)}
					/>
					<Input
						placeholder="Código"
						value={nameCode}
						onChange={(e) => setNameCode(e.target.value)}
					/>
					<Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />

					<Button onClick={handleUpload} disabled={loading}>
						{loading ? 'Subiendo...' : 'Subir imagen'}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
