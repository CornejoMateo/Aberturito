import type { SurveyItem } from '@/lib/survey/survey';

export const getSurveyProgress = (items: SurveyItem[], surveyId: number) => {
	const surveyItems = items.filter((i) => i.survey_id === surveyId);
	return { done: surveyItems.filter((i) => i.completed).length, total: surveyItems.length };
};
