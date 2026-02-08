import { useContext } from 'react'
import type { AuthContextType } from '../types'
import { AuthContext } from './AuthContext'

/**
 * Hook to access the authentication context
 * 
 * @throws {Error} If used outside of AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
