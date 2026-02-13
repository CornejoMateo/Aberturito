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
import { Loader2, Mail, MapPin, Calendar, Clock, User, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

interface EmailNotificationModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	client: Client | null;
	work: Work | null;
	onSendEmail: (data: EmailData) => Promise<void>;
}

interface EmailData {
	clientId: string;
	workId: string;
	to: string;
	subject: string;
	message: string;
	scheduledDate?: string;
	scheduledTime?: string;
}

export function EmailNotificationModal({
	isOpen,
	onOpenChange,
	client,
	work,
	onSendEmail,
}: EmailNotificationModalProps) {
	const [isSending, setIsSending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		subject: '',
		message: '',
		scheduledDate: '',
		scheduledTime: '',
	});

	const resetForm = () => {
		const defaultMessage = generateDefaultMessage();
		setFormData({
			subject: '',
			message: defaultMessage,
			scheduledDate: '',
			scheduledTime: '',
		});
		setError(null);
	};

	const handleSend = async () => {
		if (!client?.email || !work) {
			setError('No se puede enviar el email: falta información del cliente o la obra');
			return;
		}

		try {
			setIsSending(true);
			setError(null);

			const emailData: EmailData = {
				clientId: client.id,
				workId: work.id,
				to: client.email,
				subject: formData.subject || `Notificación sobre obra en ${work.locality}`,
				message: formData.message || generateDefaultMessage(),
				scheduledDate: formData.scheduledDate || undefined,
				scheduledTime: formData.scheduledTime || undefined,
			};

			await onSendEmail(emailData);
			onOpenChange(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Error al enviar el email');
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
				arrivalInfo = '\n\nHora estimada de llegada:\n';
				if (formData.scheduledDate) {
					arrivalInfo += `- Fecha: ${format(new Date(formData.scheduledDate + 'T00:00:00'), 'dd/MM/yyyy')}\n`;
				}
				if (formData.scheduledTime) {
					arrivalInfo += `- Hora: ${formData.scheduledTime}\n`;
				}
			}

			const newMessage = `Estimado/a ${clientName},

Le informamos que nuestro equipo de colocación estará llegando a la obra ubicada en ${workLocation}${formData.scheduledDate || formData.scheduledTime ? ' en la fecha y horario indicados' : ' en las próximas horas'}.

Detalles de la obra:
- Ubicación: ${workLocation}${arrivalInfo}

Por favor, asegúrese de que el lugar esté accesible y preparado para la instalación.

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
			arrivalInfo = '\n\nHora estimada de llegada:\n';
			if (formData.scheduledDate) {
				arrivalInfo += `- Fecha: ${format(new Date(formData.scheduledDate + 'T00:00:00'), 'dd/MM/yyyy')}\n`;
			}
			if (formData.scheduledTime) {
				arrivalInfo += `- Hora: ${formData.scheduledTime}\n`;
			}
		}

		return `Estimado/a ${clientName},

Le informamos que nuestro equipo de colocación estará llegando a la obra ubicada en ${workLocation}${formData.scheduledDate || formData.scheduledTime ? ' en la fecha y horario indicados' : ' en las próximas horas'}.

Detalles de la obra:
- Ubicación: ${workLocation}${arrivalInfo}

Por favor, asegúrese de que el lugar esté accesible y preparado para la instalación.

Si tiene alguna pregunta o necesita coordinar algún detalle adicional, no dude en contactarnos.

Atentamente,
El equipo de AR Aberturas`;
	};

	const handleInputChange = (field: string, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	if (!client || !work) {
		return null;
	}

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Mail className="h-5 w-5" />
						Enviar Notificación por Email
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
						
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
							<div className="flex items-center gap-2">
								<User className="h-4 w-4 text-muted-foreground" />
								<span className="font-medium">Cliente:</span>
								<span>{client.name} {client.last_name}</span>
							</div>
							
							<div className="flex items-center gap-2">
								<Mail className="h-4 w-4 text-muted-foreground" />
								<span className="font-medium">Email:</span>
								<span className="text-blue-600">{client.email}</span>
							</div>
							
							<div className="flex items-center gap-2">
								<MapPin className="h-4 w-4 text-muted-foreground" />
								<span className="font-medium">Obra:</span>
								<span>{work.locality}{work.address ? `, ${work.address}` : ''}</span>
							</div>

						</div>
					</div>

					{/* Email Form */}
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="subject">Asunto del Email</Label>
							<Input
								id="subject"
								value={formData.subject}
								onChange={(e) => handleInputChange('subject', e.target.value)}
								placeholder={`Notificación sobre obra en ${work.locality}`}
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
						</div>

						{/* Arrival Time Information */}
						<div className="border-t pt-4">
							<h4 className="font-medium text-sm mb-3">Fecha y Hora de Llegada (De los colocadores)</h4>
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
										El equipo de colocación llegará el {formData.scheduledDate && format(new Date(formData.scheduledDate + 'T00:00:00'), "dd/MM/yyyy")}
										{formData.scheduledTime && ` a las ${formData.scheduledTime}`}
									</AlertDescription>
								</Alert>
							)}
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isSending}
					>
						Cancelar
					</Button>
					<Button
						onClick={handleSend}
						disabled={isSending || !client.email}
					>
						{isSending ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Enviando...
							</>
						) : (
							<>
								<Mail className="h-4 w-4 mr-2" />
								Enviar Email
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
