import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ClientManagement } from '@/components/business/client-management';

export default function ClientesPage() {
	return (
		<DashboardLayout>
			<ClientManagement />
		</DashboardLayout>
	);
}
