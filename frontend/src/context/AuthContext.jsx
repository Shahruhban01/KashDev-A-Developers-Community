import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(() => localStorage.getItem('kashdev_token'))

  const loadUser = useCallback(async () => {
    if (!token) { setLoading(false); return }
    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const { data } = await api.get('/auth/me')
      setUser(data.user)
      setProfile(data.profile)
    } catch {
      localStorage.removeItem('kashdev_token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { loadUser() }, [loadUser])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('kashdev_token', data.token)
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    setToken(data.token)
    setUser(data.user)
    return data
  }

  const register = async (name, username, email, password) => {
    const { data } = await api.post('/auth/register', { name, username, email, password })
    localStorage.setItem('kashdev_token', data.token)
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    setToken(data.token)
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem('kashdev_token')
    delete api.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
    setProfile(null)
  }

  const refreshProfile = async () => {
    const { data } = await api.get('/auth/me')
    setUser(data.user)
    setProfile(data.profile)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, token, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}