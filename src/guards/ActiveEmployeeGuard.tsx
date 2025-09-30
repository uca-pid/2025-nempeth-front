import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { getDefaultRouteForUser, isEmployeeActive } from './getDefaultRoute'

interface ActiveEmployeeGuardProps {
  children: ReactNode
}

// Allows access for employees whose status is ACTIVE
function ActiveEmployeeGuard({ children }: ActiveEmployeeGuardProps) {
  const { user, isAuthenticated, isBootstrapping } = useAuth()

  if (isBootstrapping) return null

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />
  }

  if (!isEmployeeActive(user)) {
    return <Navigate to={getDefaultRouteForUser(user)} replace />
  }

  return <>{children}</>
}

export default ActiveEmployeeGuard
