import { useState } from 'react'
import korvenLogo from '../assets/Korven_logo.png'
import '../Styles/Authentication.css'
import { AuthService } from '../services/loginService'
import SuccesOperation from '../components/SuccesOperation'
import { IoEye, IoEyeOff } from 'react-icons/io5'
import { useAuth } from '../contexts/useAuth'

function Authentication() {
  const { login } = useAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState<'OWNER' | 'USER'>('OWNER')

  const [isLoginMode, setIsLoginMode] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const clearFormFields = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setFirstName('')
    setLastName('')
    setRole('OWNER')
    setError('')
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setError('')
    
    // Validaciones del lado del cliente
    if (!email.trim()) {
      setError('El correo electrónico es obligatorio')
      return
    }
    
    if (!password.trim()) {
      setError('La contraseña es obligatoria')
      return
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor ingresa un correo electrónico válido')
      return
    }

    setIsLoading(true)

    try {
      const response = await login({ email, password })
      console.log('Login exitoso:', response) //ELIMINAR ESTO 

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Error inesperado. Intenta nuevamente.')
      }
      console.error('Error en login:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validaciones mejoradas del lado del cliente
    if (!firstName.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    
    if (!lastName.trim()) {
      setError('El apellido es obligatorio')
      return
    }
    
    if (!email.trim()) {
      setError('El correo electrónico es obligatorio')
      return
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor ingresa un correo electrónico válido')
      return
    }
    
    // Validación de contraseñas
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    // Validación de longitud de contraseña
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    
    try {
      const response = await AuthService.register({
        name: firstName,
        lastName,
        email,
        password,
        role,
      })
      console.log('Registro exitoso:', response)
      setIsLoading(true)
      
      clearFormFields()
      setIsLoginMode(true)
      setShowSuccessMessage(true)

    } catch (err) {
      // Mejorar el manejo de errores para registro
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Error inesperado durante el registro. Intenta nuevamente.')
      }
      console.error('Error en registro:', err)
    } finally {
      setIsLoading(false)
    }
  }


  const handleForgotPassword = () => {
    
    alert('Funcionalidad de recuperar contraseña próximamente disponible')
  }

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode)
    clearFormFields()
    setIsLoading(false)
    setError('') 
  }

  return (
    <div className="login-container">
      
      {showSuccessMessage && (
        <SuccesOperation 
          message="Cuenta creada exitosamente. Ahora ya puede iniciar sesión..." 
          onClose={() => setShowSuccessMessage(false)}
        />
      )}

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
                  color: '#d32f2f',
                  backgroundColor: '#ffebee',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  border: '1px solid #ffcdd2',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  ⚠️ {error}
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="email">Correo electrónico</label>
                <input
                  //type="email"
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
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle-button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="login-button" disabled={isLoading}>
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="login-form">
              {error && (
                <div className="error-message" style={{
                  color: '#d32f2f',
                  backgroundColor: '#ffebee',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  border: '1px solid #ffcdd2',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  ⚠️ {error}
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">Nombre</label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Tu nombre"
                    //required
                    disabled={isLoading}
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
                  //required
                  disabled={isLoading}
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
                  //required
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Crea una contraseña"
                    //required
                    disabled={isLoading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle-button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                <div className="password-input-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirma tu contraseña"
                    //required
                    disabled={isLoading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle-button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                    aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showConfirmPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="role">Tipo de usuario</label>
                <select
                  id="role"
                  className="toggle-list-selection"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'OWNER' | 'USER')}
                  required
                  disabled={isLoading}
                >
                  <option value="OWNER">Propietario del negocio</option>
                  <option value="USER">Empleado</option>
                </select>
              </div>

              <button type="submit" className="login-button" disabled={isLoading}>
                {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
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
