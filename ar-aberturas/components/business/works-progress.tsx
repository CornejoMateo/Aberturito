'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	ClipboardCheck,
	MapPin,
	Calendar,
	AlertCircle,
	CheckCircle2,
	Clock,
	List,
	StickyNote,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { ChecklistCompletionModal } from '@/utils/checklists/checklist-completion-modal';
import { listWorks } from '@/lib/works/works';
import { getChecklistsByWorkIds } from '@/lib/works/checklists';
import { getClientById } from '@/lib/clients/clients';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AddressLink } from '@/components/ui/address-link';
import type { Work } from '@/lib/works/works';
import type { ChecklistItem } from '@/lib/works/checklists';
import { statusConfig } from '@/constants/status-config';
import type { StatusFilter } from '@/constants/status-config';
import { EmailNotificationModal } from '@/components/ui/email-notification-modal';
import { WhatsAppNotificationModal } from '@/components/ui/whatsapp-notification-modal';
import { useAuth } from '@/components/provider/auth-provider';
import { Mail, MessageCircle } from 'lucide-react';

type WorkWithProgress = Work & {
	status: 'pendiente' | 'en_progreso' | 'completada';
	tasks: ChecklistItem[];
	progress: number;
	hasNotes: boolean;
};

export function WorksOpenings() {
	const [installations, setInstallations] = useState<WorkWithProgress[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
	const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
	const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
	const [selectedWork, setSelectedWork] = useState<WorkWithProgress | null>(null);
	const [selectedClient, setSelectedClient] = useState<any>(null);
	const { user } = useAuth();

	useEffect(() => {
		const fetchWorks = async () => {
			try {
				setLoading(true);
				const { data: works, error } = await listWorks();

				if (error) {
					console.error('Error al obtener las obras:', error);
					throw error;
				}

				if (!works || works.length === 0) {
					setInstallations([]);
					return;
				}

				// get checklists for each work and calculate progress
				const workIds = works.map((w) => w.id);
				const { data: allChecklists, error: checklistsError } = await getChecklistsByWorkIds(workIds);
				if (checklistsError) {
					console.error('Error al obtener checklists:', checklistsError);
				}

				const checklistsByWorkId = new Map<string, ChecklistItem[]>();
				const hasNotesByWorkId = new Map<string, boolean>();
				for (const cl of allChecklists ?? []) {
					const wid = cl.work_id ?? '';
					if (!wid) continue;
					const prevItems = checklistsByWorkId.get(wid) ?? [];
					const items = cl.items ?? [];
					prevItems.push(...items);
					checklistsByWorkId.set(wid, prevItems);

					if (!hasNotesByWorkId.get(wid)) {
						hasNotesByWorkId.set(wid, (cl.notes || '').trim().length > 0);
					}
				}

				const worksWithChecklists = works.map((work) => {
					const tasks = checklistsByWorkId.get(work.id) ?? [];
					const hasNotes = hasNotesByWorkId.get(work.id) ?? false;

					const totalTasks = tasks.length;
					const completedTasks = tasks.filter((task) => task.done).length;
					const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

					let status: 'pendiente' | 'en_progreso' | 'completada' = 'pendiente';
					if (progress === 100) {
						status = 'completada';
					} else if (progress > 0) {
						status = 'en_progreso';
					}

					return {
						...work,
						status,
						tasks,
						progress,
						hasNotes,
					};
				});

				setInstallations(worksWithChecklists);
			} catch (error) {
				console.error('Error al cargar las obras:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchWorks();
	}, []);

	const getProgress = (tasks: ChecklistItem[]) => {
		const completed = tasks.filter((t) => t.done).length;
		return (completed / tasks.length) * 100;
	};

	const pendingCount = installations.filter((i) => i.status === 'pendiente').length;
	const inProgressCount = installations.filter((i) => i.status === 'en_progreso').length;
	const completedCount = installations.filter((i) => i.status === 'completada').length;

	const filteredInstallations = installations.filter((installation) => {
		// Apply status filter
		const matchesStatus = statusFilter === 'todos' || installation.status === statusFilter;

		// Apply search query filter
		const matchesSearch =
			searchQuery === '' ||
			installation.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			installation.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			installation.client_last_name?.toLowerCase().includes(searchQuery.toLowerCase());

		return matchesStatus && matchesSearch;
	});

	const handleStatusFilter = (status: StatusFilter) => {
		setStatusFilter(status);
	};

	const handleSaveChecklists = (checklists: any) => {
		console.log('Checklists guardados:', checklists);
	};

	const handleSendEmail = async (work: WorkWithProgress) => {
		if (!work.client_id) {
			console.error('La obra no tiene cliente asignado');
			return;
		}

		try {
			// Get client information
			const { data: client, error } = await getClientById(work.client_id);
			
			if (error || !client) {
				console.error('Error al obtener información del cliente:', error);
				return;
			}

			setSelectedWork(work);
			setSelectedClient(client);
			setIsEmailModalOpen(true);
		} catch (error) {
			console.error('Error al preparar el email:', error);
		}
	};

	const handleSendWhatsApp = async (work: WorkWithProgress) => {
		if (!work.client_id) {
			console.error('La obra no tiene cliente asignado');
			return;
		}

		try {
			// Get client information
			const { data: client, error } = await getClientById(work.client_id);
			
			if (error || !client) {
				console.error('Error al obtener información del cliente:', error);
				return;
			}

			setSelectedWork(work);
			setSelectedClient(client);
			setIsWhatsAppModalOpen(true);
		} catch (error) {
			console.error('Error al preparar el WhatsApp:', error);
		}
	};

	const handleWhatsAppSend = async (whatsappData: any) => {
		try {
			const response = await fetch('/api/send-whatsapp', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(whatsappData),
			});

			const result = await response.json();

			if (!response.ok || !result.success) {
				throw new Error(result.error || 'Error al generar el WhatsApp');
			}

			// Open WhatsApp in a new tab with the generated URL
			if (result.data?.whatsappUrl) {
				window.open(result.data.whatsappUrl, '_blank');
			}

			console.log('WhatsApp generado exitosamente:', result);
		} catch (error) {
			console.error('Error al generar WhatsApp:', error);
			throw error;
		}
	};

	const handleEmailSend = async (emailData: any) => {
		try {
			const response = await fetch('/api/send-email', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(emailData),
			});

			const result = await response.json();

			if (!response.ok || !result.success) {
				throw new Error(result.error || 'Error al enviar el email');
			}

			console.log('Email enviado exitosamente:', result);
		} catch (error) {
			console.error('Error al enviar email:', error);
			throw error;
		}
	};

	// Check if user has permission to send notifications
	const canSendEmail = user?.role === 'Admin' || user?.role === 'Ventas';
	const canSendWhatsApp = user?.role === 'Admin' || user?.role === 'Ventas';

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div>
						<h2 className="text-2xl font-bold text-foreground">Checklists de obras</h2>
						<p className="text-muted-foreground mt-1">Seguimiento de instalaciones y tareas</p>
					</div>
				</div>

				{/* Search Bar */}
				<div className="relative">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Buscar por dirección, nombre o apellido del cliente..."
						className="w-full pl-10"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
			</div>

			{/* Stats */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card
					className={cn(
						'p-6 bg-card border-border cursor-pointer transition-all hover:shadow-md',
						statusFilter === 'todos' ? 'ring-2 ring-primary' : ''
					)}
					onClick={() => handleStatusFilter('todos')}
				>
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">Todas</p>
							<p className="text-2xl font-bold text-foreground mt-2">{installations.length}</p>
						</div>
						<div className="rounded-lg bg-secondary p-3 text-foreground/80">
							<List className="h-6 w-6" />
						</div>
					</div>
				</Card>
				<Card
					className={cn(
						'p-6 bg-card border-border cursor-pointer transition-all hover:shadow-md',
						statusFilter === 'pendiente' ? 'ring-2 ring-chart-3' : ''
					)}
					onClick={() => handleStatusFilter('pendiente')}
				>
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">Pendientes</p>
							<p className="text-2xl font-bold text-foreground mt-2">{pendingCount}</p>
						</div>
						<div className="rounded-lg bg-secondary p-3 text-chart-3">
							<Clock className="h-6 w-6" />
						</div>
					</div>
				</Card>
				<Card
					className={cn(
						'p-6 bg-card border-border cursor-pointer transition-all hover:shadow-md',
						statusFilter === 'en_progreso' ? 'ring-2 ring-chart-1' : ''
					)}
					onClick={() => handleStatusFilter('en_progreso')}
				>
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">En progreso</p>
							<p className="text-2xl font-bold text-foreground mt-2">{inProgressCount}</p>
						</div>
						<div className="rounded-lg bg-secondary p-3 text-chart-1">
							<AlertCircle className="h-6 w-6" />
						</div>
					</div>
				</Card>
				<Card
					className={cn(
						'p-6 bg-card border-border cursor-pointer transition-all hover:shadow-md',
						statusFilter === 'completada' ? 'ring-2 ring-accent' : ''
					)}
					onClick={() => handleStatusFilter('completada')}
				>
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">Completadas</p>
							<p className="text-2xl font-bold text-foreground mt-2">{completedCount}</p>
						</div>
						<div className="rounded-lg bg-secondary p-3 text-accent">
							<CheckCircle2 className="h-6 w-6" />
						</div>
					</div>
				</Card>
			</div>

			{/* Installations list */}
			<div className="space-y-4">
				{filteredInstallations.map((installation) => {
					const progress = getProgress(installation.tasks);
					const statusInfo = statusConfig[installation.status];
					const StatusIcon = statusInfo.icon;

					return (
						<Card key={installation.id} className="bg-card border-border">
							<div className="p-6">
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1 min-w-0 space-y-3">
										<div className="flex items-start gap-3">
											<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
												<ClipboardCheck className="h-5 w-5 text-primary" />
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 flex-wrap">
													<h3 className="text-lg font-semibold text-foreground">
														{installation.id}
													</h3>
													<Badge variant="outline" className={`gap-1 ${statusInfo.color}`}>
														<StatusIcon className="h-3 w-3" />
														{statusInfo.label}
													</Badge>
												</div>
												<p className="text-sm text-foreground mt-1">
													{[installation.client_name, installation.client_last_name]
														.filter(Boolean)
														.join(' ') || 'Cliente no especificado'}
												</p>
											</div>
										</div>

										<div className="grid gap-2 md:grid-cols-3 text-sm">
											<div className="flex items-center text-muted-foreground">
												<AddressLink
													address={installation.address || 'Dirección no especificada'}
													locality={installation.locality}
													className="text-sm"
												/>
											</div>
											<div className="flex items-center gap-2 text-muted-foreground">
												<Calendar className="h-4 w-4 flex-shrink-0" />
												<span>
													{installation.created_at
														? format(new Date(installation.created_at), 'dd-MM-yyyy', {
																locale: es,
															})
														: 'Fecha no especificada'}
												</span>
											</div>
										</div>

										<div className="space-y-2">
											<div className="flex items-center justify-between text-sm">
												<div className="text-sm text-muted-foreground">
													Progreso: {installation.progress}%
												</div>
											</div>
											<Progress value={installation.progress} className="h-2" />
										</div>
									</div>

									<div className="flex flex-col gap-2">
										<ChecklistCompletionModal workId={installation.id}>
											<Button variant="outline" size="sm">
												<CheckCircle2 className="mr-2 h-4 w-4" />
												Ver checklists
											</Button>
										</ChecklistCompletionModal>

										{canSendEmail && (
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleSendEmail(installation)}
												title="Enviar notificación por email"
											>
												<Mail className="mr-2 h-4 w-4" />
												Email
											</Button>
										)}

										{canSendWhatsApp && (
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleSendWhatsApp(installation)}
												title="Enviar notificación por WhatsApp"
												className="border-green-600 text-green-600 hover:bg-green-50"
											>
												<MessageCircle className="mr-2 h-4 w-4" />
												WhatsApp
											</Button>
										)}

										{installation.hasNotes && (
											<Badge
												variant="secondary"
												className="gap-1 justify-center"
												title="Hay notas/recordatorios cargados"
											>
												<StickyNote className="h-3.5 w-3.5" />
												Notas
											</Badge>
										)}
									</div>
								</div>
							</div>
						</Card>
					);
				})}
			</div>

			<EmailNotificationModal
				isOpen={isEmailModalOpen}
				onOpenChange={setIsEmailModalOpen}
				client={selectedClient}
				work={selectedWork}
				onSendEmail={handleEmailSend}
			/>

			<WhatsAppNotificationModal
				isOpen={isWhatsAppModalOpen}
				onOpenChange={setIsWhatsAppModalOpen}
				client={selectedClient}
				work={selectedWork}
				onSendWhatsApp={handleWhatsAppSend}
			/>
		</div>
	);
}
