"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DashboardHome } from "@/components/layout/dashboard-home"
import { StockManagement } from "@/components/business/stock-management"
import { useAuth } from "@/components/provider/auth-provider"
import { InstallationChecklist } from "@/components/business/installation-checklist"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Redirigir al login si no hay usuario autenticado
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-lg">Cargando...</div>
      </div>
    )
  }

  // Si no hay usuario, no renderizar nada (se redirigirá)
  if (!user) {
    return null
  }
  
  // Mostrar dashboard según el rol del usuario
  switch (user.role) {
    case 'Admin':
      return <DashboardLayout><DashboardHome /></DashboardLayout>
    case 'Fabrica':
      return <DashboardLayout><StockManagement /></DashboardLayout>
    case 'Ventas':
      return <DashboardLayout><DashboardHome /></DashboardLayout>
    case 'Marketing':
      return <DashboardLayout><DashboardHome /></DashboardLayout>
    case 'Colocador':
      return <DashboardLayout><InstallationChecklist/></DashboardLayout>
    default:
      return <DashboardLayout><DashboardHome /></DashboardLayout>
  }
}
