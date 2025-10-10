"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardHome } from "@/components/dashboard-home"
import { StockManagement } from "@/components/stock-management"
import { useAuth } from "@/components/auth-provider"
import { InstallationChecklist } from "@/components/installation-checklist"

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
    case 'admin':
      return <DashboardLayout><DashboardHome /></DashboardLayout>
    case 'fabrica':
      return <DashboardLayout><StockManagement /></DashboardLayout>
    case 'ventas':
      return <DashboardLayout><DashboardHome /></DashboardLayout>
    case 'marketing':
      return <DashboardLayout><DashboardHome /></DashboardLayout>
    case 'colocador':
      return <DashboardLayout><InstallationChecklist/></DashboardLayout>
    default:
      return <DashboardLayout><DashboardHome /></DashboardLayout>
  }
}
