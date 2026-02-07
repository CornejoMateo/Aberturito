'use client';

import { useState, useEffect } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogDescription,
	DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format, isBefore, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Bell } from 'lucide-react';

interface EventFormModalProps {
	onSave: (data: any) => void;
	children: React.ReactNode;
}

export function EventFormModal({ onSave, children }: EventFormModalProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const { toast } = useToast();

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};
		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	}, []);
	const [formData, setFormData] = useState({
		title: '',
		type: 'produccionOK',
		date: undefined as Date | undefined,
		client: '',
		location: '',
		address: '',
		description: '',
		remember: true,
	});

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { id, value } = e.target;
		setFormData((prev) => ({ ...prev, [id]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.date) {
			toast({
				title: 'Error',
				description: 'La fecha es requerida',
				variant: 'destructive',
			});
			return;
		}

		if (isBefore(startOfDay(formData.date), startOfDay(new Date()))) {
			toast({
				title: 'Error',
				description: 'No se pueden crear eventos en fechas pasadas',
				variant: 'destructive',
			});
			return;
		}

		onSave({
			...formData,
			date: format(formData.date, 'dd-MM-yyyy'),
		});
		
		setIsOpen(false);
		setFormData({
			title: '',
			type: 'produccionOK',
			date: undefined,
			client: '',
			location: '',
			address: '',
			description: '',
			remember: true,
		});

		toast({
			title: 'Evento creado',
			description: 'El evento se ha creado correctamente',
		});
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Nuevo evento</DialogTitle>
					<DialogDescription>
						Completa los detalles del nuevo evento. Haz clic en guardar cuando hayas terminado.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
					<div className="grid gap-2">
						<Label htmlFor="title">Título</Label>
						<Input 
							id="title" 
							value={formData.title} 
							onChange={handleInputChange}
							placeholder="Título del evento"
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="type">Tipo de evento</Label>
						<Select 
							value={formData.type}
							onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
						>
    						<SelectTrigger className="w-full">
								<SelectValue placeholder="Selecciona un tipo de evento" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="produccionOK">Producción OK</SelectItem>
								<SelectItem value="colocacion">Colocación</SelectItem>
								<SelectItem value="medicion">Medición</SelectItem>
								<SelectItem value="otros">Otros</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="grid gap-2">
						<Label>Fecha del evento</Label>
						<Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									className={cn(
										isMobile ? 'w-37' : 'w-full',
										'text-left font-normal',
										!formData.date && 'text-muted-foreground'
									)}
								>
									{formData.date ? (
										format(formData.date, 'PPP', { locale: es })
									) : (
										<span>Seleccionar fecha</span>
									)}
									<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="start">
								<Calendar
									mode="single"
									selected={formData.date}
									onSelect={(date) => {
										setFormData((prev) => ({ ...prev, date }));
										setIsCalendarOpen(false);
									}}
									disabled={(date) => isBefore(date, startOfDay(new Date()))}
									initialFocus
									locale={es}
								/>
							</PopoverContent>
						</Popover>
					</div>
					
					<div className="grid gap-2">
						<Label htmlFor="client">Cliente</Label>
						<Input 
							id="client" 
							value={formData.client} 
							onChange={handleInputChange}
							placeholder="Nombre del cliente"
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="location">Localidad</Label>
						<Input 
							id="location" 
							value={formData.location} 
							onChange={handleInputChange}
							placeholder="Localidad"
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="address">Dirección</Label>
						<Input 
							id="address" 
							value={formData.address} 
							onChange={handleInputChange}
							placeholder="Dirección"
						/>
					</div>

					<div className="grid gap-2 col-span-2">
						<Label htmlFor="description">Descripción</Label>
						<Input 
							id="description" 
							value={formData.description} 
							onChange={handleInputChange}
							placeholder="Detalles adicionales del evento"
						/>
					</div>

					<DialogFooter className='col-span-2 flex flex-row gap-2'>
						<Button
							type="button"
							variant="outline"
							className={`justify-start ${formData.remember ? 'bg-yellow-200' : ''}`}
							onClick={() => setFormData((prev) => ({ ...prev, remember: !prev.remember }))}
						>
							<Bell className={`w-6 h-6 ${formData.remember ? 'text-red-600' : 'text-gray-700'}`} />
						</Button>
						<div className="flex-1" />
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								setFormData({
									title: '',
									type: 'produccionOK',
									date: undefined,
									client: '',
									location: '',
									address: '',
									description: '',
									remember: true,
								});
								setIsOpen(false);
							}}
						>
							Cancelar
						</Button>
						<Button type="submit">Guardar</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
