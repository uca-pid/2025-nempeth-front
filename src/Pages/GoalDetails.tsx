import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import LoadingScreen from '../components/LoadingScreen'

interface GoalCategory {
  id: string
  name: string
  icon: string
  currentAmount: number
  targetAmount: number
}

// Mock data para las categorías de una meta específica
const getMockGoalCategories = (goalId: string): GoalCategory[] => {
  const categoriesData: Record<string, GoalCategory[]> = {
    '1': [ // Aumentar ventas mensuales
      { id: '1-1', name: 'Ventas Online', icon: '🛒', currentAmount: 45000, targetAmount: 40000 },
      { id: '1-2', name: 'Ventas Presenciales', icon: '🏪', currentAmount: 35000, targetAmount: 30000 },
      { id: '1-3', name: 'Ventas por Mayor', icon: '📦', currentAmount: 30000, targetAmount: 40000 }
    ],
    '2': [ // Reducir costos de inventario
      { id: '2-1', name: 'Costo de Almacenamiento', icon: '📦', currentAmount: 3500, targetAmount: 5000 },
      { id: '2-2', name: 'Pérdidas por Vencimiento', icon: '⏰', currentAmount: 2500, targetAmount: 4000 },
      { id: '2-3', name: 'Costos de Transporte', icon: '🚚', currentAmount: 2500, targetAmount: 3000 }
    ],
    '3': [ // Incrementar clientes recurrentes
      { id: '3-1', name: 'Clientes Mensuales', icon: '👥', currentAmount: 180, targetAmount: 200 },
      { id: '3-2', name: 'Clientes Trimestrales', icon: '📅', currentAmount: 150, targetAmount: 200 },
      { id: '3-3', name: 'Clientes Anuales', icon: '🎯', currentAmount: 120, targetAmount: 200 }
    ],
    '4': [ // Mejorar rating promedio
      { id: '4-1', name: 'Rating de Servicio', icon: '⭐', currentAmount: 4.3, targetAmount: 4.5 },
      { id: '4-2', name: 'Rating de Producto', icon: '📦', currentAmount: 4.1, targetAmount: 4.5 },
      { id: '4-3', name: 'Rating de Entrega', icon: '🚚', currentAmount: 4.2, targetAmount: 4.5 }
    ],
    '5': [ // Expandir catálogo de productos
      { id: '5-1', name: 'Productos Nuevos', icon: '🆕', currentAmount: 15, targetAmount: 20 },
      { id: '5-2', name: 'Categorías Nuevas', icon: '📂', currentAmount: 8, targetAmount: 15 },
      { id: '5-3', name: 'Variantes de Producto', icon: '🔄', currentAmount: 2, targetAmount: 15 }
    ]
  }

  return categoriesData[goalId] || []
}

function GoalDetails() {
  const navigate = useNavigate()
  const { goalId } = useParams<{ goalId: string }>()
  const [loading, setLoading] = useState(true)
  const [goalName, setGoalName] = useState('')
  const [categories, setCategories] = useState<GoalCategory[]>([])

  useEffect(() => {
    if (!goalId) {
      navigate('/goals')
      return
    }

    // Simular carga de datos
    const loadGoalDetails = async () => {
      setLoading(true)

      // Mock goal names
      const goalNames: Record<string, string> = {
        '1': 'Aumentar ventas mensuales',
        '2': 'Reducir costos de inventario',
        '3': 'Incrementar clientes recurrentes',
        '4': 'Mejorar rating promedio',
        '5': 'Expandir catálogo de productos'
      }

      setGoalName(goalNames[goalId] || 'Meta no encontrada')
      setCategories(getMockGoalCategories(goalId))

      setLoading(false)
    }

    loadGoalDetails()
  }, [goalId, navigate])

  // Función para calcular el porcentaje de progreso
  const calculateProgressPercentage = (current: number, target: number): number => {
    return Math.min((current / target) * 100, 200) // Máximo 200% para mostrar overflow
  }

  // Función para determinar el color de la barra de progreso
  const getProgressBarColor = (percentage: number): string => {
    if (percentage > 105) return 'bg-gradient-to-r from-green-400 to-purple-500' // Gradiente verde-violeta para sobrepasar meta
    if (percentage >= 100) return 'bg-green-500' // Verde para completado
    if (percentage >= 75) return 'bg-yellow-500' // Amarillo para casi completado
    if (percentage >= 50) return 'bg-orange-500' // Naranja para medio camino
    return 'bg-red-500' // Rojo para bajo progreso
  }

  // Función para formatear valores
  const formatValue = (value: number, category: GoalCategory): string => {
    if (category.name.toLowerCase().includes('rating')) {
      return value.toFixed(1)
    }
    if (category.name.toLowerCase().includes('costo') || category.name.toLowerCase().includes('venta')) {
      return `$${value.toLocaleString()}`
    }
    return value.toString()
  }

  // Calcular totales
  const totalCurrent = categories.reduce((sum, cat) => sum + cat.currentAmount, 0)
  const totalTarget = categories.reduce((sum, cat) => sum + cat.targetAmount, 0)
  const totalProgress = categories.length > 0 ? calculateProgressPercentage(totalCurrent, totalTarget) : 0

  if (loading) {
    return <LoadingScreen message="Cargando detalles de la meta..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#fff1eb] to-white">
      <div className="px-4 py-8 pb-24 mx-auto max-w-7xl sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f74116]/10 px-4 py-2 text-sm font-semibold text-[#f74116] mb-4">
            <span className="h-2 w-2 rounded-full bg-[#f74116]" />
            Detalles de Meta
          </div>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {goalName}
          </h1>
          <p className="mt-2 text-gray-600">Seguimiento detallado por categorías</p>
        </div>

        {/* Resumen general */}
        <div className="mb-6 bg-white rounded-2xl shadow-sm border border-[#f74116]/10 p-6">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Resumen General</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#f74116]">${totalCurrent.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Actual</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">${totalTarget.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Meta Total</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-600">
                {totalProgress.toFixed(1)}%
                {totalProgress > 100 && (
                  <svg className="w-5 h-5 text-orange-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="text-sm text-gray-600">Progreso Total</div>
            </div>
          </div>

          {/* Barra de progreso general */}
          <div className="mt-4">
            <div className="w-full h-3 overflow-hidden bg-gray-200 rounded-full">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${getProgressBarColor(totalProgress)}`}
                style={{ width: `${Math.min(totalProgress, 150)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tabla de categorías */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#f74116]/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Categorías</h2>
                <p className="text-sm text-gray-600">Progreso individual por categoría</p>
              </div>
              <button
                onClick={() => navigate('/goals')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver a Metas
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                    Categoría
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                    Monto Actual
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                    Meta
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                    Progreso
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((category) => {
                  const progressPercentage = calculateProgressPercentage(category.currentAmount, category.targetAmount)
                  const progressBarColor = getProgressBarColor(progressPercentage)

                  return (
                    <tr key={category.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{category.icon}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatValue(category.currentAmount, category)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatValue(category.targetAmount, category)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-500">
                                {progressPercentage.toFixed(1)}%
                              </span>
                              {progressPercentage > 100 && (
                                <svg className="w-3 h-3 text-orange-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div className="w-full h-2 overflow-hidden bg-gray-200 rounded-full">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${progressBarColor}`}
                                style={{ width: `${Math.min(progressPercentage, 150)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {categories.length === 0 && (
            <div className="px-6 py-12 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-1 text-sm font-medium text-gray-900">No hay categorías</h3>
              <p className="text-sm text-gray-500">Esta meta no tiene categorías configuradas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GoalDetails