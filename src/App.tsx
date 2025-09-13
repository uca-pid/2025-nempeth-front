import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Authentication from './Pages/Authentication'
import Home from './Pages/Home'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  return (
    <Router>
      <Routes>

        <Route 
          path="/" 
          element={
            isAuthenticated ? 
            <Navigate to="/home" replace /> : 
            <Authentication onLoginSuccess={handleLoginSuccess} />
          } 
        />
        
        <Route 
          path="/home" 
          element={
            isAuthenticated ? 
            <Home onLogout={handleLogout} /> : 
            <Navigate to="/" replace />
          } 
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
