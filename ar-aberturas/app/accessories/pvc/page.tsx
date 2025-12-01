import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StockManagement } from '@/components/business/stock-management';

export default function AccesoriosPVCPage() {
	return (
		<DashboardLayout>
			<StockManagement category="Accesorios" materialType="PVC" />
		</DashboardLayout>
	);
}
