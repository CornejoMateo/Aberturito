"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardHome } from "@/components/dashboard-home"
import { StockManagement } from "@/components/stock-management"
import { useAuth } from "@/components/auth-provider"
import { auth } from "@/lib/firebase"

//obtener el usuario y dependiendo el usuario hacemos un switch para inicializar el dashboard o la seccion habilidata por el usuario

export default function HomePage() {
  const { user } = useAuth()
  
  switch (user?.role) {
    case 'admin':
      return <DashboardLayout><DashboardHome /></DashboardLayout>
    case 'fabrica':
      return <DashboardLayout><StockManagement /></DashboardLayout>
    case 'ventas':
      return <DashboardLayout><DashboardHome /></DashboardLayout>
    case 'marketing':
      return <DashboardLayout><DashboardHome /></DashboardLayout>
    case 'colocador':
      return <DashboardLayout><DashboardHome /></DashboardLayout>
    default:
      return <DashboardLayout><DashboardHome /></DashboardLayout>
  }
}
