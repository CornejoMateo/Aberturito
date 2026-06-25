import type { ItemDialogState, DeleteItemConfirmState, DeleteRelConfirmState, DueDateDialogState, EventDialogState } from '@/utils/clients/client-survey-tab.types';

export const DEFAULT_SURVEY_STEPS: string[] = [
	'A la espera de relevamiento de premarco',
	'Premarcos relevados',
	'A la espera de relevamiento de aberturas',
	'Aberturas relevadas',
];

export const INITIAL_ITEM_DIALOG: ItemDialogState = {
	open: false,
	mode: 'add',
	surveyId: null,
	item: null,
};

export const INITIAL_DELETE_ITEM: DeleteItemConfirmState = { open: false, itemId: null };
export const INITIAL_DELETE_REL: DeleteRelConfirmState = { open: false, surveyId: null };
export const INITIAL_DUE_DATE: DueDateDialogState = { open: false, surveyId: null, currentDueDate: null };
export const INITIAL_EVENT_DIALOG: EventDialogState = {
	open: false,
	stepLabel: '',
	clientName: '',
	clientLocality: '',
};
