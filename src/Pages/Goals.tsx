import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoadingScreen from '../components/LoadingScreen'

interface Goal {
  id: string
  name: string
  startDate: string
  endDate: string
  currentProgress: number
  targetProgress: number
  totalAmount: number
  categoriesCompleted: number
  totalCategories: number
}

// Mock data para las metas
const mockGoals: Goal[] = [
  {
    id: '1',
    name: 'Aumentar ventas mensuales',
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    currentProgress: 110000,
    targetProgress: 100000,
    totalAmount: 110000,
    categoriesCompleted: 2,
    totalCategories: 3
  },
  {
    id: '2',
    name: 'Reducir costos de inventario',
    startDate: '2025-02-01',
    endDate: '2025-04-15',
    currentProgress: 8500,
    targetProgress: 12000,
    totalAmount: 12000,
    categoriesCompleted: 1,
    totalCategories: 3
  },
  {
    id: '3',
    name: 'Incrementar clientes recurrentes',
    startDate: '2025-01-15',
    endDate: '2025-05-30',
    currentProgress: 450,
    targetProgress: 600,
    totalAmount: 600,
    categoriesCompleted: 3,
    totalCategories: 3
  },
  {
    id: '4',
    name: 'Mejorar rating promedio',
    startDate: '2025-03-01',
    endDate: '2025-06-30',
    currentProgress: 4.2,
    targetProgress: 4.8,
    totalAmount: 4.8,
    categoriesCompleted: 1,
    totalCategories: 3
  },
  {
    id: '5',
    name: 'Expandir catálogo de productos',
    startDate: '2025-07-15',
    endDate: '2025-11-15',
    currentProgress: 25,
    targetProgress: 50,
    totalAmount: 50,
    categoriesCompleted: 0,
    totalCategories: 3
  }
]

function Goals() {
  const navigate = useNavigate()
  const [loading] = useState(false)

  // Función para calcular días restantes
  const calculateDaysRemaining = (endDate: string): number => {
    const today = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Función para formatear fechas
  const formatDateRange = (startDate: string, endDate: string): string => {
    const start = new Date(startDate)
    const end = new Date(endDate)

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      }).toLowerCase()
    }

    return `${formatDate(start)} - ${formatDate(end)}`
  }

  // Función para formatear valores según el tipo de meta
  const formatValue = (value: number, goal: Goal): string => {
    if (goal.name.toLowerCase().includes('ventas') || goal.name.toLowerCase().includes('costos') || goal.name.toLowerCase().includes('monto')) {
      return `$${value.toLocaleString()}`
    }
    if (goal.name.toLowerCase().includes('rating')) {
      return value.toFixed(1)
    }
    return value.toString()
  }

  if (loading) {
    return <LoadingScreen message="Cargando metas..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#fff1eb] to-white">
      <div className="px-4 py-8 pb-24 mx-auto max-w-7xl sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f74116]/10 px-4 py-2 text-sm font-semibold text-[#f74116] mb-4">
            <span className="h-2 w-2 rounded-full bg-[#f74116]" />
            Metas del Negocio
          </div>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Seguimiento de objetivos
          </h1>
          <p className="mt-2 text-gray-600">Monitorea el progreso de tus metas comerciales</p>
        </div>

        {/* Tabla de metas */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#f74116]/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Metas Activas</h2>
                <p className="text-sm text-gray-600">Objetivos y progreso actual</p>
              </div>
              <button
                onClick={() => navigate('/goals/create')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#f74116] text-white text-sm font-medium rounded-lg hover:bg-[#f74116]/90 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Crear Meta
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                    Nombre de la meta
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                    Período
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                    Días restantes
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                    Categorías cumplidas
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                    Monto total
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockGoals.map((goal) => {
                  const daysRemaining = calculateDaysRemaining(goal.endDate)

                  return (
                    <tr key={goal.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{goal.name}</div>
                        <div className="text-sm text-gray-500">
                          Meta: <span className="font-semibold text-[#f74116]">{formatValue(goal.totalAmount, goal)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDateRange(goal.startDate, goal.endDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          daysRemaining < 0 ? 'text-red-600' :
                          daysRemaining <= 7 ? 'text-orange-600' :
                          'text-gray-900'
                        }`}>
                          {daysRemaining < 0 ? 'Vencida' : `${daysRemaining} días`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          goal.categoriesCompleted === goal.totalCategories ? 'text-green-600' :
                          goal.categoriesCompleted > 0 ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {goal.categoriesCompleted}/{goal.totalCategories}
                        </div>
                        <div className="text-xs text-gray-500">
                          {goal.categoriesCompleted === goal.totalCategories ? 'Completado' :
                           goal.categoriesCompleted > 0 ? 'En progreso' : 'Sin iniciar'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${goal.totalAmount.toLocaleString()}
                        </div>
                      </td>
                      <td className="flex items-center justify-center px-6 py-4 text-sm font-medium whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/goals/${goal.id}`)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-[#f74116] bg-[#f74116]/10 rounded-lg hover:bg-[#f74116]/20 transition-colors"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {mockGoals.length === 0 && (
            <div className="px-6 py-12 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-1 text-sm font-medium text-gray-900">No hay metas activas</h3>
              <p className="text-sm text-gray-500">Crea tu primera meta para comenzar a trackear objetivos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Goals