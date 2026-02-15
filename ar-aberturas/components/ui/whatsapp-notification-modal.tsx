'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageCircle, MapPin, Clock, User, AlertCircle, Smartphone } from 'lucide-react';
import { format } from 'date-fns';

interface Client {
	id: string;
	name?: string | null;
	last_name?: string | null;
	email?: string | null;
	phone_number?: string | null;
}

interface Work {
	id: string;
	locality?: string | null;
	address?: string | null;
	client_id?: string | null;
	client_name?: string | null;
	client_last_name?: string | null;
}

interface WhatsAppNotificationModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	client: Client | null;
	work: Work | null;
	onSendWhatsApp: (data: WhatsAppData) => Promise<void>;
}

interface WhatsAppData {
	clientId: string;
	workId: string;
	phoneNumber: string;
	message: string;
	scheduledDate?: string;
	scheduledTime?: string;
}

export function WhatsAppNotificationModal({
	isOpen,
	onOpenChange,
	client,
	work,
	onSendWhatsApp,
}: WhatsAppNotificationModalProps) {
	const [isSending, setIsSending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		phoneNumber: '',
		message: '',
		scheduledDate: '',
		scheduledTime: '',
	});

	const resetForm = () => {
		const defaultMessage = generateDefaultMessage();
		setFormData({
			phoneNumber: client?.phone_number || '',
			message: defaultMessage,
			scheduledDate: '',
			scheduledTime: '',
		});
		setError(null);
	};

	const handleSend = async () => {
		const phoneNumber = formData.phoneNumber || client?.phone_number;

		if (!phoneNumber || !work) {
			setError('No se puede enviar el mensaje: falta número de teléfono o información de la obra');
			return;
		}

		try {
			setIsSending(true);
			setError(null);

			const whatsappData: WhatsAppData = {
				clientId: client?.id || '',
				workId: work.id,
				phoneNumber: phoneNumber,
				message: formData.message || generateDefaultMessage(),
				scheduledDate: formData.scheduledDate || undefined,
				scheduledTime: formData.scheduledTime || undefined,
			};

			await onSendWhatsApp(whatsappData);
			onOpenChange(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Error al enviar el mensaje de WhatsApp');
		} finally {
			setIsSending(false);
		}
	};

	// Reset form when client or work changes
	useEffect(() => {
		if (isOpen && client && work) {
			resetForm();
		}
	}, [isOpen, client, work]);

	// Update message when scheduled date or time changes
	useEffect(() => {
		if (isOpen && client && work && (formData.scheduledDate || formData.scheduledTime)) {
			const clientName = `${client?.name || ''} ${client?.last_name || ''}`.trim();
			const workLocation = `${work?.locality || ''}${work?.address ? `, ${work.address}` : ''}`;

			let arrivalInfo = '';
			if (formData.scheduledDate || formData.scheduledTime) {
				arrivalInfo = '\n\n*Hora estimada de llegada:*\n';
				if (formData.scheduledDate) {
					arrivalInfo += `- Fecha: ${format(new Date(formData.scheduledDate + 'T00:00:00'), 'dd/MM/yyyy')}\n`;
				}
				if (formData.scheduledTime) {
					arrivalInfo += `- Hora: ${formData.scheduledTime}\n`;
				}
			}

			const newMessage = `*AR Aberturas - Notificación de Obra*

Estimado/a ${clientName},

Le informamos que nuestro equipo de colocación estará llegando a la obra ubicada en ${workLocation}${formData.scheduledDate || formData.scheduledTime ? ' en la fecha y horario indicados' : ' en las próximas horas'}.

*Detalles de la obra:*
- Ubicación: ${workLocation}${arrivalInfo}

Si tiene alguna pregunta o necesita coordinar algún detalle adicional, no dude en contactarnos.

Atentamente,
El equipo de AR Aberturas`;

			setFormData((prev) => ({
				...prev,
				message: newMessage,
			}));
		}
	}, [formData.scheduledDate, formData.scheduledTime, isOpen, client, work]);

	const generateDefaultMessage = () => {
		const clientName = `${client?.name || ''} ${client?.last_name || ''}`.trim();
		const workLocation = `${work?.locality || ''}${work?.address ? `, ${work.address}` : ''}`;

		let arrivalInfo = '';
		if (formData.scheduledDate || formData.scheduledTime) {
			arrivalInfo = '\n\n*Hora estimada de llegada:*\n';
			if (formData.scheduledDate) {
				arrivalInfo += `- Fecha: ${format(new Date(formData.scheduledDate + 'T00:00:00'), 'dd/MM/yyyy')}\n`;
			}
			if (formData.scheduledTime) {
				arrivalInfo += `- Hora: ${formData.scheduledTime}\n`;
			}
		}

		return `*AR Aberturas - Notificación de Obra*

Estimado/a ${clientName},

Le informamos que nuestro equipo de colocación estará llegando a la obra ubicada en ${workLocation}${formData.scheduledDate || formData.scheduledTime ? ' en la fecha y horario indicados' : ' en las próximas horas'}.

*Detalles de la obra:*
- Ubicación: ${workLocation}${arrivalInfo}

Por favor, asegúrese de que el lugar esté accesible y preparado para la instalación.

Si tiene alguna pregunta o necesita coordinar algún detalle adicional, no dude en contactarnos.

Atentamente,
El equipo de AR Aberturas`;
	};

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	if (!client || !work) {
		return null;
	}

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<MessageCircle className="h-5 w-5 text-green-600" />
						Enviar Notificación por WhatsApp
					</DialogTitle>
					<DialogDescription>
						Envíe una notificación al cliente sobre la llegada del equipo de colocación
					</DialogDescription>
				</DialogHeader>

				{error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				<div className="space-y-4">
					{/* Client and Work Info */}
					<div className="bg-secondary/50 rounded-lg p-4 space-y-3">
						<h4 className="font-medium text-sm">Información del Cliente y Obra</h4>

						<div className="space-y-2 text-sm">
							<div className="flex items-center gap-2">
								<User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
								<span className="font-medium">Cliente:</span>
								<span>
									{client.name} {client.last_name}
								</span>
							</div>

							<div className="flex items-center gap-2">
								<Smartphone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
								<span className="font-medium">Teléfono:</span>
								<span className="text-green-600">{client.phone_number || 'No especificado'}</span>
							</div>

							<div className="flex items-center gap-2">
								<MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
								<span className="font-medium">Obra:</span>
								<span>
									{work.locality}
									{work.address ? `, ${work.address}` : ''}
								</span>
							</div>
						</div>
					</div>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="phoneNumber">Número de Teléfono</Label>
							<Input
								id="phoneNumber"
								value={formData.phoneNumber}
								onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
								placeholder="5493584178955"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="message">Mensaje</Label>
							<Textarea
								id="message"
								value={formData.message}
								onChange={(e) => handleInputChange('message', e.target.value)}
								placeholder="Escribe tu mensaje aquí..."
								className="min-h-[200px]"
							/>
							<p className="text-xs text-muted-foreground">
								El mensaje se enviará con formato de WhatsApp. Se puede usar *texto* para negrita.
							</p>
						</div>

						{/* Arrival Time Information */}
						<div className="border-t pt-4">
							<h4 className="font-medium text-sm mb-3">
								Fecha y hora de llegada (de los colocadores)
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
								<div className="space-y-2">
									<Label htmlFor="scheduledDate">Fecha de llegada</Label>
									<Input
										id="scheduledDate"
										type="date"
										value={formData.scheduledDate}
										onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
										min={format(new Date(), 'yyyy-MM-dd')}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="scheduledTime">Hora de llegada</Label>
									<Input
										id="scheduledTime"
										type="time"
										value={formData.scheduledTime}
										onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
									/>
								</div>
							</div>
							{(formData.scheduledDate || formData.scheduledTime) && (
								<Alert>
									<Clock className="h-4 w-4" />
									<AlertDescription className="text-xs">
										El equipo de colocación llegará el{' '}
										{formData.scheduledDate &&
											format(new Date(formData.scheduledDate + 'T00:00:00'), 'dd/MM/yyyy')}
										{formData.scheduledTime && ` a las ${formData.scheduledTime}`}
									</AlertDescription>
								</Alert>
							)}
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
						Cancelar
					</Button>
					<Button
						onClick={handleSend}
						disabled={isSending || !(formData.phoneNumber || client?.phone_number)}
						className="bg-green-600 hover:bg-green-700"
					>
						{isSending ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Enviando...
							</>
						) : (
							<>
								<MessageCircle className="h-4 w-4 mr-2" />
								Enviar WhatsApp
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
