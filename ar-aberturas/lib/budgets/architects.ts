import { getSupabaseClient } from '../supabase-client';

export interface ArchitectStats {
	name: string;
	totalBudgets: number;
	soldBudgets: number;
	chosenBudgets: number;
	totalAmount: number;
	soldAmount: number;
	soldPercentage: number;
}

export interface ArchitectReport {
	architects: ArchitectStats[];
	topArchitect: ArchitectStats | null;
	mostSoldArchitect: ArchitectStats | null;
	totalArchitects: number;
}

export async function getArchitectsReport(): Promise<{ data: ArchitectReport | null; error: any }> {
	try {
		const supabase = getSupabaseClient();
		
		// Obtener todos los presupuestos con información de obras y arquitectos
		const { data: budgets, error: budgetsError } = await supabase
			.from('budgets')
			.select(`
				id,
				amount_ars,
				amount_usd,
				sold,
				accepted,
				folder_budget:folder_budgets(
					work:works(
						architect
					)
				)
			`);

		if (budgetsError) {
			console.error('Error obteniendo presupuestos:', budgetsError);
			return { data: null, error: budgetsError };
		}

		if (!budgets || budgets.length === 0) {
			return { 
				data: {
					architects: [],
					topArchitect: null,
					mostSoldArchitect: null,
					totalArchitects: 0
				}, 
				error: null 
			};
		}

		// Agrupar presupuestos por arquitecto
		const architectMap = new Map<string, {
			totalBudgets: number;
			soldBudgets: number;
			chosenBudgets: number;
			totalAmount: number;
			soldAmount: number;
		}>();

		budgets.forEach((budget: any) => {
			const architect = budget.folder_budget?.work?.architect;
			if (!architect) return;

			const current = architectMap.get(architect) || {
				totalBudgets: 0,
				soldBudgets: 0,
				chosenBudgets: 0,
				totalAmount: 0,
				soldAmount: 0
			};

			current.totalBudgets++;
			current.totalAmount += budget.amount_ars || 0;

			if (budget.sold) {
				current.soldBudgets++;
				current.soldAmount += budget.amount_ars || 0;
			}

			if (budget.accepted) {
				current.chosenBudgets++;
			}

			architectMap.set(architect, current);
		});

		// Convertir a arreglo y calcular porcentajes
		const architects: ArchitectStats[] = Array.from(architectMap.entries()).map(([name, stats]) => ({
			name,
			totalBudgets: stats.totalBudgets,
			soldBudgets: stats.soldBudgets,
			chosenBudgets: stats.chosenBudgets,
			totalAmount: stats.totalAmount,
			soldAmount: stats.soldAmount,
			soldPercentage: stats.totalBudgets > 0 ? (stats.soldBudgets / stats.totalBudgets) * 100 : 0
		}));

		// Ordenar por total de presupuestos (descendente)
		architects.sort((a, b) => b.totalBudgets - a.totalBudgets);

		// Encontrar el arquitecto con más presupuestos vendidos
		const mostSoldArchitect = architects.reduce((prev, current) => 
			current.soldBudgets > prev.soldBudgets ? current : prev
		, architects[0]);

		const report: ArchitectReport = {
			architects,
			topArchitect: architects[0] || null,
			mostSoldArchitect: mostSoldArchitect || null,
			totalArchitects: architects.length
		};

		return { data: report, error: null };

	} catch (error) {
		console.error('Error inesperado en getArchitectsReport:', error);
		return { 
			data: null, 
			error: error instanceof Error ? error.message : 'Error desconocido' 
		};
	}
}
