import { useState } from 'react'
import korvenLogo from '../assets/Korven_logo.png'
import '../Styles/Authentication.css'
import { AuthService } from '../services/loginService'

interface AuthenticationProps {
  onLoginSuccess: () => void
}

function Authentication({ onLoginSuccess }: AuthenticationProps) {
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const [isLoginMode, setIsLoginMode] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const response = await AuthService.login({ email, password })
      console.log('Login exitoso:', response)
      onLoginSuccess()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      console.error('Error en login:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    
    
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden')
      return
    }
    
    console.log('Register attempt:', { 
      firstName, 
      email, 
      lastName, 
      password 
    })
  }

  const handleForgotPassword = () => {
    
    alert('Funcionalidad de recuperar contraseña próximamente disponible')
  }

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode)

    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setFirstName('')
    setLastName('')
  }

  return (
    <div className="login-container">
      {/* Lado izquierdo - 60% */}
      <div className="left-section">
        <div className="welcome-content">
          <img src={korvenLogo} className="welcome-logo" alt="Logo" />
          <h4 className="welcome-text">En la tradición europea, mucho antes de las colmenas modernas, las abejas vivían en cestas de mimbre, donde cada abeja encontraba su rol y la comunidad prosperaba.
Esas cestas no eran solo un contenedor, eran símbolo de orden, cooperación y productividad.
Inspirados en esa historia, nace Korven, la aplicación que convierte cada bar y restaurante en una colmena digital perfectamente organizada.</h4>
        </div>
      </div>

      {/* Lado derecho - 40% */}
      <div className="right-section">
        <div className="login-panel">
          <h1 className="login-title">
            {isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h1>
          
          {isLoginMode ? (
            <form onSubmit={handleLogin} className="login-form">
              {error && (
                <div className="error-message" style={{
                  color: '#ff4444',
                  backgroundColor: '#ffe6e6',
                  padding: '10px',
                  borderRadius: '5px',
                  marginBottom: '15px',
                  border: '1px solid #ff4444'
                }}>
                  {error}
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="email">Correo electrónico</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ingresa tu correo electrónico"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  required
                  disabled={isLoading}
                />
              </div>

              <button type="submit" className="login-button" disabled={isLoading}>
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="login-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">Nombre</label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="El nombre de tu negocio"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Apellido</label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Tu apellido"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Correo electrónico</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ingresa tu correo electrónico"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Crea una contraseña"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma tu contraseña"
                  required
                />
              </div>

              <button type="submit" className="login-button">
                Crear Cuenta
              </button>
            </form>
          )}

          <div className="toggle-section">
            {isLoginMode ? (
              <p className="toggle-text">
                ¿No tienes una cuenta?{' '}
                <button onClick={toggleMode} className="toggle-button">
                  Regístrate aquí
                </button>
              </p>
            ) : (
              <p className="toggle-text">
                ¿Ya tienes una cuenta?{' '}
                <button onClick={toggleMode} className="toggle-button">
                  Inicia sesión
                </button>
              </p>
            )}
          </div>

          {isLoginMode && (
            <button
              onClick={handleForgotPassword}
              className="forgot-password-link"
            >
              ¿Olvidaste tu contraseña?
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Authentication
