import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { WorksOpenings } from '@/components/business/works-progress';

export default function WorksPage() {
	return (
		<DashboardLayout>
			<WorksOpenings />
		</DashboardLayout>
	);
}
