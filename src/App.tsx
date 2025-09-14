import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/useAuth'
import Authentication from './Pages/Authentication'
import Home from './Pages/Home'
import LoadingScreen from './components/LoadingScreen'

// Componente interno que usa el contexto
function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

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
          <Home /> : 
          <Navigate to="/" replace />
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
