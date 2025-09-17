import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import korvenLogo from '../assets/bee.jpeg'
import { useAuth } from '../contexts/useAuth'
import { IoArrowRedoSharp } from 'react-icons/io5'

function Home() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const userName = user?.name || 'Usuario'
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

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header Principal */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex w-full flex-col gap-3 px-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:px-3 md:h-[70px] md:px-5">
          <div className="flex items-center gap-3 rounded-[13px] p-1">
            <img src={korvenLogo} className="h-9 w-auto rounded-xl md:h-11" alt="Korven Logo" />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold leading-tight text-gray-900 md:text-2xl">Korven</h1>
              <span className="text-xs font-medium text-gray-600 md:text-sm">Sistema de Gestión</span>
            </div>
          </div>

          <div className="flex items-center">
            <div className="relative" ref={userMenuRef}>
              <div
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-transparent px-3 py-2 transition hover:border-gray-200 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f74116]"
                onClick={toggleUserMenu}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    toggleUserMenu()
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#f74116] to-[#f59e0b] font-semibold text-white md:h-10 md:w-10">
                  <span className="text-base md:text-lg">{userName.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold text-gray-900">{userName}</span>
                  <span className="text-xs text-gray-500">Administrador</span>
                </div>
                <svg
                  className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
              </div>

              {showUserMenu && (
                <div className="absolute left-4 right-4 top-full z-50 mt-1 origin-top rounded-xl border border-gray-200 bg-white p-2 shadow-xl md:left-auto md:right-0 md:w-56">
                  <button
                    onClick={handleProfileClick}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f74116]"
                  >
                    Mi Perfil
                  </button>
                  <div className="my-2 h-px bg-gray-200" />
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-[#fee2e2] hover:text-[#ef4444] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f74116]"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">¡Bienvenido a Korven!</h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg">
            Sistema integral de gestión para bares y restaurantes
          </p>
        </div>

        <div className="mb-8 flex flex-col items-center gap-6">
          <div
            className="flex w-full max-w-5xl cursor-pointer flex-col gap-6 rounded-2xl border border-emerald-500 bg-white p-5 shadow-lg transition duration-300 hover:-translate-y-0.5 hover:border-[#f74116] hover:shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f74116] md:min-h-[100px] md:flex-row md:items-center md:gap-8"
            onClick={handleProductsClick}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                handleProductsClick()
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div className="flex flex-shrink-0 items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-100 text-4xl md:h-20 md:w-20 md:text-5xl">
                🍽️
              </div>
            </div>

            <div className="flex w-full flex-1 flex-col md:flex-row md:items-stretch md:gap-10">
              <div className="flex min-w-[240px] flex-1 flex-col gap-2">
                <h3 className="text-xl font-bold text-gray-900 md:text-[1.35rem]">Gestión de Productos</h3>
                <div className="flex flex-col gap-1 text-sm font-medium text-gray-600">
                  <span>• Crear y editar productos</span>
                  <span>• Gestionar categorías</span>
                  <span>• Control de precios</span>
                  <span>• Seguimiento de stock</span>
                </div>
              </div>

              <div className="hidden w-px -translate-x-10 bg-gray-200 md:block" />

              <div className="flex max-w-xs items-center md:pl-6">
                <p className="text-sm leading-relaxed text-gray-600">
                  Administra tu carta, precios, categorías y stock de productos de manera integral
                </p>
              </div>
            </div>

            <div className="flex flex-shrink-0 justify-center">
              <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f74116] text-white transition hover:-translate-y-0.5 hover:bg-[#e73d14] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f74116] md:h-20 md:w-20">
                <IoArrowRedoSharp className="h-6 w-6 md:h-10 md:w-10" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home
