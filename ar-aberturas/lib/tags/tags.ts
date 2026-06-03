import { getSupabaseClient } from '../supabase-client';

export type SurveyTag = {
	id: string;
	created_at: string;
	name: string;
	color: string;
};

export type SurveyTagAssignment = {
	id: string;
	created_at: string;
	survey_id: string;
	tag_id: string;
	tag?: SurveyTag;
};

const TAGS_TABLE = 'survey_tags';
const ASSIGNMENTS_TABLE = 'survey_tag_assignments';

// Tag CRUD operations
export async function getAllTags(): Promise<{ data: SurveyTag[] | null; error: unknown }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TAGS_TABLE)
		.select('*')
		.order('created_at', { ascending: true });
	return { data, error };
}

export async function createTag(
	tag: Omit<SurveyTag, 'id' | 'created_at'>
): Promise<{ data: SurveyTag | null; error: unknown }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TAGS_TABLE)
		.insert(tag)
		.select()
		.single();
	return { data, error };
}

export async function updateTag(
	id: string,
	changes: Partial<Pick<SurveyTag, 'name' | 'color'>>
): Promise<{ error: unknown }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TAGS_TABLE)
		.update(changes)
		.eq('id', id)
		.select('id');
	if (error) return { error };
	if (!data?.length) {
		return { error: new Error('Update did not affect any rows. Check RLS policies on survey_tags.') };
	}
	return { error: null };
}

export async function deleteTag(id: string): Promise<{ error: unknown }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TAGS_TABLE)
		.delete()
		.eq('id', id)
		.select('id');
	if (error) return { error };
	if (!data?.length) {
		return { error: new Error('Delete did not affect any rows. Check RLS policies on survey_tags.') };
	}
	return { error: null };
}

// Survey-tag association operations
export async function getTagsForSurvey(
	surveyId: string
): Promise<{ data: SurveyTag[] | null; error: unknown }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(ASSIGNMENTS_TABLE)
		.select('survey_tags(*)')
		.eq('survey_id', surveyId);
	
	if (error) return { data: null, error };
	
	const tags = data?.map((assignment: any) => assignment.survey_tags).filter(Boolean) ?? [];
	return { data: tags, error: null };
}

export async function assignTagToSurvey(
	surveyId: string,
	tagId: string
): Promise<{ error: unknown }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(ASSIGNMENTS_TABLE)
		.insert({ survey_id: surveyId, tag_id: tagId })
		.select('id');
	if (error) return { error };
	if (!data?.length) {
		return { error: new Error('Insert did not affect any rows. Check RLS policies on survey_tag_assignments.') };
	}
	return { error: null };
}

export async function removeTagFromSurvey(
	surveyId: string,
	tagId: string
): Promise<{ error: unknown }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(ASSIGNMENTS_TABLE)
		.delete()
		.eq('survey_id', surveyId)
		.eq('tag_id', tagId)
		.select('id');
	if (error) return { error };
	if (!data?.length) {
		return { error: new Error('Delete did not affect any rows. Check RLS policies on survey_tag_assignments.') };
	}
	return { error: null };
}

export async function getSurveysWithTag(tagId: string): Promise<{ data: string[] | null; error: unknown }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(ASSIGNMENTS_TABLE)
		.select('survey_id')
		.eq('tag_id', tagId);
	
	if (error) return { data: null, error };
	
	const surveyIds = data?.map((assignment: any) => assignment.survey_id) ?? [];
	return { data: surveyIds, error: null };
}
