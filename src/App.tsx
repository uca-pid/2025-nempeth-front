import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/useAuth'
import Authentication from './Pages/Authentication'
import Home from './Pages/Home'
import EditProfile from './Pages/EditProfile'
import Products from './Pages/Products'
import BusinessInfo from './Pages/BusinessInfo'
import CreateOrder from './Pages/CreateOrder'
import SalesHistory from './Pages/SalesHistory'
import SaleDetails from './Pages/SaleDetails'
import ResetPassword from './Pages/ResetPassword'
import PendingApproval from './Pages/PendingApproval'
import Layout from './components/Layout'
import UnauthenticatedGuard from './guards/UnauthenticatedGuard'
import OwnerGuard from './guards/OwnerGuard'
import PendingEmployeeGuard from './guards/PendingEmployeeGuard'
import OwnerOrActiveEmployeeGuard from './guards/OwnerOrActiveEmployeeGuard'

// Componente interno que usa el contexto
function AppRoutes() {
  const { isBootstrapping } = useAuth()

  if (isBootstrapping) {
    // Light placeholder while we restore the session
    return (
      <div className="flex items-center justify-center min-h-screen text-sm text-gray-500 bg-white">
        Cargando sesión...
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <UnauthenticatedGuard>
            <Authentication />
          </UnauthenticatedGuard>
        }
      />

      <Route
        path="/reset-password"
        element={
          <UnauthenticatedGuard>
            <ResetPassword />
          </UnauthenticatedGuard>
        }
      />

      <Route
        path="/pending"
        element={
          <PendingEmployeeGuard>
            <PendingApproval />
          </PendingEmployeeGuard>
        }
      />

      <Route
        path="/home"
        element={
          <OwnerOrActiveEmployeeGuard>
            <Layout>
              <Home />
            </Layout>
          </OwnerOrActiveEmployeeGuard>
        }
      />

      <Route
        path="/orders/create"
        element={
          <OwnerOrActiveEmployeeGuard>
            <Layout>
              <CreateOrder />
            </Layout>
          </OwnerOrActiveEmployeeGuard>
        }
      />

      <Route
        path="/profile"
        element={
          <OwnerOrActiveEmployeeGuard>
            <Layout>
              <EditProfile />
            </Layout>
          </OwnerOrActiveEmployeeGuard>
        }
      />

      <Route
        path="/sales/:saleId"
        element={
          <OwnerOrActiveEmployeeGuard>
            <Layout>
              <SaleDetails />
            </Layout>
          </OwnerOrActiveEmployeeGuard>
        }
      />

      <Route
        path="/products"
        element={
          <OwnerGuard>
            <Layout>
              <Products />
            </Layout>
          </OwnerGuard>
        }
      />

      <Route
        path="/business"
        element={
          <OwnerGuard>
            <Layout>
              <BusinessInfo />
            </Layout>
          </OwnerGuard>
        }
      />

      <Route
        path="/sales-history"
        element={
          <OwnerOrActiveEmployeeGuard>
            <Layout>
              <SalesHistory />
            </Layout>
          </OwnerOrActiveEmployeeGuard>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App
