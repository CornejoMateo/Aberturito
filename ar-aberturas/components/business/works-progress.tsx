'use client';

import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ChecklistModal } from '@/utils/checklists/checklist-modal';
import { createChecklist, getChecklistsByWorkId } from '@/lib/works/checklists';
import { type StatusFilter } from '@/constants/type-config';
import { EmailNotificationModal } from '@/components/ui/email-notification-modal';
import { WhatsAppNotificationModal } from '@/components/ui/whatsapp-notification-modal';
import { useAuth } from '@/components/provider/auth-provider';
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
	PaginationEllipsis,
} from '@/components/ui/pagination';
import { useWorksWithProgress } from '@/hooks/clients/use-works-with-progress';
import { paginateAndFilter } from '@/helpers/clients/pagination';
import { useNotifications } from '@/hooks/clients/use-notifications';
import { StatsCardsWorks } from '@/utils/works/stats-cards-works';
import { useChecklistModal } from '@/hooks/clients/use-checklist-modal';
import { WorkCard } from '@/utils/works/work-card';

export function WorksOpenings() {
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;

	const { user } = useAuth();
	const { works, loading, reload } = useWorksWithProgress();

	const { filteredData, paginatedData, totalPages } = paginateAndFilter(
		works,
		searchQuery,
		currentPage,
		itemsPerPage,
		(item, search) => {
			const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

			const matchesSearch =
				!search ||
				item.address?.toLowerCase().includes(search) ||
				item.client_name?.toLowerCase().includes(search) ||
				item.client_last_name?.toLowerCase().includes(search) ||
				false;

			return matchesStatus && matchesSearch;
		}
	);

	const stats = useMemo(() => {
		return {
			pendingCount: works.filter((w) => w.status === 'pending').length,
			inProgressCount: works.filter((w) => w.status === 'in_progress').length,
			completedCount: works.filter((w) => w.status === 'completed').length,
			totalCount: works.length,
		};
	}, [works]);

	// Reset to page 1 when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [searchQuery, statusFilter]);

	const handleStatusFilter = (status: StatusFilter) => {
		setStatusFilter(status);
	};

	const {
		activeModal,
		selectedWork,
		selectedClient,
		openEmail,
		openWhatsApp,
		sendEmail,
		sendWhatsApp,
		closeModal,
		loading: notificationLoading,
	} = useNotifications();

	const {
		isOpen: checklistOpen,
		selectedWork: checklistWork,
		openChecklist,
		closeChecklist,
	} = useChecklistModal();

	const handleSaveChecklist = async (checklist: any) => {
		const { data: existingChecklists } = await getChecklistsByWorkId(checklistWork?.id || '');
		const existingCount = existingChecklists?.length || 0;

		const { error } = await createChecklist({
			work_id: checklistWork?.id || '',
			name: checklist.name || `Abertura ${existingCount + 1}`,
			description: checklist.description || '',
			width: checklist.width || null,
			height: checklist.height || null,
			type_opening: checklist.type_opening,
			notes: '',
			items: checklist.items.map((item: any) => ({
				name: item.name,
				done: item.completed,
				key: 0,
			})),
			progress: checklist.items.length > 0 ? 0 : 100,
		});

		if (error) throw error;

		reload();
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

			<StatsCardsWorks
				stats={stats}
				statusFilter={statusFilter}
				onStatusFilterChange={handleStatusFilter}
			/>

			{/* Installations list */}
			<div className="space-y-4">
				{paginatedData.map((installation) => {
					return (
						<WorkCard
							key={installation.id}
							work={installation}
							user={user}
							onOpenEmail={openEmail}
							onOpenWhatsApp={openWhatsApp}
							onOpenChecklist={openChecklist}
						/>
					);
				})}
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="mt-8">
					<Pagination>
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious
									href="#"
									onClick={(e) => {
										e.preventDefault();
										if (currentPage > 1) setCurrentPage(currentPage - 1);
									}}
									className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
								/>
							</PaginationItem>

							{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
								// Show first page, last page, current page, and pages around current
								if (
									page === 1 ||
									page === totalPages ||
									page === currentPage ||
									page === currentPage - 1 ||
									page === currentPage + 1
								) {
									return (
										<PaginationItem key={page}>
											<PaginationLink
												href="#"
												isActive={page === currentPage}
												onClick={(e) => {
													e.preventDefault();
													setCurrentPage(page);
												}}
											>
												{page}
											</PaginationLink>
										</PaginationItem>
									);
								}

								// Show ellipsis for gaps
								if (page === currentPage - 2 || page === currentPage + 2) {
									return (
										<PaginationItem key={`ellipsis-${page}`}>
											<PaginationEllipsis />
										</PaginationItem>
									);
								}

								return null;
							})}

							<PaginationItem>
								<PaginationNext
									href="#"
									onClick={(e) => {
										e.preventDefault();
										if (currentPage < totalPages) setCurrentPage(currentPage + 1);
									}}
									className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</div>
			)}

			<EmailNotificationModal
				isOpen={activeModal === 'email'}
				onOpenChange={closeModal}
				client={selectedClient}
				work={selectedWork}
				onSendEmail={sendEmail}
			/>

			<WhatsAppNotificationModal
				isOpen={activeModal === 'whatsapp'}
				onOpenChange={closeModal}
				client={selectedClient}
				work={selectedWork}
				onSendWhatsApp={sendWhatsApp}
			/>

			{checklistWork && (
				<ChecklistModal
					workId={checklistWork.id}
					open={checklistOpen}
					onOpenChange={closeChecklist}
					onSave={handleSaveChecklist}
				/>
			)}

		</div>
	);
}
