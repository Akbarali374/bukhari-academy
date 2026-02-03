import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { Profile, Role } from '@/types'
import { supabase } from '@/lib/supabase'
import { globalDb } from '@/lib/globalDb'
import {
  demoGetSession,
  demoLogin as demoLoginFn,
  demoLogout as demoLogoutFn,
  type DemoAuthUser,
} from '@/lib/demoDb'

const SUPABASE_ENABLED = !!import.meta.env.VITE_SUPABASE_URL

type AuthUser = { id: string; email: string; role: Role; profile: Profile }

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string; role?: Role }> 
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    if (!user) return
    if (SUPABASE_ENABLED) {
      const { data } = await supabase!.from('profiles').select('*').eq('id', user.id).single()
      if (data) setUser((u) => (u ? { ...u, profile: data as Profile } : null))
    } else {
      try {
        const profiles = await globalDb.getProfiles()
        const profile = profiles.find(p => p.id === user.id)
        if (profile) {
          setUser(u => u ? { ...u, profile } : null)
        }
      } catch (error) {
        console.error('Profile refresh error:', error)
        const session = demoGetSession()
        if (session) setUser({ id: session.id, email: session.email, role: session.role, profile: session.profile })
      }
    }
  }, [user])

  useEffect(() => {
    if (SUPABASE_ENABLED) {
      supabase!.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data }) => {
              if (data)
                setUser({
                  id: (data as Profile).id,
                  email: (data as Profile).email,
                  role: (data as Profile).role,
                  profile: data as Profile,
                })
            })
        }
        setLoading(false)
      })
      const {
        data: { subscription },
      } = supabase!.auth.onAuthStateChange((_e, session) => {
        if (!session) {
          setUser(null)
          setLoading(false)
          return
        }
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data)
              setUser({
                id: (data as Profile).id,
                email: (data as Profile).email,
                role: (data as Profile).role,
                profile: data as Profile,
              })
            setLoading(false)
          })
      })
      return () => subscription.unsubscribe()
    } else {
      // Check for saved session first
      const savedSession = localStorage.getItem('bukhari_session')
      if (savedSession) {
        try {
          const authUser = JSON.parse(savedSession)
          setUser(authUser)
          setLoading(false)
          return
        } catch (error) {
          console.error('Session parse error:', error)
          localStorage.removeItem('bukhari_session')
        }
      }
      
      // Fallback to demo session
      const session = demoGetSession()
      if (session) setUser(toAuthUser(session))
      setLoading(false)
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string): Promise<{ ok: boolean; error?: string; role?: Role }> => {
      if (SUPABASE_ENABLED) {
        const { data: authData, error } = await supabase!.auth.signInWithPassword({ email, password })
        if (error) return { ok: false, error: error.message }
        if (!authData?.user) return { ok: false, error: 'Foydalanuvchi topilmadi' }
        const { data: profile } = await supabase!.from('profiles').select('*').eq('id', authData.user.id).single()
        if (profile) {
          const p = profile as Profile
          setUser({ id: p.id, email: p.email, role: p.role, profile: p })
          return { ok: true, role: p.role }
        }
        return { ok: false, error: 'Profil topilmadi' }
      } else {
        try {
          const profile = await globalDb.login(email, password)
          if (profile) {
            const authUser = { id: profile.id, email: profile.email, role: profile.role, profile }
            setUser(authUser)
            localStorage.setItem('bukhari_session', JSON.stringify(authUser))
            return { ok: true, role: profile.role }
          }
          return { ok: false, error: 'Email yoki parol noto\'g\'ri' }
        } catch (error) {
          console.error('Login error:', error)
          return { ok: false, error: 'Kirish xatosi yuz berdi' }
        }
      }
    },
    []
  )

  const logout = useCallback(async () => {
    if (SUPABASE_ENABLED) await supabase!.auth.signOut()
    else {
      demoLogoutFn()
      localStorage.removeItem('bukhari_session')
    }
    setUser(null)
  }, [])

  const value: AuthContextValue = { user, loading, login, logout, refreshProfile }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function toAuthUser(s: DemoAuthUser): AuthUser {
  return { id: s.id, email: s.email, role: s.role, profile: s.profile }
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
