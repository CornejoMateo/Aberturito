import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { BudgetManagement } from '@/components/business/budget-management';

export default function PresupuestosPage() {
	return (
		<DashboardLayout>
			<BudgetManagement />
		</DashboardLayout>
	);
}
