import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ClaimsManagement } from '@/components/business/claims-management';

export default function ClaimsPage() {
    return (
        <DashboardLayout>
            <ClaimsManagement />
        </DashboardLayout>
    );
}
