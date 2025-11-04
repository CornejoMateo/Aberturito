'use client';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useOptions } from '@/hooks/use-options';
import { listOptions, type LineOption, type CodeOption } from '@/lib/stock-options';
import ImageViewer from '@/components/ui/image-viewer';

interface PhotoGalleryModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	materialType?: 'Aluminio' | 'PVC';
}

export function PhotoGalleryModal({
	open,
	onOpenChange,
	materialType = 'Aluminio',
}: PhotoGalleryModalProps) {
	const { toast } = useToast();
	const [file, setFile] = useState<File | null>(null);
	const [nameLine, setNameLine] = useState('');
	const [nameCode, setNameCode] = useState('');
	const [loading, setLoading] = useState(false);
	const [openLine, setOpenLine] = useState(false);
	const [openCode, setOpenCode] = useState(false);
	const [images, setImages] = useState<{ id?: number; image_url?: string | null }[]>([]);
	const [imagesLoading, setImagesLoading] = useState(false);
	const [imagesError, setImagesError] = useState<string | null>(null);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);

	// Options for selects
	const {
		options: linesOptions,
		loading: loadingLines,
		error: errorLines,
	} = useOptions<LineOption>('lines', () =>
		listOptions('lines').then((res) => (res.data ?? []) as LineOption[])
	);
	const {
		options: codesOptions,
		loading: loadingCodes,
		error: errorCodes,
	} = useOptions<CodeOption>('codes', () =>
		listOptions('codes').then((res) => (res.data ?? []) as CodeOption[])
	);

	useEffect(() => {
		console.log('Material Type:', materialType);
		console.log('Lines Options:', linesOptions);
		console.log(
			'Filtered Lines:',
			linesOptions.filter((line) => line.opening === materialType)
		);
	}, [linesOptions, materialType]);

	const fetchImages = async (line?: string, code?: string) => {
		try {
			setImagesLoading(true);
			setImagesError(null);
			const params = new URLSearchParams();
			if (materialType) params.append('material_type', materialType);
			if (line) params.append('name_line', line);
			if (code) params.append('name_code', code);

			const res = await fetch(`/api/gallery/list?${params.toString()}`);
			const data = await res.json();
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

	// Fetch images only when both line and code are selected
	useEffect(() => {
		if (nameLine && nameCode) {
			fetchImages(nameLine, nameCode);
		} else {
			// clear images unless both selectors are set
			setImages([]);
			setImagesError(null);
		}
	}, [nameLine, nameCode, materialType]);
	// Filter codes based on selected line
	const filteredCodes = codesOptions.filter((code) => code.line_name === nameLine);

	const handleUpload = async () => {
		if (!file) {
			toast({
				title: 'Error',
				description: 'Seleccioná una imagen',
				variant: 'destructive',
			});
			return;
		}

		if (!materialType || !nameLine || !nameCode) {
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
			formData.append('material_type', materialType);
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
			} else {
				toast({
					title: 'Error',
					description: data.error || 'Ocurrió un error al subir la imagen',
					variant: 'destructive',
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

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-[600px] w-full">
				<DialogHeader>
					<DialogTitle>Agregar fotos</DialogTitle>
					<DialogDescription>Subí imágenes según línea y código.</DialogDescription>
				</DialogHeader>

				<div className="p-6 flex flex-col gap-4">
					<Popover open={openLine} onOpenChange={setOpenLine}>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								role="combobox"
								className="justify-between w-full bg-background"
							>
								{nameLine ? nameLine : 'Seleccionar línea'}
								<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent
							className="w-full p-0"
							align="start"
							style={{ width: 'var(--radix-popover-trigger-width)' }}
						>
							<Command>
								<CommandInput placeholder="Buscar línea..." />
								<CommandEmpty>No se encontraron líneas.</CommandEmpty>
								<CommandGroup>
									{linesOptions
										.filter((line) => line.opening === materialType)
										.map((line) => (
											<CommandItem
												key={line.id}
												value={line.name_line ?? ''}
												onSelect={(value) => {
													setNameLine(value === nameLine ? '' : value);
													setNameCode(''); // Reset code when line changes
													setOpenLine(false); // Close the popover
												}}
											>
												<Check
													className={cn(
														'mr-2 h-4 w-4',
														nameLine === line.name_line ? 'opacity-100' : 'opacity-0'
													)}
												/>
												{line.name_line}
											</CommandItem>
										))}
								</CommandGroup>
							</Command>
						</PopoverContent>
					</Popover>

					<Popover open={openCode} onOpenChange={setOpenCode}>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								role="combobox"
								className="justify-between w-full bg-background"
							>
								{nameCode
									? nameCode
									: nameLine
										? 'Seleccionar código'
										: 'Primero selecciona una línea'}
								<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent
							className="w-full p-0"
							align="start"
							style={{ width: 'var(--radix-popover-trigger-width)' }}
						>
							<Command>
								<CommandInput placeholder="Buscar código..." />
								<CommandEmpty>No se encontraron códigos.</CommandEmpty>
								<CommandGroup>
									{filteredCodes.map((code) => (
										<CommandItem
											key={code.id}
											value={code.name_code ?? ''}
											onSelect={(value) => {
												setNameCode(value === nameCode ? '' : value);
												setOpenCode(false); // Close the popover
											}}
										>
											<Check
												className={cn(
													'mr-2 h-4 w-4',
													nameCode === code.name_code ? 'opacity-100' : 'opacity-0'
												)}
											/>
											{code.name_code}
										</CommandItem>
									))}
								</CommandGroup>
							</Command>
						</PopoverContent>
					</Popover>

					{/* Gallery results */}
					<div className="pt-4">
						<h3 className="text-sm font-semibold text-foreground mb-2">Imágenes encontradas</h3>

						{imagesLoading ? (
							<div className="text-sm text-muted-foreground">Cargando imágenes...</div>
						) : imagesError ? (
							<div className="text-sm text-destructive">Error: {imagesError}</div>
						) : !nameLine ? (
							<div className="text-sm text-muted-foreground">Seleccioná línea y código para ver imágenes.</div>
						) : nameLine && !nameCode ? (
							<div className="text-sm text-muted-foreground">Seleccioná un código para ver las imágenes de la línea seleccionada.</div>
						) : images.length === 0 ? (
							<div className="text-sm text-muted-foreground">No se encontraron imágenes para la línea y código seleccionados.</div>
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

					<Button onClick={handleUpload} disabled={loading}>
						{loading ? 'Subiendo...' : 'Subir imagen'}
					</Button>

					{/* Shared image viewer */}
					{selectedImage && (
						<ImageViewer open={!!selectedImage} onOpenChange={(v) => !v && setSelectedImage(null)} src={selectedImage} />
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
