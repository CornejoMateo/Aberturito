import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { InstallationChecklist } from '@/components/business/installation-checklist';

export default function WorksPage() {
	return (
		<DashboardLayout>
			<InstallationChecklist />
		</DashboardLayout>
	);
}
