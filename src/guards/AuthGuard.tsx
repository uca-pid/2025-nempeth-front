import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { getDefaultRouteForUser } from './getDefaultRoute'

interface AuthGuardProps {
  children: ReactNode
}

// Ensures we only render children for authenticated users
function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isBootstrapping, user } = useAuth()

  if (isBootstrapping) return null

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />
  }

  // If authenticated but context is missing essentials we reroute to a safe default
  if (!user?.role) {
    return <Navigate to={getDefaultRouteForUser(user)} replace />
  }

  return <>{children}</>
}

export default AuthGuard
