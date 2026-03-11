import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AddressLink } from '@/components/ui/address-link';
import { ChecklistCompletionModal } from '@/utils/checklists/checklist-completion-modal';
import {
	CheckCircle2,
	ClipboardCheck,
	Calendar,
	List,
	Mail,
	Clock,
	MessageCircle,
	StickyNote,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { statusConfig } from '@/constants/type-config';
import { WorkWithProgress } from '@/lib/works/works';

interface WorkCardProps {
	work: WorkWithProgress;
	user: any;
	onOpenEmail: (work: WorkWithProgress) => void;
	onOpenWhatsApp: (work: WorkWithProgress) => void;
	onOpenChecklist: (work: WorkWithProgress) => void;
}

export function WorkCard({ work, user, onOpenEmail, onOpenWhatsApp,  onOpenChecklist}: WorkCardProps) {
	const statusInfo = statusConfig.find((s) => s.value === work.status);

	const StatusIcon = statusInfo?.icon || Clock;
	const statusLabel = statusInfo?.label || 'Pendiente';
	const statusColor = statusInfo?.color || 'text-gray-400 bg-gray-400/10';

	const canSendNotifications = user?.role === 'Admin' || user?.role === 'Ventas';

	return (
		<Card key={work.id} className="bg-card border-border">
			<div className="p-6">
				<div className="flex items-start justify-between gap-4">
					<div className="flex-1 min-w-0 space-y-3">
						<div className="flex items-start gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
								<ClipboardCheck className="h-5 w-5 text-primary" />
							</div>
							<h3 className="text-lg font-semibold text-foreground">{work.id}</h3>
						</div>

						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2 flex-wrap">
								<Badge variant="outline" className={`gap-1 ${statusColor}`}>
									<StatusIcon className="h-3 w-3" />
									{statusLabel}
								</Badge>
							</div>
							<p className="text-sm text-foreground mt-1">
								{[work.client_last_name, work.client_name].filter(Boolean).join(' ') ||
									'Cliente no especificado'}
							</p>
						</div>

						<div className="grid gap-2 md:grid-cols-3 text-sm">
							<div className="flex items-center text-muted-foreground">
								<AddressLink
									address={work.address || 'Dirección no especificada'}
									locality={work.locality}
									className="text-sm"
								/>
							</div>
							<div className="flex items-center gap-2 text-muted-foreground">
								<Calendar className="h-4 w-4 flex-shrink-0" />
								<span>
									{work.created_at
										? format(new Date(work.created_at), 'dd-MM-yyyy', {
												locale: es,
											})
										: 'Fecha no especificada'}
								</span>
							</div>
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between text-sm">
								<div className="text-sm text-muted-foreground">Progreso: {work.progress}%</div>
							</div>
							<Progress value={work.progress} className="h-2" />
						</div>
					</div>

					<div className="flex flex-col gap-2">
						<ChecklistCompletionModal workId={work.id}>
							<Button variant="outline" size="sm">
								<CheckCircle2 className="mr-2 h-4 w-4" />
								Ver checklists
							</Button>
						</ChecklistCompletionModal>

						{(user?.role === 'Admin' || user?.role === 'Ventas') && (
							<Button variant="outline" size="sm" onClick={() => {onOpenChecklist(work)}}>
								<List className="mr-2 h-4 w-4" />
								Agregar checklists
							</Button>
						)}

						{canSendNotifications && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onOpenEmail(work)}
                                    title="Enviar notificación por email"
                                >
                                    <Mail className="mr-2 h-4 w-4" />
                                    Email
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onOpenWhatsApp(work)}
                                    title="Enviar notificación por WhatsApp"
                                    className="border-green-600 text-green-600 hover:bg-green-50"
                                >
                                    <MessageCircle className="mr-2 h-4 w-4" />
                                    WhatsApp
                                </Button>
                            </>
						)}

						{work.hasNotes && (
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
}
