import { useState } from 'react'
import korvenLogo from '../assets/Korven_logo.png'
import { AuthService } from '../services/loginService'
import SuccesOperation from '../components/SuccesOperation'
import { IoEye, IoEyeOff } from 'react-icons/io5'
import { useAuth } from '../contexts/useAuth'

export default function Authentication() {
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState<'OWNER' | 'USER'>('OWNER')

  const [isLoginMode, setIsLoginMode] = useState(true)
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false)
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
      console.log('Login exitoso:', response)
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
      else setError('Error inesperado. Intenta nuevamente.')
      console.error('Error en login:', err)
    } finally {
      setIsLoading(false)
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
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
      else setError('Error inesperado durante el registro. Intenta nuevamente.')
      console.error('Error en registro:', err)
    } finally {
      setIsLoading(false)
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

    setIsLoading(true)
    try {
      const response = await AuthService.forgotPassword({ email })
      console.log('Correo de recuperación enviado:', response)
      setIsForgotPasswordMode(false)
      setEmail('')
    } catch {
      setError('Error al enviar el correo de recuperación. Intenta nuevamente.')
    } finally {
      setIsLoading(false)
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
    setIsLoading(false)
    setError('')
  }

  return (
    <div className="fixed inset-0 m-0 flex h-screen w-screen p-0">
      {/* Left */}
      <div className="relative flex-1 basis-3/5 overflow-hidden bg-gradient-to-br from-rose-600 via-orange-500 to-amber-500 flex items-center justify-center">
        {/* radial glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(253,118,0,0.12)_0%,transparent_70%)]" />
        <div className="relative z-10 flex h-full max-w-full flex-col items-center justify-center px-8 pb-6 pt-12 text-white">
          <img
            src={korvenLogo}
            alt="Logo Korven"
            className="max-w-[850px] max-h-[750px] w-auto h-auto drop-shadow-lg animate-gentle-float mb-8"
          />
          <h4 className="w-full text-center text-lg font-normal leading-relaxed tracking-wide text-white/95 drop-shadow">
            En la tradición europea, mucho antes de las colmenas modernas, las abejas vivían en cestas de mimbre, donde cada abeja encontraba su rol y la comunidad prosperaba. Esas cestas no eran solo un contenedor, eran símbolo de orden, cooperación y productividad. Inspirados en esa historia, nace Korven, la aplicación que convierte cada bar y restaurante en una colmena digital perfectamente organizada.
          </h4>
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 basis-2/5 bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-md p-6">
          <h1 className="text-center text-3xl font-semibold text-neutral-800 mb-8">
            {isForgotPasswordMode ? 'Recuperar Contraseña' : isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h1>

          {isForgotPasswordMode ? (
            <form onSubmit={handleForgotPasswordSubmit} className="flex flex-col">
              {error && (
                <div className="mb-5 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <p className="mb-6 text-center text-sm leading-relaxed text-neutral-600">
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
                  className="w-full rounded-lg border-2 border-neutral-200 px-4 py-3 text-base outline-none transition focus:border-rose-600 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-75"
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
                className="mt-4 w-full border-0 bg-transparent p-0 text-center text-sm font-semibold text-amber-500 underline underline-offset-2 transition hover:text-orange-500 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 disabled:opacity-75"
              >
                Volver al inicio de sesión
              </button>
            </form>
          ) : isLoginMode ? (
            <form onSubmit={handleLogin} className="flex flex-col">
              {error && (
                <div className="mb-5 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
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
                  className="w-full rounded-lg border-2 border-neutral-200 px-4 py-3 text-base outline-none transition focus:border-rose-600 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-75"
                />
              </div>

              <div className="mt-4 flex flex-col gap-1">
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
                    className="w-full rounded-lg border-2 border-neutral-200 px-4 py-3 pr-10 text-base outline-none transition focus:border-rose-600 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-75"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-500 transition active:scale-95 disabled:opacity-50"
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
                <div className="mb-5 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
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
                    className="w-full rounded-lg border-2 border-neutral-200 px-4 py-3 text-base outline-none transition focus:border-rose-600 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-75"
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
                    className="w-full rounded-lg border-2 border-neutral-200 px-4 py-3 text-base outline-none transition focus:border-rose-600 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-75"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-1">
                <label htmlFor="email-reg" className="text-sm font-medium text-neutral-700">Correo electrónico</label>
                <input
                  type="email"
                  id="email-reg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ingresa tu correo electrónico"
                  disabled={isLoading}
                  className="w-full rounded-lg border-2 border-neutral-200 px-4 py-3 text-base outline-none transition focus:border-rose-600 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-75"
                />
              </div>

              <div className="mt-4 flex flex-col gap-1">
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
                    className="w-full rounded-lg border-2 border-neutral-200 px-4 py-3 pr-10 text-base outline-none transition focus:border-rose-600 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-75"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-500 transition active:scale-95 disabled:opacity-50"
                  >
                    {showPassword ? <IoEye size={20} /> : <IoEyeOff size={20} /> }
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-1">
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
                    className="w-full rounded-lg border-2 border-neutral-200 px-4 py-3 pr-10 text-base outline-none transition focus:border-rose-600 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-75"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                    aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-500 transition active:scale-95 disabled:opacity-50"
                  >
                    {showConfirmPassword ? <IoEye size={20} /> : <IoEyeOff size={20} /> }
                  </button>
                </div>
              </div>

              <div className="password-requirements">
                <p>La contraseña debe contener:</p>
                <ul>
                  <li className={password.length >= 8 ? 'valid' : ''}>
                    Al menos 8 caracteres
                  </li>
                  <li className={/(?=.*[a-z])/.test(password) ? 'valid' : ''}>
                    Una letra minúscula
                  </li>
                  <li className={/(?=.*[A-Z])/.test(password) ? 'valid' : ''}>
                    Una letra mayúscula
                  </li>
                  <li className={/(?=.*\d)/.test(password) ? 'valid' : ''}>
                    Un número
                  </li>
                </ul>
              </div>

              <div className="mt-4 flex flex-col gap-1">
                <label htmlFor="role" className="text-sm font-medium text-neutral-900">Tipo de usuario</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'OWNER' | 'USER')}
                  disabled={isLoading}
                  className="w-full rounded-lg border-2 border-neutral-200 bg-white px-4 py-3 text-base text-neutral-900 outline-none transition focus:border-rose-600 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-75"
                >
                  <option value="OWNER">Propietario del negocio</option>
                  <option value="USER">Empleado</option>
                </select>
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
            <div className="mt-6 border-t border-neutral-200 pt-4 text-center">
              {isLoginMode ? (
                <p className="text-sm text-neutral-600">
                  ¿No tienes una cuenta?{' '}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="border-0 bg-transparent p-0 font-semibold text-rose-600 underline underline-offset-2 transition hover:text-orange-500 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
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
                    className="border-0 bg-transparent p-0 font-semibold text-rose-600 underline underline-offset-2 transition hover:text-orange-500 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
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
              className="mt-3 w-full border-0 bg-transparent p-0 text-center text-sm text-rose-600 underline underline-offset-2 transition hover:text-orange-500 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
            >
              ¿Olvidaste tu contraseña?
            </button>
          )}
        </div>
      </div>

      {showSuccessMessage && (
        <SuccesOperation
          message="Ahora ya puede iniciar sesión..."
          onClose={() => setShowSuccessMessage(false)}
        />
      )}
    </div>
  )
}
