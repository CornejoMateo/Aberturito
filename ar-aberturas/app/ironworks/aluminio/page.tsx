import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StockManagement } from '@/components/business/stock-management';

export default function IronworksAluminioPage() {
	return (
		<DashboardLayout>
			<StockManagement category="Herrajes" materialType="Aluminio" />
		</DashboardLayout>
	);
}
