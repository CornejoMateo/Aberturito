import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface BudgetDollarRateRequest {
  budgetId?: string;
  clientId?: string;
  newUsdRate: number;
}

export async function POST(req: Request) {
  try {
    const body: BudgetDollarRateRequest = await req.json();

    const { budgetId, clientId, newUsdRate } = body;

    if (!newUsdRate) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos: newUsdRate' },
        { status: 400 }
      );
    }

    if (!budgetId && !clientId) {
      return NextResponse.json(
        { error: 'Debe proporcionar budgetId o clientId' },
        { status: 400 }
      );
    }

    // Validate USD rate is positive
    if (newUsdRate <= 0) {
      return NextResponse.json(
        { error: 'El tipo de cambio debe ser un valor positivo' },
        { status: 400 }
      );
    }

    // Use service role key if available, otherwise fall back to anon key
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseKey) {
      console.error('No Supabase key available (neither SERVICE_ROLE_KEY nor ANON_KEY)');
      return NextResponse.json(
        { error: 'Configuración de base de datos no disponible' },
        { status: 500 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey
    );

    let budgetsToUpdate;

    if (budgetId) {
      // Single budget update
      const { data: existingBudget, error: fetchError } = await supabase
        .from('budgets')
        .select('*')
        .eq('id', budgetId)
        .single();

      if (fetchError) {
        console.error('Error fetching budget:', fetchError);
        return NextResponse.json(
          { error: 'No se encontró el presupuesto especificado' },
          { status: 404 }
        );
      }

      if (!existingBudget) {
        return NextResponse.json(
          { error: 'Presupuesto no encontrado' },
          { status: 404 }
        );
      }

      budgetsToUpdate = [existingBudget];
    } else if (clientId) {
      // Multiple budgets update for client
      const { data: clientBudgets, error: fetchError } = await supabase
        .from('budgets')
        .select(`
          *,
          folder_budget:folder_budgets!inner (
            client_id
          )
        `)
        .eq('folder_budget.client_id', clientId)
        .not('amount_usd', 'is', null)
        .gt('amount_usd', 0);

      if (fetchError) {
        console.error('Error fetching client budgets:', fetchError);
        return NextResponse.json(
          { error: 'No se pudieron obtener los presupuestos del cliente' },
          { status: 500 }
        );
      }

      budgetsToUpdate = clientBudgets || [];
    } else {
      return NextResponse.json(
        { error: 'No se especificó qué presupuestos actualizar' },
        { status: 400 }
      );
    }

    if (budgetsToUpdate.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron presupuestos con monto USD para actualizar' },
        { status: 404 }
      );
    }

    // Update all budgets
    const updatePromises = budgetsToUpdate.map(async (budget) => {
      const budgetInUSD = budget.amount_usd || 0;
      const newBudgetInARS = budgetInUSD * newUsdRate;

      return supabase
        .from('budgets')
        .update({
          amount_ars: newBudgetInARS,
        })
        .eq('id', budget.id)
        .select()
        .single();
    });

    const updateResults = await Promise.all(updatePromises);
    const errors = updateResults.filter(result => result.error);

    if (errors.length > 0) {
      console.error('Error updating some budgets:', errors);
      return NextResponse.json(
        { error: `Error al actualizar ${errors.length} presupuesto(s)` },
        { status: 500 }
      );
    }

    const successfulUpdates = updateResults.map(result => result.data);

    return NextResponse.json({
      success: true,
      message: budgetId 
        ? 'Precio del presupuesto actualizado exitosamente'
        : `${successfulUpdates.length} presupuesto(s) actualizado(s) exitosamente`,
      data: {
        updatedBudgets: successfulUpdates,
        newUsdRate,
        updatedCount: successfulUpdates.length,
      },
    });

  } catch (err: any) {
    console.error('Error en API budget-dollar-rate:', err);
    return NextResponse.json(
      { error: err.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
