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
import { getChecklistsByWorkId } from '@/lib/works/checklists';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AddressLink } from '@/components/ui/address-link';
import type { Work } from '@/lib/works/works';
import type { ChecklistItem } from '@/lib/works/checklists';
import { statusConfig } from '@/constants/status-config';
import type { StatusFilter } from '@/constants/status-config';

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
				const worksWithChecklists = await Promise.all(
					works.map(async (work) => {
						const { data: checklists } = await getChecklistsByWorkId(work.id);

						let progress = 0;
						let tasks: ChecklistItem[] = [];
						let hasNotes = false;

						if (checklists && checklists.length > 0) {
							tasks = checklists.flatMap((checklist) => checklist.items || []);
							hasNotes = checklists.some((checklist) => (checklist.notes || '').trim().length > 0);

							const totalTasks = tasks.length;
							const completedTasks = tasks.filter((task) => task.done).length;
							progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
						}

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
					})
				);

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
		console.log('Checklists guardadas:', checklists);
	};

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
												<span className="text-muted-foreground">Progreso</span>
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
		</div>
	);
}
