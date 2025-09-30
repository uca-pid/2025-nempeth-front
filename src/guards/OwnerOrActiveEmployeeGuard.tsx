import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { getDefaultRouteForUser, isEmployeeActive, isOwner } from './getDefaultRoute'

interface OwnerOrActiveEmployeeGuardProps {
  children: ReactNode
}

// Shares screens between owners and active employees while keeping others out
function OwnerOrActiveEmployeeGuard({ children }: OwnerOrActiveEmployeeGuardProps) {
  const { user, isAuthenticated, isBootstrapping } = useAuth()

  if (isBootstrapping) return null

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />
  }

  if (!isOwner(user) && !isEmployeeActive(user)) {
    return <Navigate to={getDefaultRouteForUser(user)} replace />
  }

  return <>{children}</>
}

export default OwnerOrActiveEmployeeGuard
