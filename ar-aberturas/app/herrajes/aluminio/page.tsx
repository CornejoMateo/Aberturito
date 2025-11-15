import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StockManagement } from '@/components/business/stock-management';

export default function HerrajesAluminioPage() {
	return (
		<DashboardLayout>
			<StockManagement category="Herrajes" materialType="Aluminio" />
		</DashboardLayout>
	);
}
