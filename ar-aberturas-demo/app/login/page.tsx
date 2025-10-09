"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/components/auth-provider'

export default function LoginPage() {
  const { signIn, user, loading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Redirect to dashboard after auth state resolved
  React.useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await signIn(email, password)
      router.push('/')
    } catch (err: any) {
      setError(err?.message || 'Error al iniciar sesión')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-6 rounded-lg border border-border bg-card">
        <h2 className="text-2xl font-semibold mb-4">Iniciar sesión</h2>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground">Usuario (email)</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="admin@ejemplo.com" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Contraseña</label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="********" />
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
          <div className="flex items-center justify-end">
            <Button type="submit" disabled={loading}>{loading ? 'Cargando...' : 'Ingresar'}</Button>
          </div>
        </form>
        <div className="text-xs text-muted-foreground mt-3">Usa las credenciales provistas en Firebase. Ej: admin@demo.com / admin123</div>
      </div>
    </div>
  )
}
