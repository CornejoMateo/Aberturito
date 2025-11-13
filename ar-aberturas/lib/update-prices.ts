import { getSupabaseClient } from '@/lib/supabase-client';

interface PriceUpdateResult {
  updated: number;
  errors: string[];
}

export async function updatePrices(file: File): Promise<PriceUpdateResult> {
  const supabase = getSupabaseClient();
  const result: PriceUpdateResult = {
    updated: 0,
    errors: []
  };

  try {
    // Leer el archivo
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    // Procesar cada línea
    for (const line of lines) {
      const [code, price] = line.split('\t');
      
      if (!code || !price) {
        result.errors.push(`Formato inválido en línea: ${line}`);
        continue;
      }

      try {
        // Buscar en accesorios
        const { data: accessoryData, error: accessoryError } = await supabase
          .from('accesories_category')
          .update({ accessory_price: parseFloat(price) })
          .eq('accessory_code', code.trim())
          .select();

        if (accessoryError) throw accessoryError;
        
        // Si no se actualizó en accesorios, buscar en herrajes
        if (!accessoryData?.length) {
          const { data: ironworkData, error: ironworkError } = await supabase
            .from('ironworks_category')
            .update({ ironwork_price: parseFloat(price) })
            .eq('ironwork_code', code.trim())
            .select();

          if (ironworkError) throw ironworkError;
          if (ironworkData?.length) result.updated += ironworkData.length;
        } else {
          result.updated += accessoryData.length;
        }
      } catch (error) {
        console.error(`Error updating price for code ${code}:`, error);
        result.errors.push(`Error al actualizar código ${code}`);
      }
    }

    return result;
  } catch (error) {
    console.error('Error processing file:', error);
    throw new Error('Error al procesar el archivo');
  }
}
