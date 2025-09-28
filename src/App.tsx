import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/useAuth'
import Authentication from './Pages/Authentication'
import Home from './Pages/Home'
import EditProfile from './Pages/EditProfile'
import Products from './Pages/Products'
import BusinessInfo from './Pages/BusinessInfo'
import ResetPassword from './Pages/ResetPassword'
import Layout from './components/Layout'

// Componente interno que usa el contexto
function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          isAuthenticated ? 
          <Navigate to="/home" replace /> : 
          <Authentication />
        } 
      />
      
      <Route 
        path="/home" 
        element={
          isAuthenticated ? 
          <Layout><Home /></Layout> : 
          <Navigate to="/" replace />
        } 
      />
      
      <Route 
        path="/profile" 
        element={
          isAuthenticated ? 
          <Layout><EditProfile /></Layout> : 
          <Navigate to="/" replace />
        } 
      />
      
      <Route 
        path="/products" 
        element={
          isAuthenticated ? 
          <Layout><Products /></Layout> : 
          <Navigate to="/" replace />
        } 
      />
      
      <Route 
        path="/business" 
        element={
          isAuthenticated ? 
          <Layout><BusinessInfo /></Layout> : 
          <Navigate to="/" replace />
        } 
      />
      
      <Route 
        path="/reset-password" 
        element={<ResetPassword />} 
      />
      
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
