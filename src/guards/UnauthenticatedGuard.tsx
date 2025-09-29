import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { getDefaultRouteForUser } from './getDefaultRoute'

interface UnauthenticatedGuardProps {
  children: ReactNode
}

// Makes sure login-related pages stay visible only for guests
function UnauthenticatedGuard({ children }: UnauthenticatedGuardProps) {
  const { isAuthenticated, isBootstrapping, user } = useAuth()

  if (isBootstrapping) return null

  if (isAuthenticated) {
    return <Navigate to={getDefaultRouteForUser(user ?? null)} replace />
  }

  return <>{children}</>
}

export default UnauthenticatedGuard
