import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface Entry {
  code: string;
  price: number;
}

// Small helper to chunk an array
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

export async function POST(req: Request) {
  try {
    console.log('=== API update-prices called ===');
    const body = await req.json();
    console.log(`Received ${body.entries?.length || 0} entries`);
    const entries: Entry[] = body.entries;

    if (!Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ updated: 0, errors: ['No hay entradas para procesar'] }, { status: 400 });
    }

    // Use service role key if available, otherwise fall back to anon key
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseKey) {
      console.error('No Supabase key available (neither SERVICE_ROLE_KEY nor ANON_KEY)');
      return NextResponse.json({ 
        updated: 0, 
        errors: ['Supabase key no configurada'] 
      }, { status: 500 });
    }

    console.log(`Using key: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE_KEY' : 'ANON_KEY'}`);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey
    );

    const codes = entries.map(e => e.code);
    const now = new Date().toISOString();

    console.log(`Looking up codes in tables...`);

    // First pass: identify which codes exist in which table
    const [{ data: accCodes, error: accErr }, { data: ironCodes, error: ironErr }, {data: supplyCodes, error: supplyErr}] = await Promise.all([
      supabase
        .from('accesories_category')
        .select('accessory_code')
        .in('accessory_code', codes),
      supabase
        .from('ironworks_category')
        .select('ironwork_code')
        .in('ironwork_code', codes),
      supabase
        .from('supplies_category')
        .select('supply_code')
        .in('supply_code', codes),
    ] as any);

    if (accErr) console.error('Error fetching accessories:', accErr);
    if (ironErr) console.error('Error fetching ironworks:', ironErr);
    if (supplyErr) console.error('Error fetching supplies:', supplyErr);

    const accCodeSet = new Set((accCodes || []).map((r: any) => r.accessory_code));
    const ironCodeSet = new Set((ironCodes || []).map((r: any) => r.ironwork_code));
    const supplyCodeSet = new Set((supplyCodes || []).map((r: any) => r.supply_code));

    console.log(`Found ${accCodeSet.size} accessories, ${supplyCodeSet.size} supplies, ${ironCodeSet.size} ironworks to update.`);

    let updated = 0;

    // Separate entries by table
    const accEntries = entries.filter(e => accCodeSet.has(e.code));
    const ironEntries = entries.filter(e => ironCodeSet.has(e.code));
    const supplyEntries = entries.filter(e => supplyCodeSet.has(e.code));

    // Update accessories in parallel groups
    const ACC_CONCURRENCY = 10;
    for (let i = 0; i < accEntries.length; i += ACC_CONCURRENCY) {
      const group = accEntries.slice(i, i + ACC_CONCURRENCY);
      const updatePromises = group.map(async (entry) => {
        const { error } = await supabase
          .from('accesories_category')
          .update({ 
            accessory_price: entry.price, 
            last_update: now 
          })
          .eq('accessory_code', entry.code);

        if (error) {
          console.error(`Error updating accessory ${entry.code}:`, error);
          return 0;
        }
        return 1;
      });

      const results = await Promise.all(updatePromises);
      const count = results.reduce((sum: number, c: number) => sum + c, 0);
      console.log(`Updated ${count} accessories in group`);
      updated += count;
    }

    // Update ironworks in parallel groups
    const IRON_CONCURRENCY = 10;
    for (let i = 0; i < ironEntries.length; i += IRON_CONCURRENCY) {
      const group = ironEntries.slice(i, i + IRON_CONCURRENCY);
      const updatePromises = group.map(async (entry) => {
        const { error } = await supabase
          .from('ironworks_category')
          .update({ 
            ironwork_price: entry.price, 
            last_update: now 
          })
          .eq('ironwork_code', entry.code);

        if (error) {
          console.error(`Error updating ironwork ${entry.code}:`, error);
          return 0;
        }
        return 1;
      });

      const results = await Promise.all(updatePromises);
      const count = results.reduce((sum: number, c: number) => sum + c, 0);
      console.log(`Updated ${count} ironworks in group`);
      updated += count;
    }

    // Update supplies in parallel groups
    const SUPPLY_CONCURRENCY = 10;
    for (let i = 0; i < supplyEntries.length; i += SUPPLY_CONCURRENCY) {
      const group = supplyEntries.slice(i, i + SUPPLY_CONCURRENCY);
      const updatePromises = group.map(async (entry) => {
        const { error } = await supabase
          .from('supplies_category')
          .update({ 
            supply_price: entry.price, 
            last_update: now 
          })
          .eq('supply_code', entry.code);

        if (error) {
          console.error(`Error updating supply ${entry.code}:`, error);
          return 0;
        }
        return 1;
      });

      const results = await Promise.all(updatePromises);
      const count = results.reduce((sum: number, c: number) => sum + c, 0);
      console.log(`Updated ${count} supplies in group`);
      updated += count;
    }

    console.log(`=== Total updated: ${updated} ===`);
    return NextResponse.json({ updated });
  } catch (err: any) {
    console.error('Error en API update-prices:', err);
    return NextResponse.json({ updated: 0, errors: [err.message || 'Error desconocido'] }, { status: 500 });
  }
}
