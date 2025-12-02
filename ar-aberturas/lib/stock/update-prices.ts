import { getSupabaseClient } from '@/lib/supabase-client';

interface PriceUpdateResult {
	updated: number;
	errors: string[];
}

type ProgressCallback = (current: number, total: number) => void;

// Small helper to chunk an array
function chunkArray<T>(arr: T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
	return chunks;
}

// Function to update prices from a file (optimized: batching + upsert)
export async function updatePrices(
	file: File,
	progressCallback?: ProgressCallback
): Promise<PriceUpdateResult> {
	const supabase = getSupabaseClient();
	const result: PriceUpdateResult = { updated: 0, errors: [] };

	try {
		const text = await file.text();
		const rawLines = text.split('\n');

		// Parse and normalize lines into a map (last occurrence wins)
		const entriesMap = new Map<string, number>();
		const totalLines = rawLines.filter((l) => l.trim() !== '').length;

		for (const line of rawLines) {
			if (!line || !line.trim()) continue;
			const [codeRaw, priceRaw] = line.split('\t');
			if (!codeRaw || !priceRaw) {
				result.errors.push(`Formato inválido en línea: ${line}`);
				continue;
			}
			const code = codeRaw.trim();
			const price = parseFloat(priceRaw.replace(',', '.'));
			if (Number.isNaN(price)) {
				result.errors.push(`Precio inválido en línea: ${line}`);
				continue;
			}
			entriesMap.set(code, price);
		}

		const codes = Array.from(entriesMap.keys());
		// If nothing to do
		if (!codes.length) {
			if (progressCallback) progressCallback(0, totalLines);
			return result;
		}

		// Choose a batch size that balances payload and DB work.
		const BATCH_SIZE = 500; // tuned value — can be adjusted
		const codeChunks = chunkArray(codes, BATCH_SIZE);
		let processed = 0;

		for (const chunk of codeChunks) {
			// Query which codes exist in each table in a single request per table
			const [{ data: accData, error: accErr }, { data: ironData, error: ironErr }, {data: supplyData, error, supplyErr}] =
				await Promise.all([
					supabase.from('accesories_category').select('accessory_code').in('accessory_code', chunk),
					supabase.from('ironworks_category').select('ironwork_code').in('ironwork_code', chunk),
					supabase.from('supplies_category').select('supply_code').in('supply_code', chunk),
				] as any);

			if (accErr) {
				console.error('Error fetching accessories chunk:', accErr);
				result.errors.push('Error al leer accesorios (chunk)');
				// continue to attempt ironworks
			}
			if (ironErr) {
				console.error('Error fetching ironworks chunk:', ironErr);
				result.errors.push('Error al leer herrajes (chunk)');
			}

			if (supplyErr) {
				console.error('Error fetching supplies chunk:', supplyErr);
				result.errors.push('Error al leer insumos (chunk)');
			}

			const accCodes: string[] = (accData || []).map((r: any) => r.accessory_code);
			const ironCodes: string[] = (ironData || []).map((r: any) => r.ironwork_code);
			const supplyCodes: string[] = (supplyData || []).map((r: any) => r.supply_code);

			// Prepare upsert payloads (only for existing codes in that table)
			const accPayload = accCodes.map((code) => ({
				accessory_code: code,
				accessory_price: entriesMap.get(code) as number,
			}));

			const ironPayload = ironCodes.map((code) => ({
				ironwork_code: code,
				ironwork_price: entriesMap.get(code) as number,
			}));

			const supplyPayload = supplyCodes.map((code) => ({
				supply_code: code,
				supply_price: entriesMap.get(code) as number,
			}));

			// Run upserts sequentially to avoid type issues
			try {
				if (accPayload.length) {
					const { error } = await supabase.from('accesories_category').upsert(accPayload);
					if (error) throw error;
					result.updated += accPayload.length;
				}
				if (ironPayload.length) {
					const { error } = await supabase.from('ironworks_category').upsert(ironPayload);
					if (error) throw error;
					result.updated += ironPayload.length;
				}
				if (supplyPayload.length) {
					const { error } = await supabase.from('supplies_category').upsert(supplyPayload);
					if (error) throw error;
					result.updated += supplyPayload.length;
				}
			} catch (err) {
				console.error('Error during upsert chunk:', err);
				result.errors.push('Error al actualizar precios (chunk)');
			}

			processed += chunk.length;
			if (progressCallback) progressCallback(processed, totalLines);
		}

		return result;
	} catch (error) {
		console.error('Error processing file:', error);
		throw new Error('Error al procesar el archivo');
	}
}
