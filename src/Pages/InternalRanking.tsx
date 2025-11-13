import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/useAuth'
import { IoTrophy, IoFlame, IoTrendingUp, IoArrowUp } from 'react-icons/io5'
import LoadingScreen from '../components/LoadingScreen'

interface EmployeeRanking {
  id: string
  name: string
  lastName: string
  sales: number
  revenue: number
  position: number
}

interface BusinessPosition {
  businessName: string
  currentPosition: number
  currentSales: number
  nextPositionSales: number
  salesGap: number
}

// Datos mock para el ranking de empleados
// NOTA: En producción, uno de estos empleados debería tener el userId del empleado actual
const mockEmployeeRankings: EmployeeRanking[] = [
  { id: '1', name: 'María', lastName: 'González', sales: 89, revenue: 156000, position: 1 },
  { id: '2', name: 'Carlos', lastName: 'Rodríguez', sales: 76, revenue: 142000, position: 2 },
  { id: '3', name: 'Ana', lastName: 'Martínez', sales: 68, revenue: 128000, position: 3 },
  { id: 'current-user', name: 'Roberto', lastName: 'López', sales: 54, revenue: 98000, position: 4 }, // Simula ser el usuario actual
  { id: '5', name: 'Laura', lastName: 'Fernández', sales: 47, revenue: 87000, position: 5 },
  { id: '6', name: 'Diego', lastName: 'Sánchez', sales: 41, revenue: 76000, position: 6 },
  { id: '7', name: 'Sofía', lastName: 'Torres', sales: 35, revenue: 64000, position: 7 },
  { id: '8', name: 'Lucas', lastName: 'Ramírez', sales: 28, revenue: 52000, position: 8 },
]

// Datos mock para la posición del negocio
const mockBusinessPosition: BusinessPosition = {
  businessName: 'La Colmena Dorada',
  currentPosition: 1,
  currentSales: 450,
  nextPositionSales: 0, // Está en primer lugar
  salesGap: 0
}

// Versión alternativa si no está en primer lugar
const mockBusinessPosition2: BusinessPosition = {
  businessName: 'Mi Negocio',
  currentPosition: 5,
  currentSales: 365,
  nextPositionSales: 380,
  salesGap: 15
}

export default function InternalRanking() {
  const { user } = useAuth()
  const [employeeRankings, setEmployeeRankings] = useState<EmployeeRanking[]>([])
  const [businessPosition, setBusinessPosition] = useState<BusinessPosition | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const currentMonth = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  const isOwner = user?.role === 'OWNER'
  const isEmployee = user?.role === 'USER'

  // Encontrar el empleado actual (para empleados, no para owners)
  const currentUserEmployee = isEmployee 
    ? employeeRankings.find(emp => emp.id === 'current-user') // En producción: emp.id === user.id
    : null

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setEmployeeRankings(mockEmployeeRankings)
      // Alternar entre las dos posiciones para demostración
      setBusinessPosition(mockBusinessPosition2)
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

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return 'from-amber-500 to-yellow-600'
      case 2:
        return 'from-slate-400 to-gray-500'
      case 3:
        return 'from-orange-500 to-amber-600'
      default:
        return 'from-rose-500 to-orange-600'
    }
  }

  const getBorderColor = (position: number) => {
    switch (position) {
      case 1:
        return 'border-amber-400'
      case 2:
        return 'border-slate-300'
      case 3:
        return 'border-orange-400'
      default:
        return 'border-gray-200'
    }
  }

  const getMotivationalMessage = (position: BusinessPosition) => {
    if (position.currentPosition === 1) {
      return {
        title: '🎉 ¡Tu negocio está en el primer lugar!',
        message: 'Mantén este excelente trabajo y continúa liderando el ranking público. Cada venta cuenta para mantener la posición.',
        color: 'from-amber-500 to-yellow-600'
      }
    } else if (position.currentPosition <= 3) {
      return {
        title: `🏆 Tu negocio está en el puesto #${position.currentPosition}`,
        message: `¡Vas muy bien! Solo necesitas ${position.salesGap} ventas más para alcanzar el puesto #${position.currentPosition - 1}. El podio está cerca, ¡sigue adelante!`,
        color: 'from-orange-500 to-amber-600'
      }
    } else {
      return {
        title: `📊 Tu negocio está en el puesto #${position.currentPosition}`,
        message: `Necesitas ${position.salesGap} ventas más para subir al puesto #${position.currentPosition - 1}. ¡Cada venta te acerca más al top 3 del ranking público!`,
        color: 'from-rose-500 to-orange-600'
      }
    }
  }

  const getEmployeeMotivationalMessage = (employee: EmployeeRanking) => {
    const position = employee.position
    const nextEmployee = employeeRankings.find(emp => emp.position === position - 1)
    const salesGap = nextEmployee ? nextEmployee.sales - employee.sales : 0

    if (position === 1) {
      return {
        title: '👑 ¡Eres el Empleado del Mes!',
        message: '¡Increíble trabajo! Estás liderando el equipo. Sigue así para mantener tu corona.',
        color: 'from-amber-500 to-yellow-600',
        icon: '🎉'
      }
    } else if (position === 2) {
      return {
        title: `🥈 ¡Estás en el puesto #${position}!`,
        message: `¡Muy cerca de la cima! Solo necesitas ${salesGap} ventas más para alcanzar el primer lugar y convertirte en Empleado del Mes.`,
        color: 'from-slate-400 to-gray-500',
        icon: '💪'
      }
    } else if (position === 3) {
      return {
        title: `🥉 ¡Estás en el puesto #${position}!`,
        message: `¡Excelente trabajo! Necesitas ${salesGap} ventas más para subir al segundo lugar. ¡El podio es tuyo!`,
        color: 'from-orange-500 to-amber-600',
        icon: '🔥'
      }
    } else if (position <= 5) {
      return {
        title: `📊 Estás en el puesto #${position}`,
        message: `¡Buen ritmo! Solo ${salesGap} ventas más y estarás en el top 3. ¡Tú puedes lograrlo!`,
        color: 'from-blue-500 to-indigo-600',
        icon: '🚀'
      }
    } else {
      return {
        title: `📈 Estás en el puesto #${position}`,
        message: `Cada venta cuenta. Necesitas ${salesGap} ventas más para subir de posición. ¡Sigue adelante!`,
        color: 'from-rose-500 to-orange-600',
        icon: '💫'
      }
    }
  }

  if (isLoading) {
    return <LoadingScreen message="Cargando ranking..." />
  }

  const motivationalData = businessPosition ? getMotivationalMessage(businessPosition) : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#fff1eb] to-white">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f74116]/10 px-4 py-2 text-sm font-semibold text-[#f74116] mb-4">
            <IoTrophy className="w-4 h-4" />
            Ranking Interno
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            Rendimiento del Equipo
          </h1>
          <p className="text-gray-600 capitalize">
            {currentMonth}
          </p>
        </div>

        {/* Posición del Negocio */}
        {businessPosition && motivationalData && (
          <div className={`mb-8 bg-gradient-to-r ${motivationalData.color} rounded-2xl p-6 text-white shadow-lg`}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <h2 className="mb-2 text-2xl font-bold">
                  {motivationalData.title}
                </h2>
                <p className="mb-4 text-white/90">
                  {motivationalData.message}
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm">
                    <IoFlame className="w-5 h-5" />
                    <div>
                      <p className="text-xs text-white/80">Ventas actuales</p>
                      <p className="text-lg font-bold">{businessPosition.currentSales}</p>
                    </div>
                  </div>
                  {businessPosition.currentPosition > 1 && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm">
                      <IoArrowUp className="w-5 h-5" />
                      <div>
                        <p className="text-xs text-white/80">Para siguiente puesto</p>
                        <p className="text-lg font-bold">{businessPosition.salesGap} ventas</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl">
                <div className="text-center">
                  <p className="text-sm text-white/80">Posición</p>
                  <p className="text-4xl font-bold">#{businessPosition.currentPosition}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ranking de Empleados */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#f74116]/10 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Ranking de Empleados</h2>
            <p className="mt-1 text-sm text-gray-500">Los mejores vendedores del mes</p>
          </div>

          {/* Empleado del mes destacado */}
          {employeeRankings.length > 0 && (
            <div className="mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border-2 border-amber-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-4xl">👑</div>
                <div>
                  <p className="text-sm font-semibold text-amber-700">Empleado del Mes</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {employeeRankings[0].name} {employeeRankings[0].lastName}
                  </h3>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-lg">
                  <IoFlame className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-xs font-medium text-gray-600">Ventas</p>
                    <p className="text-xl font-bold text-gray-900">{employeeRankings[0].sales}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-lg">
                  <span className="text-lg">💰</span>
                  <div>
                    <p className="text-xs font-medium text-gray-600">Ingresos</p>
                    <p className="text-xl font-bold text-gray-900">
                      ${employeeRankings[0].revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Card motivacional para el empleado actual */}
          {isEmployee && currentUserEmployee && (
            <div className={`mb-6 bg-gradient-to-r ${getEmployeeMotivationalMessage(currentUserEmployee).color} rounded-xl p-6 text-white shadow-lg border-2 border-white/50`}>
              <div className="flex items-start gap-4">
                <div className="text-5xl">{getEmployeeMotivationalMessage(currentUserEmployee).icon}</div>
                <div className="flex-1">
                  <h3 className="mb-2 text-2xl font-bold">
                    {getEmployeeMotivationalMessage(currentUserEmployee).title}
                  </h3>
                  <p className="mb-4 text-white/90">
                    {getEmployeeMotivationalMessage(currentUserEmployee).message}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm">
                      <IoFlame className="w-5 h-5" />
                      <div>
                        <p className="text-xs text-white/80">Tus ventas</p>
                        <p className="text-xl font-bold">{currentUserEmployee.sales}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm">
                      <span className="text-lg">💰</span>
                      <div>
                        <p className="text-xs text-white/80">Tus ingresos</p>
                        <p className="text-xl font-bold">${(currentUserEmployee.revenue / 1000).toFixed(0)}k</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lista de empleados */}
          <div className="space-y-3">
            {employeeRankings.map((employee, index) => {
              const isCurrentUser = isEmployee && employee.id === 'current-user' // En producción: employee.id === user.id
              
              return (
                <div
                  key={employee.id}
                  className={`
                    p-4 rounded-xl border-2 transition-all duration-200
                    ${isCurrentUser ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400 ring-2 ring-blue-300 ring-offset-2' :
                      index === 0 ? 'bg-amber-50/50 border-amber-200' : 
                      index === 1 ? 'bg-slate-50/50 border-slate-200' : 
                      index === 2 ? 'bg-orange-50/50 border-orange-200' : 
                      'bg-gray-50/50 border-gray-200 hover:border-[#f74116]/30'}
                  `}
                >
                  {isCurrentUser && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="px-3 py-1 text-xs font-bold text-blue-700 bg-blue-200 rounded-full">
                        🌟 Tú
                      </div>
                    </div>
                  )}
                <div className="flex items-center justify-between gap-4">
                  {/* Posición y nombre */}
                  <div className="flex items-center flex-1 gap-4">
                    <div className="relative flex-shrink-0">
                      <div
                        className={`
                          flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold text-white
                          bg-gradient-to-br ${getPositionColor(employee.position)}
                        `}
                      >
                        {employee.position}
                      </div>
                      {getMedalEmoji(employee.position) && (
                        <div className="absolute text-2xl -top-1 -right-1">
                          {getMedalEmoji(employee.position)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {employee.name} {employee.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {employee.position === 1 ? 'Empleado del Mes' : `Posición #${employee.position}`}
                      </p>
                    </div>
                  </div>

                  {/* Estadísticas */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <IoFlame className="w-4 h-4 text-orange-500" />
                        <p className="text-xs font-medium text-gray-600">Ventas</p>
                      </div>
                      <p className="text-xl font-bold text-gray-900">{employee.sales}</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <span className="text-sm">💰</span>
                        <p className="text-xs font-medium text-gray-600">Ingresos</p>
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        ${(employee.revenue / 1000).toFixed(0)}k
                      </p>
                    </div>
                  </div>
                </div>

                {/* Barra de progreso para top 3 */}
                {employee.position <= 3 && (
                  <div className="mt-3">
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`h-full bg-gradient-to-r ${getPositionColor(employee.position)} transition-all duration-500`}
                        style={{ width: `${(employee.sales / employeeRankings[0].sales) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )
            })}
          </div>

          {/* Mensaje motivacional para empleados */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💪</div>
              <div>
                <h4 className="mb-1 font-semibold text-gray-900">
                  ¡Sigue mejorando tu rendimiento!
                </h4>
                <p className="text-sm text-gray-700">
                  Cada venta que realizas contribuye tanto a tu posición en el ranking de empleados como a la posición del negocio en el ranking público. ¡Trabajemos juntos para llegar a la cima!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card informativa sobre el ranking público */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-[#f74116]/10 p-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#f74116]/10 to-[#f74116]/20">
              <IoTrendingUp className="w-6 h-6 text-[#f74116]" />
            </div>
            <div className="flex-1">
              <h3 className="mb-2 text-lg font-bold text-gray-900">
                ¿Sabías que hay un ranking público?
              </h3>
              <p className="mb-3 text-sm text-gray-600">
                Todos los negocios compiten en un ranking público mensual. Cuantas más ventas realice tu equipo, mejor será la posición y visibilidad de tu negocio.
              </p>
              <button 
                onClick={() => window.open('/ranking', '_blank')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#f74116] hover:text-[#f74116]/80 transition-colors group"
              >
                Ver ranking público
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
