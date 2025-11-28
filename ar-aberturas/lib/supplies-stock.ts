export type SupplyItemStock = {
  id: string;
  supply_category: string;
  supply_line: string | null;
  supply_brand: string | null;
  supply_code: string;
  supply_description?: string | null;
  supply_color: string;
  supply_quantity_for_lump: number;
  supply_quantity_lump: number;
  supply_quantity: number;
  supply_site: string;
  supply_material: string;
  supply_image_url: string | null;
  supply_price: number | null;
  created_at?: string | null;
  last_update?: string | null;
};

const TABLE = 'supplies_category';

import { supabase } from './supabase-client';

export async function listSuppliesStock(): Promise<{ data: SupplyItemStock[] | null; error: any }> {
  const { data, error } = await supabase.from(TABLE).select('*');
  return { data: data as any || null, error };
}

export async function getSupplyById(id: string): Promise<{ data: SupplyItemStock | null; error: any }> {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
  return { data: data as any || null, error };
}

export async function createSupplyStock(item: Partial<SupplyItemStock>): Promise<{ data: SupplyItemStock | null; error: any }> {
  const { data, error } = await supabase.from(TABLE).insert(item).select().single();
  return { data: data as any || null, error };
}

export async function updateSupplyStock(id: string, changes: Partial<SupplyItemStock>): Promise<{ data: SupplyItemStock | null; error: any }> {
  const { data, error } = await supabase.from(TABLE).update(changes).eq('id', id).select().single();
  return { data: data as any || null, error };
}

export async function deleteSupplyStock(id: string): Promise<{ data: null; error: any }> {
  const { data, error } = await supabase.from(TABLE).delete().eq('id', id);
  return { data: null, error };
}

export async function updateImageForMatchingSupplies(
  supply_category: string,
  supply_line: string,
  supply_code: string,
  supply_brand: string,
  supply_image_url: string | null
): Promise<{ data: SupplyItemStock[] | null; error: any }> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ supply_image_url, last_update: new Date().toISOString().split('T')[0] })
    .eq('supply_category', supply_category)
    .eq('supply_line', supply_line)
    .eq('supply_code', supply_code)
    .eq('supply_brand', supply_brand)
    .select();
  return { data: data as any || null, error };
}
