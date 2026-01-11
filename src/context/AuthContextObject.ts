import { createContext } from 'react'

export interface User {
  id: string
  email: string
  role: any
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
)