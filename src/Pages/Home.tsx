import { useState, useEffect } from 'react'
import korvenLogo from '../assets/Korven_logo.png'
import LoadingScreen from '../components/LoadingScreen'
import '../Styles/Home.css'

interface HomeProps {
  onLogout: () => void
}

function Home({ onLogout }: HomeProps) {
  const [userName] = useState('Usuario')
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingAction, setIsLoadingAction] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Cargando dashboard de tu restaurante...')

  // Load screen simulation (change)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleLogout = () => {
    console.log('Logout')
    onLogout()
  }

  // Load simulation for card actions (delete)
  const handleCardAction = (action: string) => {
    setLoadingMessage(`Cargando ${action}...`)
    setIsLoadingAction(true)
    
    setTimeout(() => {
      setIsLoadingAction(false)
      console.log(`Navegando a: ${action}`)
    }, 2000)
  }

  if (isLoading || isLoadingAction) {
    return <LoadingScreen message={loadingMessage} />
  }

  return (
    <div className="home-container">
      <header className="header">
        <div className="header-left">
          <img src={korvenLogo} className="header-logo" alt="Korven Logo" />
          <h2 className="app-title">Korven</h2>
        </div>
        <div className="header-right">
          <span className="welcome-user">Bienvenido, {userName}</span>
          <button onClick={handleLogout} className="logout-button">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="hero-section">
          <h1 className="hero-title">¡Bienvenido a Korven!</h1>
          <p className="hero-subtitle">
            Tu aplicación para la gestión eficiente de bares y restaurantes
          </p>
        </div>

        <div className="dashboard-grid">
        

          <div className="dashboard-card">
            <div className="card-icon">🍽️</div>
            <h3>Productos</h3>
            <p>Administra tu carta y precios de manera sencilla</p>
            <button 
              className="card-button"
              onClick={() => handleCardAction('Gestión de Productos')}
            >
              Gestionar Productos
            </button>
          </div>

        </div>

      </main>
    </div>
  )
}

export default Home
