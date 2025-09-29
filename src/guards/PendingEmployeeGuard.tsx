import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { getDefaultRouteForUser, isEmployeePending } from './getDefaultRoute'

interface PendingEmployeeGuardProps {
  children: ReactNode
}

// Routes employees that are still pending activation to a dedicated screen
function PendingEmployeeGuard({ children }: PendingEmployeeGuardProps) {
  const { user, isAuthenticated, isBootstrapping } = useAuth()

  if (isBootstrapping) return null

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />
  }

  if (!isEmployeePending(user)) {
    return <Navigate to={getDefaultRouteForUser(user)} replace />
  }

  return <>{children}</>
}

export default PendingEmployeeGuard
