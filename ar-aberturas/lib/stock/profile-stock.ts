import { getSupabaseClient } from '../supabase-client';

export type ProfileItemStock = {
	id: string;
	category: string;
	code: string;
	line: string;
	color: string;
	status: string;
	quantity: number;
	site: string;
	width: number;
	material: string;
	image_url?: string | null;
	image_path?: string | null;
	created_at: string | null;
	last_update: string | null;
};

const TABLE = 'profiles';

export async function listStock(): Promise<{ data: ProfileItemStock[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select(
			`
			id,
			category,
			code,
			line,
			color,
			status,
			quantity,
			site,
			width,
			material,
			created_at,
			last_update
		`
		)
		.order('created_at', { ascending: false });
	return { data, error };
}

export async function getProfileById(
	id: string
): Promise<{ data: ProfileItemStock | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
	return { data, error };
}

export async function createProfileStock(
	item: Partial<ProfileItemStock>
): Promise<{ data: ProfileItemStock | null; error: any }> {
	const requiredFields = [
		'code',
		'material',
		'category',
		'line',
		'color',
		'status',
		'site',
		'width',
	];
	for (const field of requiredFields) {
		if (
			item[field as keyof ProfileItemStock] === undefined ||
			item[field as keyof ProfileItemStock] === null
		) {
			return { data: null, error: new Error(`Falta el campo obligatorio: ${field}`) };
		}
	}

	const supabase = getSupabaseClient();

	const { data: existing, error: searchError } = await supabase
		.from(TABLE)
		.select('image_url, image_path')
		.eq('line', item.line)
		.eq('code', item.code)
		.not('image_url', 'is', null)
		.limit(1);

	let image_url = null;
	let image_path = null;
	if (existing && existing.length > 0) {
		image_url = existing[0].image_url;
		image_path = existing[0].image_path;
	}

	const payload = {
		...item,
		image_url,
		image_path,
		last_update: new Date().toISOString().split('T')[0],
	};

	const { data, error } = await supabase.from(TABLE).insert(payload).select().single();

	return { data, error };
}

export async function updateProfileStock(
	id: string,
	changes: Partial<ProfileItemStock>
): Promise<{ data: ProfileItemStock | null; error: any }> {
	if (!id) {
		return {
			data: null,
			error: new Error('El accesorio no pudo ser actualizado.'),
		};
	}
	const supabase = getSupabaseClient();

	// if the accessory_code is being changed, check for existing image
	if (changes.code || changes.line) {
		const { data: existing, error: searchError } = await supabase
			.from(TABLE)
			.select('image_url, image_path')
			.eq('line', changes.line)
			.eq('code', changes.code)
			.not('image_url', 'is', null)
			.limit(1);

		if (existing && existing.length > 0) {
			changes.image_url = existing[0].image_url;
			changes.image_path = existing[0].image_path;
		} else {
			changes.image_url = null;
			changes.image_path = null;
		}
	}

	const payload = { ...changes, last_update: new Date().toISOString().split('T')[0] };
	const { data, error } = await supabase.from(TABLE).update(payload).eq('id', id).select().single();

	return { data, error };
}

export async function deleteProfileStock(id: string): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data: null, error };
}
