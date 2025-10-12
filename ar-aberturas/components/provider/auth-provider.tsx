"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserRole } from '@/constants/user-role'
import { findUser } from '@/lib/db'

type SessionUser = {
  usuario: string
  role: UserRole
}

type AuthContextType = {
  user: SessionUser | null
  loading: boolean
  signIn: (usuario: string, contraseña: string) => Promise<void>
  signOutUser: () => Promise<void>
}

const SESSION_STORAGE_KEY = 'sessionUser'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  // Restaurar sesión desde localStorage
  useEffect(() => {
    setIsMounted(true)
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(SESSION_STORAGE_KEY) : null
      if (raw) {
        const parsed: SessionUser = JSON.parse(raw)
        setUser(parsed)
      }
    } catch (_) {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  async function signIn(usuario: string, contraseña: string) {
    setLoading(true)
    try {
      const docData = await findUser(usuario, contraseña)
      if (!docData) throw new Error('Usuario o contraseña incorrectos')
        const sessionUser: SessionUser = { usuario: docData.usuario, role: docData.role }
        setUser(sessionUser)
        if (typeof window !== 'undefined') {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionUser))
        }
    } finally {
      setLoading(false)
    }
  }

  async function signOutUser() {
    setLoading(true)
    try {
      setUser(null)
      if (typeof window !== 'undefined') {
        localStorage.removeItem(SESSION_STORAGE_KEY)
      }
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  if (!isMounted) {
    // Evita desajustes de SSR/CSR durante la hidratación
    return null
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOutUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
