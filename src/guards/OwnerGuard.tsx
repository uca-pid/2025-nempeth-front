import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { getDefaultRouteForUser, isOwner } from './getDefaultRoute'

interface OwnerGuardProps {
  children: ReactNode
}

// Blocks access unless the authenticated user owns the business
function OwnerGuard({ children }: OwnerGuardProps) {
  const { user, isAuthenticated, isBootstrapping } = useAuth()

  if (isBootstrapping) return null

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />
  }

  if (!isOwner(user)) {
    return <Navigate to={getDefaultRouteForUser(user)} replace />
  }

  return <>{children}</>
}

export default OwnerGuard
