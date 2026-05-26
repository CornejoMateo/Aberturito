import { getSupabaseClient } from '../supabase-client';

export type AccessoryItemStock = {
	id: number;
	created_at: string;
	accessory_category: string;
	accessory_line: string | null;
	accessory_brand: string | null;
	accessory_code: string;
	accessory_description?: string | null;
	accessory_color: string;
	accessory_quantity_for_lump: number;
	accessory_quantity_lump: number;
	accessory_quantity: number;
	accessory_site: string;
	accessory_material: string;
	image_id?: number | null;
	accessory_price: number | null;
	last_update: string | null;
};

const TABLE = 'accesories_category';

export async function listAccesoriesStock(): Promise<{
	data: AccessoryItemStock[] | null;
	error: any;
}> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select(
			`
			id,
			created_at,
			accessory_category,
			accessory_line,
			accessory_brand,
			accessory_code,
			accessory_description,
			accessory_color,
			accessory_quantity_for_lump,
			accessory_quantity_lump,
			accessory_quantity,
			accessory_site,
			accessory_material,
			accessory_price,
			image_id,
			last_update
		`
		)
		.order('created_at', { ascending: false });
	return { data, error };
}

export async function getAccesoryById(
	id: number
): Promise<{ data: AccessoryItemStock | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
	return { data, error };
}

export async function createAccessoryStock(
	item: Partial<AccessoryItemStock>
): Promise<{ data: AccessoryItemStock | null; error: any }> {
	// Validación de campos obligatorios
	const requiredFields = [
		'accessory_category',
		'accessory_code',
		'accessory_color',
		'accessory_material',
		'accessory_site',
	];
	for (const field of requiredFields) {
		if (!(item as any)[field]) {
			return {
				data: null,
				error: new Error(`Falta el campo obligatorio: ${field}`),
			};
		}
	}

	const supabase = getSupabaseClient();

	const { data: galleryStock, error: galleryStockError } = await supabase
		.from('gallery_stock')
		.select('id')
		.eq('category', 'Accesorios')
		.eq('code', item.accessory_code)
		.maybeSingle();

	if (galleryStockError) {
		return { data: null, error: galleryStockError };
	}

	const payload = {
		...item,
		image_id: galleryStock?.id ?? null,
		last_update: new Date().toISOString().split('T')[0],
	};

	const { data, error } = await supabase.from(TABLE).insert(payload).select().single();

	return { data, error };
}

export async function updateAccessoryStock(
	id: number,
	changes: Partial<AccessoryItemStock>
): Promise<{ data: AccessoryItemStock | null; error: any }> {
	if (!id) {
		return {
			data: null,
			error: new Error('El accesorio no pudo ser actualizado.'),
		};
	}
	const supabase = getSupabaseClient();

	const needsImageCheck = changes.accessory_code !== undefined;

	if (needsImageCheck) {
		const { data: currentAccessory, error: currentAccessoryError } = await supabase
			.from(TABLE)
			.select('accessory_code')
			.eq('id', id)
			.single();

		if (currentAccessoryError) {
			return { data: null, error: currentAccessoryError };
		}

		const nextCode = changes.accessory_code ?? currentAccessory.accessory_code;
		const changedCode = nextCode !== currentAccessory.accessory_code;

		if (changedCode) {
			const { data: galleryStock, error: galleryStockError } = await supabase
				.from('gallery_stock')
				.select('id')
				.eq('category', 'Accesorios')
				.eq('code', nextCode)
				.maybeSingle();

			if (galleryStockError) {
				return { data: null, error: galleryStockError };
			}

			changes.image_id = galleryStock?.id ?? null;
		}
	}

	const payload = { ...changes, last_update: new Date().toISOString().split('T')[0] };
	const { data, error } = await supabase.from(TABLE).update(payload).eq('id', id).select().single();

	return { data, error };
}

export async function deleteAccesoryStock(id: number): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data: null, error };
}

export async function updateAccessoryQuantity(
	id: number,
	newQuantity: number
): Promise<{ data: AccessoryItemStock | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.update({
			accessory_quantity: newQuantity,
			last_update: new Date().toISOString().split('T')[0],
		})
		.eq('id', id)
		.select()
		.single();
	return { data, error };
}
