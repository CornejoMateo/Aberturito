import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StockManagement } from '@/components/business/stock-management';

export default function AccessoriesPage() {
	return (
		<DashboardLayout>
			<StockManagement category="Accesorios" materialType="Aluminio" />
		</DashboardLayout>
	);
}
