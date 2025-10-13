import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StockManagement } from "@/components/business/stock-management"

export default function StockAluminioPage() {
  return (
    <DashboardLayout>
      <StockManagement materialType="aluminio" />
    </DashboardLayout>
  )
}
