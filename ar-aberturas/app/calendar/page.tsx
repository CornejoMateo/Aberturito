import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { CalendarView } from '@/components/business/calendar-view';

export default function CalendarPage() {
	return (
		<DashboardLayout>
			<CalendarView />
		</DashboardLayout>
	);
}
