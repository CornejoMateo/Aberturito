"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { UserRole } from '@/constants/user-role'

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
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('usuario', '==', usuario), where('contraseña', '==', contraseña))
      const snap = await getDocs(q)

      if (snap.empty) {
        throw new Error('Usuario o contraseña incorrectos')
      }

      // Suponemos usuario único por "usuario"
      const docData = snap.docs[0].data() as { usuario: string; contraseña: string; role: UserRole }
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
