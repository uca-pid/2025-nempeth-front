import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import korvenLogo from '../assets/bee.jpeg'
import '../Styles/Home.css'
import { useAuth } from '../contexts/useAuth'

function Home() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const userName = user?.email || 'Usuario'
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

    const handleLogout = () => {
    logout()
  }

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu)
  }

  const handleProductsClick = () => {
    navigate('/products')
  }

  const handleProfileClick = () => {
    setShowUserMenu(false)
    navigate('/profile')
  }

  const handleSettingsClick = () => {
    console.log('Navegando a configuración')
  }

  return (
    <div className="erp-container">
      {/* Header Principal */}
      <header className="erp-header">
        <div className="header-content">
          <div className="header-left">
            <img src={korvenLogo} className="header-logo" alt="Korven Logo" />
            <div className="brand-info">
              <h1 className="app-title">Korven</h1>
              <span className="app-subtitle">Sistema de Gestión</span>
            </div>
          </div>
          
          <div className="header-right">
            <div className="user-section" ref={userMenuRef}>
              <div className="user-info" onClick={toggleUserMenu}>
                <div className="user-avatar">
                  <span>{userName.charAt(0).toUpperCase()}</span>
                </div>
                <div className="user-details">
                  <span className="user-name">{userName}</span>
                  <span className="user-role">Administrador</span>
                </div>
                <svg className={`dropdown-arrow ${showUserMenu ? 'rotated' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
              </div>
              
              {showUserMenu && (
                <div className="user-dropdown">
                  <button onClick={handleProfileClick} className="dropdown-item">
                    <span className="dropdown-icon">👤</span>
                    Mi Perfil
                  </button>
                  <button onClick={handleSettingsClick} className="dropdown-item">
                    <span className="dropdown-icon">⚙️</span>
                    Configuración
                  </button>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item logout-item">
                    <span className="dropdown-icon">🚪</span>
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="main-content">
        <div className="welcome-section">
          <h2 className="welcome-title">¡Bienvenido a Korven!</h2>
          <p className="welcome-description">
            Sistema integral de gestión para bares y restaurantes
          </p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card available" onClick={handleProductsClick}>
            <div className="">
              <div className="card-icon products">🍽️</div>

            </div>
            <div className="card-content">
              <h3 className="card-title">Gestión de Productos</h3>
              <p className="card-description">
                Administra tu carta, precios, categorías y stock de productos
              </p>
              <ul className="card-features">
                <li>• Crear y editar productos</li>
                <li>• Gestionar categorías</li>
                <li>• Control de precios</li>
                <li>• Seguimiento de stock</li>
              </ul>
            </div>
            <div className="card-footer">
              <button className="card-button primary">
                Acceder a Productos
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home
