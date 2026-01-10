import { createContext } from 'react'

export interface User {
  id: string
  name?: string
  email?: string
}

export interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  login: (token: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
})
