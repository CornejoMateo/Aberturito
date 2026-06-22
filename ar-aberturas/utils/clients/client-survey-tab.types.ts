import { SurveyItem } from '@/lib/survey/survey';

export type ItemDialogState = {
	open: boolean;
	mode: 'add' | 'edit';
	surveyId: number | null;
	item: SurveyItem | null;
};

export type DeleteItemConfirmState = {
	open: boolean;
	itemId: number | null;
};

export type DeleteRelConfirmState = {
	open: boolean;
	surveyId: number | null;
};

export type DueDateDialogState = {
	open: boolean;
	surveyId: number | null;
	currentDueDate: Date | null;
};

export type EventDialogState = {
	open: boolean;
	stepLabel: string;
	clientName: string;
	clientLocality: string;
};
