import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StockManagement } from '@/components/business/stock-management';

export default function StockPVCPage() {
	return (
		<DashboardLayout>
			<StockManagement category="Perfiles" materialType="PVC" />
		</DashboardLayout>
	);
}
