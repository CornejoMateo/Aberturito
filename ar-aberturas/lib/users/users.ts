import { getSupabaseClient } from '../supabase-client';
import bcrypt from 'bcryptjs';

export type User = {
    username: string;
    role: string;
    password?: string;
}

export async function getUser(username: string, password: string): Promise<{ data: User | null; error: any }> {

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('users').select('*').eq('username', username).single();
    if (error) {
        return { data: null, error };
    }

    const valid = await bcrypt.compare(password, data.password);
    if (!valid) {
        return { data: null, error: 'Contraseña incorrecta' };
    } else {
        data.password = undefined; // Remove password before returning
        return { data, error: null };
    }
}