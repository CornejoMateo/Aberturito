import { useState } from 'react';
import { Work } from '@/lib/works/works';
import { getItemsForChecklistType, ChecklistType } from '@/lib/works/checklists.constants';
import { Checklist } from '@/lib/works/checklists';

export function useChecklistModal() {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedWork, setSelectedWork] = useState<Work | null>(null);

	const openChecklist = (work: Work) => {
		setSelectedWork(work);
		setIsOpen(true);
	};

	const closeChecklist = () => {
		setIsOpen(false);
		setSelectedWork(null);
	};

	const [checklist, setChecklist] = useState<{
		name: string | null;
		description: string | null;
		width: number | null;
		height: number | null;
		type_opening: ChecklistType | null;
		items: { name: string; completed: boolean }[];
	}>({
		name: null,
		description: null,
		width: null,
		height: null,
		type_opening: null,
		items: [],
	});

	const initializeChecklist = (checklistToEdit: Checklist) => {
		setChecklist({
			name: checklistToEdit.name || null,
			description: checklistToEdit.description || null,
			width: checklistToEdit.width || null,
			height: checklistToEdit.height || null,
			type_opening: (checklistToEdit.type_opening as ChecklistType) || null,
			items: (checklistToEdit.items || []).map((item) => ({
				name: item.name,
				completed: item.done || false,
			})),
		});
	};

	const resetForm = () => {
		setChecklist({
			name: null,
			description: null,
			width: null,
			height: null,
			type_opening: null,
			items: [],
		});
	};

	const updateField = (field: string, value: any) => {
		setChecklist((prev) => ({
			...prev,
			[field]: value === '' ? null : value,
		}));

		if (field === 'type_opening') {
			const defaultItems = getItemsForChecklistType(value) || [];

			setChecklist((prev) => ({
				...prev,
				type_opening: value,
				items: defaultItems.map((name) => ({
					name,
					completed: false,
				})),
			}));
		}
	};

	const addItem = (name: string) => {
		if (!name.trim()) return;

		setChecklist((prev) => ({
			...prev,
			items: [...prev.items, { name: name.trim(), completed: false }],
		}));
	};

	const removeItem = (index: number) => {
		setChecklist((prev) => ({
			...prev,
			items: prev.items.filter((_, i) => i !== index),
		}));
	};

	return {
		isOpen,
		selectedWork,
		openChecklist,
		closeChecklist,
		checklist,
		updateField,
		addItem,
		removeItem,
		resetForm,
		initializeChecklist,
	};
}
