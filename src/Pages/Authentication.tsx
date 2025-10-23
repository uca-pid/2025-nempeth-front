import { useState } from 'react'
import korvenLogo from '../assets/Korven_logo.png'
import { AuthService } from '../services/loginService'
import { IoEye, IoEyeOff } from 'react-icons/io5'
import { useAuth } from '../contexts/useAuth'
import Modal from '../components/Modal'
import PasswordValidationList from '../components/PasswordValidationList'

export default function Authentication() {
  const { login, isLoading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState<'OWNER' | 'USER'>('OWNER')
  const [variableField, setVariableField] = useState('')

  const [isLoginMode, setIsLoginMode] = useState(true)
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false)
  const [error, setError] = useState('')
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const clearFormFields = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setFirstName('')
    setLastName('')
    setVariableField('')
    setError('')
    setShowErrorModal(false)
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  // Función auxiliar para manejar errores con modal
  const handleError = (err: unknown, defaultMessage: string = 'Error inesperado. Intenta nuevamente.') => {
    if (err instanceof Error) {
      setError(err.message)
    } else {
      setError(defaultMessage)
    }
    setShowErrorModal(true)
    console.error('Error:', err)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

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

    try {
      const response = await login({ email, password })
      console.log('Login exitoso:', response)
    } catch (err: unknown) {
      handleError(err, 'Error inesperado en el login. Intenta nuevamente.')
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

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
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (!/(?=.*[a-z])/.test(password)) {
      setError('La contraseña debe contener al menos una letra minúscula')
      return 
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      setError('La contraseña debe contener al menos una letra mayúscula')
      return
    }
    if (!/(?=.*\d)/.test(password)) {
      setError('La contraseña debe contener al menos un número')
      return
    }

    // Validación específica para propietarios
    if (role === 'OWNER' && !variableField.trim()) {
      setError('El nombre del negocio es obligatorio para propietarios')
      return
    }

    // Función auxiliar para manejar errores de registro
    const handleRegistrationError = (err: unknown) => {
      handleError(err, 'Error inesperado durante el registro. Intenta nuevamente.')
    }

    // Función auxiliar para manejar registro exitoso
    const handleRegistrationSuccess = (response: unknown) => {
      console.log('Registro exitoso:', response)
      clearFormFields()
      setIsLoginMode(true)
      setShowSuccessMessage(true)
    }

    try {
      let response;
      
      if (role === 'OWNER') {
        // Registro de propietario con información del negocio
        response = await AuthService.registerByOwner({
          name: firstName,
          lastName,
          email,
          password,
          businessName: variableField,
        })
      } else {
        // Registro de empleado
        response = await AuthService.registerByEmployee({
          name: firstName,
          lastName,
          email,
          password,
          businessJoinCode: variableField,
        })
      }
      
      handleRegistrationSuccess(response)
    } catch (err: unknown) {
      handleRegistrationError(err)
    }
    
  }

  const handleForgotPassword = () => {
    setIsForgotPasswordMode(true)
    setError('')
  }

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('El correo electrónico es obligatorio')
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor ingresa un correo electrónico válido')
      return
    }

    try {
      const response = await AuthService.forgotPassword({ email })
      console.log('Correo de recuperación enviado:', response)
      setIsForgotPasswordMode(false)
      setEmail('')
    } catch (err: unknown) {
      handleError(err, 'Error al enviar el correo de recuperación. Intenta nuevamente.')
    } 
  }

  const handleBackToLogin = () => {
    setIsForgotPasswordMode(false)
    setError('')
    setEmail('')
  }

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode)
    clearFormFields()
    setError('')
  }

return (
  <div className="flex flex-col w-screen min-h-screen p-0 m-0 md:h-screen md:flex-row md:overflow-hidden">
    {/* Left */}
    <div className="relative flex items-center justify-center flex-1 overflow-hidden md:basis-3/5 bg-gradient-to-br from-rose-600 via-orange-500 to-amber-500 min-h-[40vh] md:min-h-0">
      {/* radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(253,118,0,0.12)_0%,transparent_70%)]" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full max-w-full px-6 pt-6 pb-4 text-white sm:px-8 md:pt-12 md:pb-6">
        <img
          src={korvenLogo}
          alt="Logo Korven"
          className="max-w-full h-auto w-[180px] sm:w-[280px] md:w-[520px] lg:w-[720px] xl:w-[800px] 2xl:w-[900px] drop-shadow-lg animate-gentle-float mb-4 md:mb-8"
        />
        <h4 className="w-full max-w-[70ch] text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl font-normal leading-relaxed tracking-wide text-center text-white/95 drop-shadow px-1">
          En la tradición europea, mucho antes de las colmenas modernas, las abejas vivían en cestas de mimbre, donde cada abeja encontraba su rol y la comunidad prosperaba. Esas cestas no eran solo un contenedor, eran símbolo de orden, cooperación y productividad. Inspirados en esa historia, nace Korven, la aplicación que convierte cada bar y restaurante en una colmena digital perfectamente organizada.
        </h4>
      </div>
    </div>

    {/* Right */}
    <div className="flex items-start justify-center flex-1 p-4 overflow-y-auto bg-white sm:p-6 lg:p-8 xl:p-10 md:basis-2/5 md:items-center">
      <div className="w-full max-w-sm p-2 my-4 sm:max-w-md sm:p-6 lg:max-w-lg xl:max-w-xl md:my-0">
        <h1 className="mb-6 text-2xl font-semibold text-center sm:mb-8 sm:text-3xl lg:text-4xl xl:text-5xl text-neutral-800">
          {isForgotPasswordMode ? 'Recuperar Contraseña' : isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </h1>

        {isForgotPasswordMode ? (
          <form onSubmit={handleForgotPasswordSubmit} className="flex flex-col">
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 mb-5 text-sm font-medium border rounded-lg border-rose-200 bg-rose-50 text-rose-700">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <p className="mb-6 text-sm leading-relaxed text-center text-neutral-600">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </p>

            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm font-medium text-neutral-700">Correo electrónico</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresa tu correo electrónico"
                required
                disabled={isLoading}
                className="w-full px-4 py-3 text-base transition border-2 rounded-lg outline-none border-neutral-200 focus:border-rose-600 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-75"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 rounded-lg bg-gradient-to-br from-rose-600 to-orange-600 px-4 py-3 text-base font-semibold text-white shadow transition hover:translate-y-[-2px] hover:shadow-lg active:translate-y-0 disabled:opacity-75"
            >
              {isLoading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
            </button>

            <button
              type="button"
              onClick={handleBackToLogin}
              disabled={isLoading}
              className="w-full p-0 mt-4 text-sm font-semibold text-center underline transition bg-transparent border-0 text-amber-500 underline-offset-2 hover:text-orange-500 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 disabled:opacity-75"
            >
              Volver al inicio de sesión
            </button>
          </form>
        ) : isLoginMode ? (
          <form onSubmit={handleLogin} className="flex flex-col">
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 mb-5 text-sm font-medium border rounded-lg border-rose-200 bg-rose-50 text-rose-700">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm font-medium text-neutral-700">Correo electrónico</label>
              <input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresa tu correo electrónico"
                required
                disabled={isLoading}
                className="w-full px-4 py-3 text-base transition border-2 rounded-lg outline-none border-neutral-200 focus:border-rose-600 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-75"
              />
            </div>

            <div className="flex flex-col gap-1 mt-4">
              <label htmlFor="password" className="text-sm font-medium text-neutral-700">Contraseña</label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 pr-10 text-base transition border-2 rounded-lg outline-none border-neutral-200 focus:border-rose-600 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-75"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute p-1 transition -translate-y-1/2 rounded right-3 top-1/2 text-neutral-500 active:scale-95 disabled:opacity-50"
                >
                  {showPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 rounded-lg bg-gradient-to-br from-rose-600 to-orange-600 px-4 py-3 text-base font-semibold text-white shadow transition hover:translate-y-[-2px] hover:shadow-lg active:translate-y-0 disabled:opacity-75"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="flex flex-col">
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 mb-5 text-sm font-medium border rounded-lg border-rose-200 bg-rose-50 text-rose-700">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label htmlFor="firstName" className="text-sm font-medium text-neutral-700">Nombre</label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Tu nombre"
                  disabled={isLoading}
                  className="w-full px-4 py-3 text-base transition border-2 rounded-lg outline-none border-neutral-200 focus:border-rose-600 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-75"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="lastName" className="text-sm font-medium text-neutral-700">Apellido</label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Tu apellido"
                  disabled={isLoading}
                  className="w-full px-4 py-3 text-base transition border-2 rounded-lg outline-none border-neutral-200 focus:border-rose-600 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-75"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-4">
              <label htmlFor="email-reg" className="text-sm font-medium text-neutral-700">Correo electrónico</label>
              <input
                type="email"
                id="email-reg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresa tu correo electrónico"
                disabled={isLoading}
                className="w-full px-4 py-3 text-base transition border-2 rounded-lg outline-none border-neutral-200 focus:border-rose-600 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-75"
              />
            </div>

            <div className="flex flex-col gap-1 mt-4">
              <label htmlFor="password-reg" className="text-sm font-medium text-neutral-700">Contraseña</label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password-reg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Crea una contraseña"
                  disabled={isLoading}
                  minLength={8}
                  className="w-full px-4 py-3 pr-10 text-base transition border-2 rounded-lg outline-none border-neutral-200 focus:border-rose-600 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-75"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute p-1 transition -translate-y-1/2 rounded right-3 top-1/2 text-neutral-500 active:scale-95 disabled:opacity-50"
                >
                  {showPassword ? <IoEye size={20} /> : <IoEyeOff size={20} /> }
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1 my-4">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-neutral-700">Confirmar Contraseña</label>
              <div className="relative flex items-center">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma tu contraseña"
                  disabled={isLoading}
                  minLength={8}
                  className="w-full px-4 py-3 pr-10 text-base transition border-2 rounded-lg outline-none border-neutral-200 focus:border-rose-600 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-75"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute p-1 transition -translate-y-1/2 rounded right-3 top-1/2 text-neutral-500 active:scale-95 disabled:opacity-50"
                >
                  {showConfirmPassword ? <IoEye size={20} /> : <IoEyeOff size={20} /> }
                </button>
              </div>
            </div>

            {/* Contenedor de requisitos */}
            <PasswordValidationList password={password} />

            <div className="flex flex-col gap-1 mt-3">
              <label htmlFor="role" className="text-sm font-medium text-neutral-900">Tipo de usuario</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'OWNER' | 'USER')}
                disabled={isLoading}
                className="w-full px-3 py-3 text-base text-center transition bg-white border-2 rounded-lg outline-none border-neutral-200 text-neutral-900 disabled:cursor-not-allowed disabled:opacity-75"
              >
                <option value="OWNER">Propietario del negocio</option>
                <option value="USER">Empleado</option>
              </select>
            </div>

            <div>
              <input
                type="text"
                id="businessName"
                value={variableField }
                onChange={(e) => setVariableField(e.target.value)}
                placeholder={role === 'OWNER' ? "Nombre del negocio" : "Código del negocio"}
                disabled={isLoading}
                className={`w-full mt-4 px-4 py-3 text-base transition border-2 rounded-lg outline-none border-neutral-200 focus:border-rose-600 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-75 ${role === 'USER' ? 'bg-gray-100' : 'bg-white'}`}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 rounded-lg bg-gradient-to-br from-rose-600 to-orange-600 px-4 py-3 text-base font-semibold text-white shadow transition hover:translate-y-[-2px] hover:shadow-lg active:translate-y-0 disabled:opacity-75"
            >
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>
        )}

        {!isForgotPasswordMode && (
          <div className="pt-4 mt-6 text-center border-t border-neutral-200">
            {isLoginMode ? (
              <p className="text-sm text-neutral-600">
                ¿No tienes una cuenta?{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="p-0 font-semibold underline transition bg-transparent border-0 text-rose-600 underline-offset-2 hover:text-orange-500 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                >
                  Regístrate aquí
                </button>
              </p>
            ) : (
              <p className="text-sm text-neutral-600">
                ¿Ya tienes una cuenta?{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="p-0 font-semibold underline transition bg-transparent border-0 text-rose-600 underline-offset-2 hover:text-orange-500 focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                >
                  Inicia sesión
                </button>
              </p>
            )}
          </div>
        )}

        {isLoginMode && !isForgotPasswordMode && (
          <button
            type="button"
            onClick={handleForgotPassword}
            className="w-full p-0 mt-3 text-sm text-center underline transition bg-transparent border-0 text-rose-600 underline-offset-2 hover:text-orange-500 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
          >
            ¿Olvidaste tu contraseña?
          </button>
        )}
      </div>
    </div>

    {showSuccessMessage && (
      <Modal
        isOpen={showSuccessMessage}
        onClose={() => setShowSuccessMessage(false)}
        type="success"
        title="Cuenta creada de manera exitosa"
        confirmText="Entendido"
        showCancelButton={false}
        message="Ahora ya puede iniciar sesión..."
      />
    )}

    {showErrorModal && (
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        type="error"
        title="Error en el registro"
        confirmText="Intentar nuevamente"
        showCancelButton={false}
        message={error}
      />
    )}
  </div>
)
}