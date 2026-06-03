import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`
      API.get('/auth/me').then(res => {
        setUser(res.data)
      }).catch(() => {
        localStorage.removeItem('token')
        setToken(null)
      }).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password })
    localStorage.setItem('token', res.data.token)
    API.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
    setToken(res.data.token)
    setUser(res.data.user)
    return res.data
  }

  const register = async (name, email, password) => {
    const res = await API.post('/auth/register', { name, email, password })
    localStorage.setItem('token', res.data.token)
    API.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
    setToken(res.data.token)
    setUser(res.data.user)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, API }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
