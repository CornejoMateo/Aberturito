import { getSupabaseClient } from '../supabase-client';

export type Survey = {
	id: string;
	created_at: string;
	budget_id: string;
	client_id: string;
	notes?: string | null;
};

export type SurveyItem = {
	id: string;
	created_at: string;
	survey_id: string;
	label: string;
	completed: boolean;
	order: number;
};

const TABLE = 'surveys';
const ITEMS_TABLE = 'survey_items';

export async function getSurveysByClientId(
	clientId: string
): Promise<{ data: Survey[] | null; error: unknown }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('*')
		.eq('client_id', clientId)
		.order('created_at', { ascending: true });
	return { data, error };
}

export async function createSurvey(
	survey: Omit<Survey, 'id' | 'created_at'>
): Promise<{ data: Survey | null; error: unknown }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.insert(survey)
		.select()
		.single();
	return { data, error };
}

export async function deleteSurvey(
	id: string
): Promise<{ error: unknown }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.delete()
		.eq('id', id)
		.select('id');
	if (error) return { error };
	if (!data?.length) {
		return { error: new Error('Delete did not affect any rows. Check RLS policies on surveys.') };
	}
	return { error: null };
}

export async function getSurveyItemsBySurveyIds(
	surveyIds: string[]
): Promise<{ data: SurveyItem[] | null; error: unknown }> {
	const supabase = getSupabaseClient();
	if (surveyIds.length === 0) return { data: [], error: null };
	const { data, error } = await supabase
		.from(ITEMS_TABLE)
		.select('*')
		.in('survey_id', surveyIds)
		.order('order', { ascending: true });
	return { data, error };
}

export async function getAllSurveys(): Promise<{ data: Survey[] | null; error: unknown }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('*')
		.order('created_at', { ascending: true });
	return { data, error };
}

export async function createSurveyItem(
	item: Omit<SurveyItem, 'id' | 'created_at'>
): Promise<{ data: SurveyItem | null; error: unknown }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(ITEMS_TABLE)
		.insert(item)
		.select()
		.single();
	return { data, error };
}

export async function updateSurveyItem(
	id: string,
	changes: Partial<Pick<SurveyItem, 'label' | 'completed' | 'order'>>
): Promise<{ error: unknown }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(ITEMS_TABLE)
		.update(changes)
		.eq('id', id)
		.select('id');
	if (error) return { error };
	if (!data?.length) {
		return { error: new Error('Update did not affect any rows. Check RLS policies on survey_items.') };
	}
	return { error: null };
}

export async function deleteSurveyItem(
	id: string
): Promise<{ error: unknown }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(ITEMS_TABLE)
		.delete()
		.eq('id', id)
		.select('id');
	if (error) return { error };
	if (!data?.length) {
		return { error: new Error('Delete did not affect any rows. Check RLS policies on survey_items.') };
	}
	return { error: null };
}
