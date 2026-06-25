import { getSupabaseClient } from '../supabase-client';

export type ProfileItemStock = {
	id: number;
	code: string;
	line: string;
	color: string;
	status: string;
	quantity: number;
	site: string;
	width: number;
	material: string;
	image_id?: number | null;
	created_at: string | null;
	last_update: string | null;
	separated_for_work_id?: number | null;
	separated_for_work?: {
		id: string;
		address?: string | null;
		locality?: string | null;
		clients?: {
			name: string;
			last_name: string;
		} | null;
	} | null;
};

const TABLE = 'profiles';

export async function listStock(): Promise<{ data: ProfileItemStock[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select(`
			*,
			separated_for_work:separated_for_work_id(id, address, locality, clients:client_id(name, last_name))
		`)
		.order('created_at', { ascending: false });
	return { data, error };
}

export async function getProfileById(
	id: number
): Promise<{ data: ProfileItemStock | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
	return { data, error };
}

export async function createProfileStock(
	item: Partial<ProfileItemStock>
): Promise<{ data: ProfileItemStock | null; error: any }> {
	const requiredFields = ['code', 'material', 'line', 'color', 'status', 'site', 'width'];
	for (const field of requiredFields) {
		if (
			item[field as keyof ProfileItemStock] === undefined ||
			item[field as keyof ProfileItemStock] === null
		) {
			return { data: null, error: new Error(`Falta el campo obligatorio: ${field}`) };
		}
	}

	const supabase = getSupabaseClient();
	const { data: galleryProfile, error: galleryProfileError } = await supabase
		.from('gallery_profiles')
		.select('id')
		.eq('material_type', item.material)
		.eq('line', item.line)
		.eq('code', item.code)
		.maybeSingle();

	if (galleryProfileError) {
		return { data: null, error: galleryProfileError };
	}

	const payload = {
		...item,
		image_id: galleryProfile?.id ?? null,
		last_update: new Date().toISOString().split('T')[0],
	};

	const { data, error } = await supabase.from(TABLE).insert(payload).select().single();

	return { data, error };
}

export async function updateProfileStock(
	id: number,
	changes: Partial<ProfileItemStock>
): Promise<{ data: ProfileItemStock | null; error: any }> {
	if (!id) {
		return {
			data: null,
			error: new Error('El accesorio no pudo ser actualizado.'),
		};
	}
	const supabase = getSupabaseClient();

	const needsImageCheck =
		changes.material !== undefined || changes.line !== undefined || changes.code !== undefined;

	if (needsImageCheck) {
		const { data: currentProfile, error: currentProfileError } = await supabase
			.from(TABLE)
			.select('material, line, code')
			.eq('id', id)
			.single();

		if (currentProfileError) {
			return { data: null, error: currentProfileError };
		}

		const nextMaterial = changes.material ?? currentProfile.material;
		const nextLine = changes.line ?? currentProfile.line;
		const nextCode = changes.code ?? currentProfile.code;

		const changedMaterial = nextMaterial !== currentProfile.material;
		const changedLine = nextLine !== currentProfile.line;
		const changedCode = nextCode !== currentProfile.code;

		if (changedMaterial || changedLine || changedCode) {
			const { data: galleryProfile, error: galleryProfileError } = await supabase
				.from('gallery_profiles')
				.select('id')
				.eq('material_type', nextMaterial)
				.eq('line', nextLine)
				.eq('code', nextCode)
				.maybeSingle();

			if (galleryProfileError) {
				return { data: null, error: galleryProfileError };
			}

			changes.image_id = galleryProfile?.id ?? null;
		}
	}

	const payload = { ...changes, last_update: new Date().toISOString().split('T')[0] };
	const { data, error } = await supabase.from(TABLE).update(payload).eq('id', id).select().single();

	return { data, error };
}

export async function deleteProfileStock(id: number): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data: null, error };
}

export async function updateProfileQuantity(
	id: number,
	newQuantity: number
): Promise<{ data: ProfileItemStock | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.update({ quantity: newQuantity, last_update: new Date().toISOString().split('T')[0] })
		.eq('id', id)
		.select()
		.single();
	return { data, error };
}

export async function separateProfile(
	id: number,
	workId: number
): Promise<{ data: ProfileItemStock | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.update({
			separated_for_work_id: workId,
			last_update: new Date().toISOString().split('T')[0],
		})
		.eq('id', id)
		.select(`
			*,
			separated_for_work:separated_for_work_id(id, address, locality, clients:client_id(name, last_name))
		`)
		.single();
	return { data, error };
}

export async function unseparateProfile(
	id: number
): Promise<{ data: ProfileItemStock | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.update({
			separated_for_work_id: null,
			last_update: new Date().toISOString().split('T')[0],
		})
		.eq('id', id)
		.select(`
			*,
			separated_for_work:separated_for_work_id(id, address, locality, clients:client_id(name, last_name))
		`)
		.single();
	return { data, error };
}
