'use client';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { cn } from "../../lib/utils";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react";
import { useOptions } from '@/hooks/useOptions';
import { listOptions, type LineOption, type CodeOption } from '@/lib/stock-options';

interface PhotoGalleryModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	materialType?: 'Aluminio' | 'PVC';
}

export function PhotoGalleryModal({ open, onOpenChange, materialType = 'Aluminio' }: PhotoGalleryModalProps) {
	const [file, setFile] = useState<File | null>(null);
	const [nameLine, setNameLine] = useState('');
	const [nameCode, setNameCode] = useState('');
	const [loading, setLoading] = useState(false);
    const [openLine, setOpenLine] = useState(false);
    const [openCode, setOpenCode] = useState(false);

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
        console.log('Filtered Lines:', linesOptions.filter(line => line.opening === materialType));
    }, [linesOptions, materialType]);

    // Filter codes based on selected line
    const filteredCodes = codesOptions.filter(
        (code) => code.line_name === nameLine
    );

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
                    <Popover open={openLine} onOpenChange={setOpenLine}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                className="justify-between w-full bg-background"
                            >
                                {nameLine ? nameLine : "Seleccionar línea"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
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
                                                        "mr-2 h-4 w-4",
                                                        nameLine === line.name_line ? "opacity-100" : "opacity-0"
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
                                {nameCode ? nameCode : nameLine ? "Seleccionar código" : "Primero selecciona una línea"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
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
                                                    "mr-2 h-4 w-4",
                                                    nameCode === code.name_code ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {code.name_code}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>

					<Input 
                        type="file" 
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="bg-background" 
                    />

					<Button onClick={handleUpload} disabled={loading}>
						{loading ? 'Subiendo...' : 'Subir imagen'}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
