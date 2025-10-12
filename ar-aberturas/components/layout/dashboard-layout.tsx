"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { useAuth } from '@/components/provider/auth-provider'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, Package, Users, FileText, ClipboardCheck, Calendar, BarChart3, Menu, X } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Stock", href: "/stock", icon: Package },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Presupuestos", href: "/presupuestos", icon: FileText },
  { name: "Obras", href: "/obras", icon: ClipboardCheck },
  { name: "Calendario", href: "/calendario", icon: Calendar },
  { name: "Reportes", href: "/reportes", icon: BarChart3 },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, signOutUser } = useAuth()

  // redirect to login when auth resolved and there's no user
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  // Definición de permisos por rol
  const allowedByRole = useMemo(() => {
    return {
      admin: ["Dashboard", "Stock", "Clientes", "Presupuestos", "Obras", "Calendario", "Reportes"],
      fabrica: ["Stock"],
      ventas: ["Dashboard", "Stock", "Clientes", "Presupuestos", "Calendario"],
      marketing: ["Dashboard", "Calendario", "Clientes", "Reportes", "Presupuestos"],
      colocador: ["Obras"],
    } as Record<string, string[]>
  }, [])

  const filteredNavigation = useMemo(() => {
    if (!user?.role) return navigation
    const allowedNames = allowedByRole[user.role] ?? []
    return navigation.filter((item) => allowedNames.includes(item.name))
  }, [user?.role, allowedByRole])

  // Redirigir a la primera ruta permitida si la actual no está permitida
  useEffect(() => {
    if (loading || !user?.role) return
    const allowedNames = allowedByRole[user.role] ?? []
    const currentItem = navigation.find((n) => n.href === pathname)
    const isAllowed = currentItem ? allowedNames.includes(currentItem.name) : true

    if (!isAllowed) {
      const firstAllowed = navigation.find((n) => allowedNames.includes(n.name))
      if (firstAllowed) router.replace(firstAllowed.href)
    }
  }, [loading, user?.role, pathname, router, allowedByRole])

  if (loading || !user?.role || !user) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-card border-r border-border transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-border px-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="font-bold text-primary-foreground text-sm">AR</span>
              </div>
              <span className="font-semibold text-foreground">AR Aberturas</span>
            </div>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User info */}
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                {/*<p className="text-sm font-medium text-foreground truncate">{user?.usuario ?? 'Usuario'}</p>*/}
                <p className="text-xs text-muted-foreground truncate">{user?.role ?? ''}</p>
              </div>
              <div className="ml-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      Cerrar sesión
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Seguro que querés cerrar sesión?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction asChild>
                        <Button variant="destructive" size="sm" onClick={() => signOutUser()}>
                          Sí, cerrar sesión
                        </Button>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">Sistema de Gestión</h1>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
