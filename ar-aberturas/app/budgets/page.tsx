import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ReportsView } from '@/components/business/budget-management';

export default function BudgetsPage() {
	return (
		<DashboardLayout>
			<ReportsView />
		</DashboardLayout>
	);
}
