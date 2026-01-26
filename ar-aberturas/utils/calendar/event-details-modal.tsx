'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
	CalendarIcon,
	MapPin,
	User,
	FileText,
	CheckCircle,
	Clock,
	ChevronDown,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { typeConfig, statusOptions } from '@/constants/type-config';
import { Event, updateEvent } from '@/lib/calendar/events';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Bell } from 'lucide-react';

interface EventDetailsModalProps {
	isOpen: boolean;
	onClose: () => void;
	event: Event;
	onEventUpdated?: () => void;
}

export function EventDetailsModal({
	isOpen,
	onClose,
	event,
	onEventUpdated,
}: EventDetailsModalProps) {
	const typeInfo = typeConfig[(event.type ?? 'otros') as keyof typeof typeConfig];
	const TypeIcon = typeInfo.icon;
	const { toast } = useToast();
	const [currentStatus, setCurrentStatus] = useState(event.status || 'Pendiente');

	const [currentRemember, setCurrentRemember] = useState(event.remember || false);

	const handleRememberChange = async () => {
		try {
			const newRemember = !currentRemember;
			setCurrentRemember(newRemember);
			const { error } = await updateEvent(event.id, { remember: newRemember });
			if (error) {
				throw error;
			}
			onEventUpdated?.();
			toast({
				title: 'Recordatorio actualizado',
				description: newRemember
					? 'El recordatorio ha sido activado'
					: 'El recordatorio ha sido desactivado',
			});
		} catch (error) {
			console.error('Error al actualizar el recordatorio:', error);
			setCurrentRemember(event.remember || false);
			toast({
				title: 'Error',
				description: 'No se pudo actualizar el recordatorio',
				variant: 'destructive',
			});
		}
	};

	const handleStatusChange = async (newStatus: string) => {
		try {
			setCurrentStatus(newStatus);
			const { error } = await updateEvent(event.id, { status: newStatus });

			if (error) {
				throw error;
			}

			onEventUpdated?.();

			toast({
				title: 'Estado actualizado',
				description: `El evento ha sido marcado como ${newStatus}`,
			});
		} catch (error) {
			console.error('Error al actualizar el estado:', error);
			setCurrentStatus(event.status || 'Pendiente');
			toast({
				title: 'Error',
				description: 'No se pudo actualizar el estado del evento',
				variant: 'destructive',
			});
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<DialogTitle className="text-xl">{event.title}</DialogTitle>
						</div>
						<div className="flex items-center gap-1 text-sm text-muted-foreground group">
							<select
								value={currentStatus || ''}
								onChange={(e) => handleStatusChange(e.target.value)}
								className="bg-transparent border-none focus:ring-0 focus:ring-offset-0 p-1 pr-6 appearance-none focus:outline-none cursor-pointer hover:bg-muted rounded-md"
							>
								{statusOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
							<ChevronDown className="h-3.5 w-3.5 -ml-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
						</div>
					</div>
				</DialogHeader>

				<div className="space-y-4 py-2">
					<div className="space-y-3">
						{event.client && (
							<div className="flex items-start gap-3">
								<User className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
								<div>
									<p className="text-sm text-muted-foreground">Cliente</p>
									<p className="text-sm">{event.client}</p>
								</div>
							</div>
						)}

						<div className="flex items-start gap-3">
							<CalendarIcon className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
							<div>
								<p className="text-sm text-muted-foreground">Fecha</p>
								<p className="text-sm">{event.date}</p>
							</div>
						</div>

						{event.location && (
							<div className="flex items-start gap-3">
								<MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
								<div>
									<p className="text-sm text-muted-foreground">Localidad</p>
									<p className="text-sm">{event.location}</p>
								</div>
							</div>
						)}

						{event.address && (
							<div className="flex items-start gap-3">
								<MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
								<div>
									<p className="text-sm text-muted-foreground">Dirección</p>
									<p className="text-sm">{event.address}</p>
								</div>
							</div>
						)}

						<div className="flex items-start gap-3">
							<FileText className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
							<div className="flex-1">
								<p className="text-sm text-muted-foreground">Descripción</p>
								<p className="text-sm whitespace-pre-line">
									{event.description || 'No hay descripción disponible'}
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className="flex items-center justify-between gap-2 mb-4">
					<Badge
						className="px-2 py-1 text-sm flex items-center gap-1"
						style={{ backgroundColor: typeInfo.backgroundColor }}
					>
						{typeInfo.label}
					</Badge>
					{event.is_overdue && (
						<span className="text-xs font-semibold text-red-600 mx-2">Evento vencido</span>
					)}
					<div className="flex items-center gap-2">
						<Button variant="outline" onClick={onClose}>
							Cerrar
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={handleRememberChange}
							className={`justify-start ${currentRemember ? 'bg-yellow-200' : ''}`}
						>
							<Bell className={`w-6 h-6 ${currentRemember ? 'text-red-600' : 'text-gray-700'}`} />
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
