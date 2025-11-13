import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoArrowBack, IoTrophy, IoFlame, IoStar } from 'react-icons/io5'
import Lottie from 'lottie-react'
import LoadingScreen from '../components/LoadingScreen'
import beeAnimation from '../assets/HoneyBee.json'

interface BusinessRanking {
  id: string
  businessName: string
  sales: number
  revenue: number
  score: number
  position: number
}

// Datos mock para el ranking
const mockRankingData: BusinessRanking[] = [
  { id: '1', businessName: 'La Colmena Dorada', sales: 450, revenue: 85000, score: 98.5, position: 1 },
  { id: '2', businessName: 'El Panal Místico', sales: 425, revenue: 78000, score: 95.2, position: 2 },
  { id: '3', businessName: 'Néctar & Miel Bar', sales: 400, revenue: 72000, score: 92.8, position: 3 },
  { id: '4', businessName: 'Zumbido Urbano', sales: 380, revenue: 68000, score: 88.4, position: 4 },
  { id: '5', businessName: 'La Abeja Reina', sales: 365, revenue: 64000, score: 85.7, position: 5 },
  { id: '6', businessName: 'Polen & Sabor', sales: 340, revenue: 59000, score: 82.3, position: 6 },
  { id: '7', businessName: 'El Enjambre Feliz', sales: 320, revenue: 55000, score: 79.5, position: 7 },
  { id: '8', businessName: 'Dulce Panal', sales: 295, revenue: 51000, score: 76.2, position: 8 },
  { id: '9', businessName: 'La Miel de Oro', sales: 270, revenue: 47000, score: 73.8, position: 9 },
  { id: '10', businessName: 'Korven Express', sales: 250, revenue: 43000, score: 70.5, position: 10 },
]

export default function Ranking() {
  const navigate = useNavigate()
  const [rankings, setRankings] = useState<BusinessRanking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const currentMonth = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setRankings(mockRankingData)
      setIsLoading(false)
    }, 1000)
  }, [])

  const getMedalEmoji = (position: number) => {
    switch (position) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return null
    }
  }

  const getPositionStyle = (position: number) => {
    switch (position) {
      case 1:
        return 'from-amber-400 via-yellow-300 to-amber-500'
      case 2:
        return 'from-slate-300 via-gray-200 to-slate-400'
      case 3:
        return 'from-orange-400 via-amber-600 to-orange-500'
      default:
        return 'from-rose-100 to-orange-100'
    }
  }

  const getCardScale = (position: number) => {
    switch (position) {
      case 1:
        return 'scale-105'
      case 2:
        return 'scale-102'
      case 3:
        return 'scale-101'
      default:
        return 'scale-100'
    }
  }

  const getBorderGlow = (position: number) => {
    switch (position) {
      case 1:
        return 'shadow-2xl shadow-amber-400/50 border-amber-400'
      case 2:
        return 'shadow-xl shadow-slate-300/50 border-slate-300'
      case 3:
        return 'shadow-lg shadow-orange-400/50 border-orange-400'
      default:
        return 'shadow-md shadow-rose-200/30 border-rose-200'
    }
  }

  if (isLoading) {
    return <LoadingScreen message="Cargando ranking..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header con animación de panal */}
      <div className="relative overflow-hidden bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500">
        {/* Patrón de hexágonos decorativos */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 transform rotate-45 bg-white rounded-lg animate-pulse"></div>
          <div className="absolute w-24 h-24 delay-100 transform bg-white rounded-lg top-10 right-10 rotate-12 animate-pulse"></div>
          <div className="absolute delay-200 transform bg-white rounded-lg bottom-10 left-20 w-28 h-28 -rotate-12 animate-pulse"></div>
        </div>

        <div className="relative px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 mb-6 text-white transition rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm"
          >
            <IoArrowBack size={20} />
            <span className="font-medium">Volver</span>
          </button>

          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <IoTrophy className="text-5xl text-yellow-300 animate-bounce" />
              <h1 className="text-4xl font-bold text-white md:text-6xl drop-shadow-lg">
                Ranking Korven
              </h1>
              <IoTrophy className="text-5xl text-yellow-300 animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-10 h-10 animate-bounce" style={{ animationDelay: '0.1s' }}>
                <Lottie animationData={beeAnimation} loop />
              </div>
              <p className="text-xl font-semibold text-white md:text-2xl drop-shadow">
                Top 10 Negocios del Mes
              </p>
              <div className="w-10 h-10 animate-bounce" style={{ animationDelay: '0.3s' }}>
                <Lottie animationData={beeAnimation} loop />
              </div>
            </div>

            <p className="text-lg capitalize text-white/90 drop-shadow">
              {currentMonth}
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 mt-4 text-sm font-medium text-white rounded-full bg-white/20 backdrop-blur-sm">
              <IoFlame className="text-orange-300" />
              <span>Los negocios más productivos de la colmena</span>
              <IoFlame className="text-orange-300" />
            </div>
          </div>
        </div>

        {/* Onda decorativa inferior */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#fffbeb"
            />
          </svg>
        </div>
      </div>

      {/* Contenedor principal del ranking */}
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="space-y-4">
          {rankings.map((business, index) => (
            <div
              key={business.id}
              className={`
                relative transform transition-all duration-500 hover:scale-[1.02]
                ${getCardScale(business.position)}
                animate-fade-in-up
              `}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Partículas de celebración para top 3 */}
              {business.position <= 3 && (
                <>
                  <div className="absolute z-0 text-2xl animate-float -top-2 -left-2">✨</div>
                  <div className="absolute z-0 text-2xl animate-float -top-2 -right-2" style={{ animationDelay: '0.5s' }}>✨</div>
                  {business.position === 1 && (
                    <>
                      <div className="absolute z-0 text-xl animate-float top-1/2 -left-3" style={{ animationDelay: '0.2s' }}>🎉</div>
                      <div className="absolute z-0 text-xl animate-float top-1/2 -right-3" style={{ animationDelay: '0.7s' }}>🎉</div>
                    </>
                  )}
                </>
              )}

              <div
                className={`
                  relative z-10 overflow-hidden border-4 rounded-2xl bg-gradient-to-r
                  ${getPositionStyle(business.position)}
                  ${getBorderGlow(business.position)}
                `}
              >
                <div className="p-6 bg-white/80 backdrop-blur-sm">
                  <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    {/* Posición y nombre */}
                    <div className="flex items-center flex-1 gap-4">
                      <div className="relative">
                        <div
                          className={`
                            flex items-center justify-center rounded-full w-16 h-16 text-2xl font-bold
                            ${business.position <= 3 ? 'bg-gradient-to-br ' + getPositionStyle(business.position) + ' text-white shadow-lg' : 'bg-gradient-to-br from-rose-500 to-orange-500 text-white'}
                          `}
                        >
                          {business.position}
                        </div>
                        {getMedalEmoji(business.position) && (
                          <div className="absolute text-3xl -top-1 -right-1 animate-bounce">
                            {getMedalEmoji(business.position)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="flex items-center gap-2 text-xl font-bold text-neutral-800 md:text-2xl">
                          {business.businessName}
                          {business.position === 1 && (
                            <IoStar className="text-2xl text-amber-500 animate-pulse" />
                          )}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-neutral-600">
                          <span className="flex items-center gap-1">
                            <span className="font-semibold">Puntuación:</span>
                            <span className="px-2 py-1 text-xs font-bold text-white rounded-full bg-gradient-to-r from-rose-500 to-orange-500">
                              {business.score.toFixed(1)}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Estadísticas */}
                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <IoFlame className="text-orange-500" />
                          <p className="text-xs font-medium text-neutral-600">Ventas</p>
                        </div>
                        <p className="text-2xl font-bold text-neutral-800">{business.sales}</p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <span className="text-sm">💰</span>
                          <p className="text-xs font-medium text-neutral-600">Ingresos</p>
                        </div>
                        <p className="text-2xl font-bold text-neutral-800">
                          ${business.revenue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Barra de progreso decorativa para top 3 */}
                  {business.position <= 3 && (
                    <div className="mt-4">
                      <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
                        <div
                          className={`h-full bg-gradient-to-r ${getPositionStyle(business.position)} animate-shimmer`}
                          style={{ width: `${business.score}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Abejas animadas para el primer lugar */}
                {business.position === 1 && (
                  <>
                    <div className="absolute w-16 h-16 animate-fly-across top-4">
                      <Lottie animationData={beeAnimation} loop />
                    </div>
                    <div className="absolute w-12 h-12 bottom-4 animate-fly-across" style={{ animationDelay: '2s', animationDuration: '8s' }}>
                      <Lottie animationData={beeAnimation} loop />
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer motivacional */}
        <div className="p-6 mt-12 text-center border-4 shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl border-amber-300">
          <h3 className="flex items-center justify-center gap-2 mb-3 text-2xl font-bold text-transparent bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text">
            <span className="text-3xl animate-bounce">🎯</span>
            ¡Trabaja duro y escala posiciones!
            <span className="text-3xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎯</span>
          </h3>
          <p className="flex items-center justify-center gap-2 text-neutral-700">
            Cada venta cuenta. Cada cliente es importante. ¡Lleva tu negocio a la cima de la colmena!
            <span className="inline-block w-8 h-8">
              <Lottie animationData={beeAnimation} loop />
            </span>
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-2xl animate-pulse">🍯</span>
            <span className="text-2xl animate-pulse" style={{ animationDelay: '0.3s' }}>🌟</span>
            <span className="text-2xl animate-pulse" style={{ animationDelay: '0.6s' }}>🏆</span>
          </div>
        </div>
      </div>

      {/* Estilos personalizados */}
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(5deg);
          }
        }

        @keyframes fly-across {
          0% {
            left: -50px;
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(10deg);
          }
          100% {
            left: calc(100% + 50px);
            transform: rotate(0deg);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -100% 0;
          }
          100% {
            background-position: 100% 0;
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-fly-across {
          animation: fly-across 10s linear infinite;
        }

        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  )
}
