import { getSupabaseClient } from './supabase-client'

export type LineOption = {
    id?: number
    name_line?: string | null
    opening?:  string | null
    created_at?: string | null
}

export type ColorOption = {
    id?: number
    name_color?: string | null
    created_at?: string | null
    line_name?: string | null
}

export type TypeOption = {
    id?: number
    name_type?: string | null
    created_at?: string | null
    line_name?: string | null
}

export async function listOptions<T>(table: string): Promise<{ data: T[] | null; error: any }> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false })
  return { data, error }
}

export async function createOption<T>(table: string, item: Partial<T>): Promise<{ data: T | null; error: any }> {
    const supabase = getSupabaseClient()
    const now = new Date().toISOString()
    const payload: any = { ...item }
    if (!('created_at' in payload) || payload.created_at == null) {
    payload.created_at = now
    }  // Solo agrega created_at si no existe
    if (!('created_at' in payload) || (payload as any).created_at == null) {
        (payload as any).created_at = now
    }
    const { data, error } = await supabase.from(table).insert(payload).select().single()
    return { data, error }
}

export async function updateOption<T>(table: string, id: number, changes: Partial<T>): Promise<{ data: T | null; error: any }> {
  const supabase = getSupabaseClient()
  const payload = { ...changes }
  const { data, error } = await supabase.from(table).update(payload).eq('id', id).select().single()
  return { data, error }
}

export async function deleteOption(table: string, id: number): Promise<{ data: null; error: any }> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from(table).delete().eq('id', id)
  return { data: null, error }
}