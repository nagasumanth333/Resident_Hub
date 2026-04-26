import { createContext, useContext, useState, type ReactNode } from 'react'
import { useGoogleLogin, googleLogout } from '@react-oauth/google'

export type AuthUser = {
  id: string
  name: string
  email: string
  picture: string
}

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  login: () => void
  logout: () => void
}

const STORAGE_KEY = 'auth_user'

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadUser)
  const [loading, setLoading] = useState(false)

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true)
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        })
        const profile = await res.json()
        const authUser: AuthUser = {
          id: profile.sub,
          name: profile.name ?? '',
          email: profile.email ?? '',
          picture: profile.picture ?? '',
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser))
        setUser(authUser)
      } finally {
        setLoading(false)
      }
    },
    onError: () => setLoading(false),
  })

  function logout() {
    googleLogout()
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
