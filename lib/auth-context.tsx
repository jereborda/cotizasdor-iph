"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

export type UserRole = "admin" | "vendor"

export interface UserProfile {
  id: string
  name: string
  role: UserRole
}

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, role")
    .eq("id", userId)
    .single()

  if (error || !data) return null
  return data as UserProfile
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      setUser(null)
      setProfile(null)
      setLoading(false)
      return
    }
    setUser(session.user)
    const p = await fetchProfile(session.user.id)
    setProfile(p)
    setLoading(false)
  }, [])

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadProfile(session)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadProfile(session)
    })

    return () => subscription.unsubscribe()
  }, [loadProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return { error: null }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
