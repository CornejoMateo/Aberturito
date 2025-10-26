import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
	if (supabase) return supabase;

	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!url || !anonKey) {
		throw new Error(
			'Missing Supabase environment variables NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
		);
	}

	supabase = createClient(url, anonKey, {
		// Add any global options here
		auth: { persistSession: false },
		global: { headers: { 'x-client-platform': 'web' } },
	});

	return supabase;
}

export { getSupabaseClient };
