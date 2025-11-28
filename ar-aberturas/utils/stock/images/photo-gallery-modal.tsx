'use client';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { cn } from '../../../lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LineSelect } from '@/components/stock/line-select';
import { CodeSelect } from '@/components/stock/code-select';
import ImageViewer from '@/components/ui/image-viewer';
import { ca } from 'date-fns/locale';
import { set } from 'date-fns';
import { fetchImages, fetchImagesAccsIron } from './gallery-api';
import { handleUpload as uploadImage } from './gallery-upload';

interface PhotoGalleryModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	materialType?: 'Aluminio' | 'PVC';
    categoryState?: 'Accesorios' | 'Herrajes' | 'Perfiles' | 'Insumos';
}

export function PhotoGalleryModal({
	open,
	onOpenChange,
	materialType = 'Aluminio',
	categoryState,
}: PhotoGalleryModalProps) {
	const { toast } = useToast();
	const [file, setFile] = useState<File | null>(null);
	const [nameLine, setNameLine] = useState('');
	const [nameCode, setNameCode] = useState('');

	const [nameCategory, setNameCategory] = useState('');
	const [nameBrand, setNameBrand] = useState('');

	const [loadingSearch, setLoadingSearch] = useState(false);
	const [loading, setLoading] = useState(false);
	const [searched, setSearched] = useState(false);
	const [images, setImages] = useState<{ id?: number; image_url?: string | null }[]>([]);
	const [imagesLoading, setImagesLoading] = useState(false);
	const [imagesError, setImagesError] = useState<string | null>(null);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);

	// Nuevo fetch para perfiles
	const fetchImagesWrapper = async (line?: string, code?: string) => {
		try {
			setImagesLoading(true);
			setImagesError(null);
			const data = await fetchImages(materialType, line, code);
			if (data.success) {
				setImages(data.images ?? []);
			} else {
				setImages([]);
				setImagesError(data.error ?? 'Error al obtener imágenes');
			}
		} catch (err: any) {
			console.error('Error fetching images', err);
			setImagesError(err?.message ?? String(err));
			setImages([]);
		} finally {
			setImagesLoading(false);
		}
	};

	// Nuevo fetch para accesorios/herrajes
	const fetchImagesAccsIronWrapper = async (
		category?: string,
		line?: string,
		brand?: string,
		code?: string
	) => {
		try {
			setImagesLoading(true);
			setImagesError(null);
			setLoadingSearch(true);
			const data = await fetchImagesAccsIron(categoryState, category, line, brand, code);
			if (data.success) {
				setImages(data.images ?? []);
			} else {
				setImages([]);
				setImagesError(data.error ?? 'Error al obtener imágenes');
			}
		} catch (err: any) {
			console.error('Error fetching images', err);
			setImagesError(err?.message ?? String(err));
			setImages([]);
		} finally {
			setImagesLoading(false);
			setLoadingSearch(false);
		}
	};

	useEffect(() => {
		if (categoryState === 'Perfiles') {
			if (nameLine && nameCode) {
				fetchImagesWrapper(nameLine, nameCode);
			} else {
				// clear images unless both selectors are set
				setImages([]);
				setImagesError(null);
			}
		}
	}, [nameLine, nameCode, materialType, categoryState]);

	const handleUploadClick = () => {
		uploadImage({
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
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-[600px] w-full">
				<DialogHeader>
					<DialogTitle>Agregar y buscar fotos</DialogTitle>
					<DialogDescription>
						{categoryState == 'Perfiles'
							? 'Subí imágenes según línea y código.'
							: 'Subí imágenes según categoría, linea, marca y código'}
					</DialogDescription>
				</DialogHeader>

				{categoryState === 'Perfiles' && (
					<div className="p-6 flex flex-col gap-4">
						<LineSelect
							value={nameLine}
							onValueChange={(value) => {
								setNameLine(value);
								setNameCode(''); // Reset code when line changes
							}}
							materialType={materialType}
						/>
						<CodeSelect
							value={nameCode}
							onValueChange={setNameCode}
							lineName={nameLine}
							materialType={materialType}
						/>
						{/* Gallery results */}
						<div className="pt-4">
							<h3 className="text-sm font-semibold text-foreground mb-2">Imágenes encontradas</h3>
							{imagesLoading ? (
								<div className="text-sm text-muted-foreground">Cargando imágenes...</div>
							) : imagesError ? (
								<div className="text-sm text-destructive">Error: {imagesError}</div>
							) : !nameLine ? (
								<div className="text-sm text-muted-foreground">
									Seleccioná línea y código para ver imágenes.
								</div>
							) : nameLine && !nameCode ? (
								<div className="text-sm text-muted-foreground">
									Seleccioná un código para ver las imágenes de la línea seleccionada.
								</div>
							) : images.length === 0 ? (
								<div className="text-sm text-muted-foreground">
									No se encontraron imágenes para la línea y código seleccionados.
								</div>
							) : (
								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
									{images.map((img) => (
										<button
											key={img.id}
											onClick={() => img.image_url && setSelectedImage(img.image_url)}
											className="aspect-video bg-muted rounded overflow-hidden border border-border shadow-sm p-0"
										>
											{img.image_url ? (
												<img
													src={img.image_url}
													alt={`Imagen ${img.id}`}
													className="w-full h-full object-cover"
													loading="lazy"
												/>
											) : (
												<div className="flex items-center justify-center h-full text-muted-foreground">
													Sin imagen
												</div>
											)}
										</button>
									))}
								</div>
							)}
						</div>
						<label htmlFor="file-upload" className="w-full">
							<div className="w-full px-4 py-2 border rounded bg-background text-muted-foreground cursor-pointer text-center">
								{file ? file.name : 'Elegí una imagen'}
							</div>
							<Input
								id="file-upload"
								type="file"
								onChange={(e) => setFile(e.target.files?.[0] || null)}
								className="hidden"
							/>
						</label>
						<Button onClick={handleUploadClick} disabled={loading}>
							{loading ? 'Subiendo...' : 'Subir imagen'}
						</Button>{' '}
						{/* Shared image viewer */}
						{selectedImage && (
							<ImageViewer
								open={!!selectedImage}
								onOpenChange={(v) => !v && setSelectedImage(null)}
								src={selectedImage}
								trash={true}
								onDelete={async () => {
									const res = await fetch(
										`/api/gallery/delete?categoryState=${categoryState}&material_type=${materialType}&code_name=${nameCode}&line_name=${nameLine}`,
										{
											method: 'DELETE',
										}
									);
									const data = await res.json();
									if (data.success) {
										toast({
											title: 'Imagen eliminada correctamente',
											variant: 'default',
										});
										setSelectedImage(null);
										setNameCode('');
										setNameLine('');
									} else {
										toast({
											title: 'Error al eliminar imagen',
											description: data.error || 'Ocurrió un error al eliminar la imagen',
											variant: 'destructive',
										});
									}
								}}
							/>
						)}
					</div>
				)}

				{(categoryState === 'Accesorios' || categoryState === 'Herrajes' || categoryState === 'Insumos') && (
					<div className="p-6 flex flex-col gap-4">
						<Input
							value={nameCategory}
							onChange={(e) => setNameCategory(e.target.value)}
							placeholder="Categoría"
							className="w-full"
						/>

						<Input
							value={nameLine}
							onChange={(e) => setNameLine(e.target.value)}
							placeholder="Línea"
							className="w-full"
						/>

						<Input
							value={nameBrand}
							onChange={(e) => setNameBrand(e.target.value)}
							placeholder="Marca"
							className="w-full"
						/>

						<Input
							value={nameCode}
							onChange={(e) => setNameCode(e.target.value)}
							placeholder="Código"
							className="w-full"
						/>

						{/* Gallery results */}
						<div className="pt-4">
							<h3 className="text-sm font-semibold text-foreground mb-2">Imágenes encontradas</h3>
							{!nameLine || !nameCategory || !nameBrand || !nameCode ? (
								<div className="text-sm text-muted-foreground">
									Rellena los campos para ver imágenes.
								</div>
							) : imagesLoading ? (
								<div className="text-sm text-muted-foreground">Cargando imágenes...</div>
							) : imagesError ? (
								<div className="text-sm text-destructive">Error: {imagesError}</div>
							) : images.length === 0 && searched ? (
								<div className="text-sm text-muted-foreground">
									No se encontraron para los campos seleccionados.
								</div>
							) : (
								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
									{images.map((img) => (
										<button
											key={img.id}
											onClick={() => img.image_url && setSelectedImage(img.image_url)}
											className="aspect-video bg-muted rounded overflow-hidden border border-border shadow-sm p-0"
										>
											{img.image_url ? (
												<img
													src={img.image_url}
													alt={`Imagen ${img.id}`}
													className="w-full h-full object-cover"
													loading="lazy"
												/>
											) : (
												<div className="flex items-center justify-center h-full text-muted-foreground">
													Sin imagen
												</div>
											)}
										</button>
									))}
								</div>
							)}
						</div>

						<label htmlFor="file-upload" className="w-full">
							<div className="w-full px-4 py-2 border rounded bg-background text-muted-foreground cursor-pointer text-center">
								{file ? file.name : 'Elegí una imagen'}
							</div>
							<Input
								id="file-upload"
								type="file"
								onChange={(e) => setFile(e.target.files?.[0] || null)}
								className="hidden"
							/>
						</label>

						<div className="flex gap-2 w-full">
							<Button className="flex-1 w-full" onClick={handleUploadClick} disabled={loading}>
								{loading ? 'Subiendo...' : 'Subir imagen'}
							</Button>
							<Button
								className="flex-1 w-full"
								variant="outline"
								onClick={() => {
									fetchImagesAccsIronWrapper(nameCategory, nameLine, nameBrand, nameCode);
									setSearched(true);
								}}
								disabled={loadingSearch}
							>
								{loadingSearch ? 'Buscando' : 'Buscar imagen'}
							</Button>
						</div>

						{/* Shared image viewer */}
						{selectedImage && (
							<ImageViewer
								open={!!selectedImage}
								onOpenChange={(v) => !v && setSelectedImage(null)}
								src={selectedImage}
								trash={true}
								onDelete={async () => {
									const res = await fetch(
										`/api/gallery/delete?categoryState=${categoryState}&name_category=${nameCategory}&name_brand=${nameBrand}&code_name=${nameCode}&line_name=${nameLine}`,
										{
											method: 'DELETE',
										}
									);
									const data = await res.json();
									if (data.success) {
										toast({
											title: 'Imagen eliminada correctamente',
											variant: 'default',
										});
										setSelectedImage(null);
										setNameCode('');
										setNameLine('');
										setNameBrand('');
										setNameCategory('');
									} else {
										toast({
											title: 'Error al eliminar imagen',
											description: data.error || 'Ocurrió un error al eliminar la imagen',
											variant: 'destructive',
										});
									}
								}}
							/>
						)}
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
