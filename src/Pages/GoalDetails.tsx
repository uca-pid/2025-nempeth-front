import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import LoadingScreen from '../components/LoadingScreen'
import { GoalsService, type GoalReportResponse } from '../services/goalsService'
import { useAuth } from '../contexts/useAuth'
import { categoryService } from '../services/categoryService'
import type { Category } from '../services/categoryService'
import DateRangePicker from '../components/DateRangePicker'

interface CategoryAmount {
  categoryId: string
  categoryName: string
  amount: number
}

function GoalDetails() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { goalId } = useParams<{ goalId: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [goalReport, setGoalReport] = useState<GoalReportResponse | null>(null)

  // Estados para el modal de edición
  const [showEditModal, setShowEditModal] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [editGoalName, setEditGoalName] = useState('')
  const [editStartDate, setEditStartDate] = useState('')
  const [editEndDate, setEditEndDate] = useState('')
  const [editCategories, setEditCategories] = useState<CategoryAmount[]>([])
  const [availableCategories, setAvailableCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [newCategoryAmount, setNewCategoryAmount] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [blockedDateRanges, setBlockedDateRanges] = useState<Array<{ start: Date; end: Date; label: string }>>([])
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')


  useEffect(() => {
    const loadGoalDetails = async () => {
      if (!goalId) {
        navigate('/goals')
        return
      }

      if (!user?.businessId) {
        setError('No se encontró el ID del negocio')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const data = await GoalsService.getGoalReport(user.businessId, goalId)
        setGoalReport(data)
      } catch (err) {
        console.error('Error fetching goal report:', err)
        setError('Error al cargar los detalles de la meta. Por favor, intenta nuevamente.')
      } finally {
        setLoading(false)
      }
    }

    loadGoalDetails()
  }, [goalId, navigate, user?.businessId])

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCategoryDropdown && !(event.target as Element).closest('.category-dropdown')) {
        setShowCategoryDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showCategoryDropdown])

  // Función para abrir el modal de edición
  const handleOpenEditModal = async () => {
    if (!goalReport || !user?.businessId) return

    setShowEditModal(true)
    setCategoriesLoading(true)

    try {
      // Cargar categorías disponibles
      const categoriesData = await categoryService.getCategories(user.businessId)
      setAvailableCategories(categoriesData)

      // Cargar metas existentes para bloquear sus fechas (excluyendo la meta actual)
      const existingGoals = await GoalsService.getActiveGoalsSummary(user.businessId)
      const blockedRanges = existingGoals
        .filter(goal => goal.id !== goalId) // Excluir la meta actual
        .map(goal => {
          const [startYear, startMonth, startDay] = goal.periodStart.split('-').map(Number)
          const [endYear, endMonth, endDay] = goal.periodEnd.split('-').map(Number)
          
          return {
            start: new Date(startYear, startMonth - 1, startDay),
            end: new Date(endYear, endMonth - 1, endDay),
            label: goal.name
          }
        })
      setBlockedDateRanges(blockedRanges)

      // Inicializar el formulario con los datos actuales
      setEditGoalName(goalReport.name)
      setEditStartDate(goalReport.periodStart)
      setEditEndDate(goalReport.periodEnd)
      setEditCategories(
        goalReport.categoryTargets.map(ct => ({
          categoryId: ct.categoryId,
          categoryName: ct.categoryName,
          amount: ct.revenueTarget
        }))
      )
    } catch (error) {
      console.error('Error loading edit modal data:', error)
      alert('Error al cargar los datos para editar')
      setShowEditModal(false)
    } finally {
      setCategoriesLoading(false)
    }
  }

  // Agregar una categoría del select
  const addSelectedCategory = () => {
    if (!selectedCategoryId || !newCategoryAmount) return

    const category = availableCategories.find(cat => cat.id === selectedCategoryId)
    if (!category) return

    // Verificar si ya está agregada
    if (editCategories.find(cat => cat.categoryId === category.id)) return

    const amount = parseFloat(newCategoryAmount)
    if (isNaN(amount) || amount <= 0) return

    setEditCategories([...editCategories, { 
      categoryId: category.id,
      categoryName: category.displayName, 
      amount: amount 
    }])
    setSelectedCategoryId('')
    setNewCategoryAmount('')
  }

  // Actualizar el monto de una categoría
  const updateCategoryAmount = (categoryId: string, amount: number) => {
    setEditCategories(editCategories.map(cat =>
      cat.categoryId === categoryId ? { ...cat, amount } : cat
    ))
  }

  // Remover una categoría
  const removeCategory = (categoryId: string) => {
    setEditCategories(editCategories.filter(cat => cat.categoryId !== categoryId))
  }

  // Calcular el total
  const totalAmount = editCategories.reduce((sum, cat) => sum + cat.amount, 0)

  // Manejar selección de fechas
  const handleDateSelection = (start: string, end: string) => {
    setEditStartDate(start)
    setEditEndDate(end)
  }

  // Guardar la meta actualizada
  const handleSaveEdit = async () => {
    if (!editGoalName.trim() || !editStartDate || !editEndDate || editCategories.length === 0) {
      alert('Por favor complete todos los campos requeridos')
      return
    }

    if (new Date(editStartDate) >= new Date(editEndDate)) {
      alert('La fecha de fin debe ser posterior a la fecha de inicio')
      return
    }

    if (!user?.businessId || !goalId) {
      alert('No se encontró el ID del negocio o de la meta')
      return
    }

    setEditLoading(true)

    try {
      const updateData = {
        name: editGoalName.trim(),
        periodStart: editStartDate,
        periodEnd: editEndDate,
        totalRevenueGoal: totalAmount,
        categoryTargets: editCategories.map(cat => ({
          categoryId: cat.categoryId,
          revenueTarget: cat.amount
        }))
      }

      await GoalsService.updateGoal(user.businessId, goalId, updateData)
      
      // Recargar los datos para asegurar sincronización
      const refreshedData = await GoalsService.getGoalReport(user.businessId, goalId)
      setGoalReport(refreshedData)
      
      // Cerrar el modal después de actualizar los datos
      setShowEditModal(false)
    } catch (error) {
      console.error('Error updating goal:', error)
      
      // Verificar si es el error específico de categorías inválidas
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { error?: string } } }
        if (axiosError.response?.status === 400 && axiosError.response?.data?.error === "Una o más categorías no existen") {
          setErrorMessage("Debe eliminar categorias invalidas o inexistentes para poder editar")
          setShowErrorModal(true)
        } else {
          alert('Error al actualizar la meta. Por favor, intenta nuevamente.')
        }
      } else {
        alert('Error al actualizar la meta. Por favor, intenta nuevamente.')
      }
    } finally {
      setEditLoading(false)
    }
  }

  // Función para determinar el color de la barra de progreso
  const getProgressBarColor = (percentage: number): string => {
    if (percentage > 105) return 'bg-gradient-to-r from-green-400 to-purple-500' // Gradiente verde-violeta para sobrepasar meta
    if (percentage >= 100) return 'bg-green-500' // Verde para completado
    if (percentage >= 75) return 'bg-yellow-500' // Amarillo para casi completado
    if (percentage >= 50) return 'bg-orange-500' // Naranja para medio camino
    return 'bg-red-500' // Rojo para bajo progreso
  }

  if (loading) {
    return <LoadingScreen message="Cargando detalles de la meta..." />
  }

  if (error || !goalReport) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-[#fff1eb] to-white">
        <div className="px-3 py-4 pb-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="p-4 border border-red-200 sm:p-6 bg-red-50 rounded-2xl">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-red-900 sm:text-base">Error al cargar los detalles</h3>
                <p className="mt-1 text-xs text-red-700 sm:text-sm">{error || 'No se encontraron datos de la meta'}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-4 sm:flex-row">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-3 py-2 text-xs font-medium text-white transition-colors bg-red-600 rounded-lg sm:w-auto sm:px-4 sm:text-sm hover:bg-red-700"
              >
                Reintentar
              </button>
              <button
                onClick={() => navigate('/goals')}
                className="w-full px-3 py-2 text-xs font-medium text-red-600 transition-colors bg-white border border-red-600 rounded-lg sm:w-auto sm:px-4 sm:text-sm hover:bg-red-50"
              >
                Volver a Metas
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { name, totalRevenueGoal, totalActualRevenue, totalAchievement, categoryTargets, periodEnd } = goalReport

  // Verificar si la meta aún está activa (fecha final es posterior a hoy)
  const isGoalActive = () => {
    const [year, month, day] = periodEnd.split('-').map(Number)
    const endDate = new Date(year, month - 1, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Resetear horas para comparar solo fechas
    return endDate >= today
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#fff1eb] to-white">
      <div className="px-3 py-4 pb-20 mx-auto max-w-7xl sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/goals')}
            className="inline-flex items-center gap-2 rounded-full bg-[#f74116]/10 px-3 py-2 text-xs sm:text-sm font-semibold text-[#f74116] mb-4 sm:mb-6 hover:bg-[#f74116]/20 transition-colors group"
          >
            <svg className="w-3 h-3 transition-transform sm:w-4 sm:h-4 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Volver a Metas</span>
          </button>
          
          <div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
              {name}
            </h1>
            <p className="text-sm text-gray-600 sm:text-base">Seguimiento detallado por categorías</p>
          </div>
        </div>

        {/* Resumen general */}
        <div className="mb-4 sm:mb-6 bg-white rounded-2xl shadow-sm border border-[#f74116]/10 p-4 sm:p-6">
          <h2 className="mb-3 text-lg font-bold text-gray-900 sm:mb-4 sm:text-xl">Resumen General</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-[#f74116]">${totalActualRevenue.toLocaleString()}</div>
              <div className="text-xs text-gray-600 sm:text-sm">Total Actual</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900 sm:text-2xl">${totalRevenueGoal.toLocaleString()}</div>
              <div className="text-xs text-gray-600 sm:text-sm">Meta Total</div>
            </div>
            <div className="text-center sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-center gap-1 text-xl font-bold text-green-600 sm:text-2xl">
                {totalAchievement.toFixed(1)}%
                {totalAchievement > 100 && (
                  <svg className="w-4 h-4 text-orange-500 sm:w-5 sm:h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="text-xs text-gray-600 sm:text-sm">Progreso Total</div>
            </div>
          </div>

          {/* Barra de progreso general */}
          <div className="mt-4">
            <div className="w-full h-3 overflow-hidden bg-gray-200 rounded-full">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${getProgressBarColor(totalAchievement)}`}
                style={{ width: `${Math.min(totalAchievement, 150)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tabla de categorías */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#f74116]/10 overflow-hidden">
          <div className="px-4 py-4 border-b border-gray-200 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Categorías</h2>
                <p className="text-xs text-gray-600 sm:text-sm">Progreso individual por categoría</p>
              </div>
              {isGoalActive() && (
                <button
                  onClick={handleOpenEditModal}
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white transition-colors bg-[#f74116] rounded-lg hover:bg-[#f74116]/90 w-full sm:w-auto justify-center"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar Meta
                </button>
              )}
            </div>
          </div>

          {/* Vista móvil: Cards */}
          <div className="block sm:hidden">
            <div className="divide-y divide-gray-200">
              {categoryTargets.map((category) => {
                const progressPercentage = category.achievement
                const progressBarColor = getProgressBarColor(progressPercentage)

                return (
                  <div key={category.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">{category.categoryName}</h3>
                      <span className="text-xs text-gray-500">{progressPercentage.toFixed(1)}%</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-500">Actual:</span>
                        <div className="font-medium text-gray-900">${category.actualRevenue.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Meta:</span>
                        <div className="font-medium text-gray-900">${category.revenueTarget.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Progreso</span>
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
                )
              })}
            </div>
          </div>

          {/* Vista desktop: Tabla */}
          <div className="hidden overflow-x-auto sm:block">
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
                {categoryTargets.map((category) => {
                  const progressPercentage = category.achievement
                  const progressBarColor = getProgressBarColor(progressPercentage)

                  return (
                    <tr key={category.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{category.categoryName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${category.actualRevenue.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          ${category.revenueTarget.toLocaleString()}
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

          {categoryTargets.length === 0 && (
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

      {/* Modal de edición */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50">
          <div className="relative w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-white shadow-2xl rounded-2xl">
            {/* Header del modal */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b border-gray-200 sm:p-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Editar Meta</h2>
                <p className="mt-1 text-xs text-gray-600 sm:text-sm">Actualiza la información de tu meta</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 text-gray-400 transition-colors rounded-lg hover:text-gray-600 hover:bg-gray-100"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-4 space-y-4 sm:p-6 sm:space-y-6">
              {categoriesLoading ? (
                <div className="py-8 text-center">
                  <div className="inline-block w-8 h-8 border-4 border-[#f74116] border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-2 text-sm text-gray-600">Cargando datos...</p>
                </div>
              ) : (
                <>
                  {/* Información básica */}
                  <div className="p-4 sm:p-6 bg-gray-50 rounded-xl">
                    <h3 className="mb-3 text-base font-bold text-gray-900 sm:mb-4 sm:text-lg">Información Básica</h3>

                    <div className="grid grid-cols-1 gap-4 sm:gap-6">
                      {/* Nombre de la meta */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Nombre de la Meta *
                        </label>
                        <input
                          type="text"
                          value={editGoalName}
                          onChange={(e) => setEditGoalName(e.target.value)}
                          placeholder="Ej: Aumentar ventas mensuales"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f74116]/20 focus:border-[#f74116] transition-colors"
                          required
                        />
                      </div>

                      {/* Selector de Rango de Fechas */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Período de la Meta *
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowDatePicker(true)}
                          className="w-full px-3 sm:px-4 py-3 text-left border border-gray-300 rounded-lg hover:border-[#f74116] focus:ring-2 focus:ring-[#f74116]/20 focus:border-[#f74116] transition-colors group"
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#f74116]/10 text-[#f74116] group-hover:bg-[#f74116]/20 transition-colors flex-shrink-0">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              {!editStartDate || !editEndDate ? (
                                <span className="text-sm text-gray-500 sm:text-base">Seleccionar período de la meta</span>
                              ) : (
                                <div className="flex flex-col">
                                  <span className="text-xs font-medium text-gray-900 truncate sm:text-sm">
                                    {(() => {
                                      const [startYear, startMonth, startDay] = editStartDate.split('-').map(Number)
                                      const [endYear, endMonth, endDay] = editEndDate.split('-').map(Number)
                                      const start = new Date(startYear, startMonth - 1, startDay)
                                      const end = new Date(endYear, endMonth - 1, endDay)
                                      return `${start.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })} → ${end.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                    })()}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {(() => {
                                      const [startYear, startMonth, startDay] = editStartDate.split('-').map(Number)
                                      const [endYear, endMonth, endDay] = editEndDate.split('-').map(Number)
                                      const start = new Date(startYear, startMonth - 1, startDay)
                                      const end = new Date(endYear, endMonth - 1, endDay)
                                      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
                                    })()} días
                                  </span>
                                </div>
                              )}
                            </div>
                            <svg className="flex-shrink-0 w-4 h-4 text-gray-400 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Categorías */}
                  <div className="p-4 sm:p-6 bg-gray-50 rounded-xl">
                    <h3 className="mb-3 text-base font-bold text-gray-900 sm:mb-4 sm:text-lg">Categorías y Montos</h3>
                    <p className="mb-4 text-xs text-gray-600 sm:mb-6 sm:text-sm">
                      Selecciona las categorías relevantes para tu meta e ingresa los montos objetivo para cada una.
                    </p>

                    {/* Agregar categoría */}
                    <div className="p-3 mb-4 bg-white rounded-lg sm:p-4 sm:mb-6">
                      <h4 className="mb-3 text-xs font-semibold text-gray-700 sm:text-sm">Agregar Categoría</h4>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        {/* Dropdown custom para categorías */}
                        <div className="relative flex-1 category-dropdown">
                          <button
                            type="button"
                            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                            className="w-full flex items-center justify-between px-3 py-2 text-left border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f74116]/20 focus:border-[#f74116] transition-colors"
                          >
                            <span className={selectedCategoryId ? 'text-gray-900 text-sm' : 'text-gray-500 text-sm'}>
                              {selectedCategoryId
                                ? availableCategories.find(cat => cat.id === selectedCategoryId)?.displayName || 'Selecciona una categoría'
                                : 'Selecciona una categoría'
                              }
                            </span>
                            <svg className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {/* Dropdown menu */}
                          {showCategoryDropdown && (
                            <div className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 sm:max-h-60">
                              {availableCategories
                                .filter(cat => !editCategories.find(selected => selected.categoryId === cat.id))
                                .map(category => (
                                  <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedCategoryId(category.id)
                                      setShowCategoryDropdown(false)
                                    }}
                                    className="flex items-center w-full gap-2 px-3 py-2 text-left transition-colors sm:gap-3 hover:bg-gray-50"
                                  >
                                    <span className="text-base sm:text-lg">{category.icon}</span>
                                    <span className="text-xs text-gray-900 sm:text-sm">{category.displayName}</span>
                                  </button>
                                ))}
                              {availableCategories.filter(cat => !editCategories.find(selected => selected.categoryId === cat.id)).length === 0 && (
                                <div className="px-3 py-2 text-xs text-center text-gray-500 sm:text-sm">
                                  No hay categorías disponibles
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <input
                          type="number"
                          value={newCategoryAmount}
                          onChange={(e) => setNewCategoryAmount(e.target.value)}
                          placeholder="Monto"
                          min="0"
                          step="0.01"
                          className="w-full sm:w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f74116]/20 focus:border-[#f74116] transition-colors text-sm"
                        />
                        <button
                          onClick={addSelectedCategory}
                          disabled={!selectedCategoryId || !newCategoryAmount}
                          className="w-full sm:w-auto px-4 py-2 bg-[#f74116] text-white rounded-lg hover:bg-[#f74116]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                          Agregar
                        </button>
                      </div>
                    </div>

                    {/* Lista de categorías seleccionadas */}
                    {editCategories.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-gray-700 sm:text-sm">Categorías Seleccionadas</h4>
                        {editCategories.map(category => (
                          <div key={category.categoryId} className="flex flex-col gap-2 p-3 bg-white rounded-lg sm:flex-row sm:items-center sm:gap-3">
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium text-gray-900">{category.categoryName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 sm:text-sm">$</span>
                              <input
                                type="number"
                                value={category.amount || ''}
                                onChange={(e) => updateCategoryAmount(category.categoryId, parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                className="w-20 sm:w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#f74116]/20 focus:border-[#f74116] transition-colors"
                              />
                            </div>
                            <button
                              onClick={() => removeCategory(category.categoryId)}
                              className="self-end p-1 text-red-500 transition-colors hover:text-red-700 sm:self-center"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}

                        {/* Total */}
                        <div className="mt-4 p-3 sm:p-4 bg-[#f74116]/10 rounded-lg border border-[#f74116]/20">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-xs sm:text-sm font-semibold text-[#f74116]">Total de la Meta:</span>
                            <span className="text-base sm:text-lg font-bold text-[#f74116]">
                              ${totalAmount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {editCategories.length === 0 && (
                      <div className="py-6 text-center text-gray-500 sm:py-8">
                        <div className="flex items-center justify-center w-10 h-10 mx-auto mb-3 bg-gray-100 rounded-full sm:w-12 sm:h-12">
                          <svg className="w-5 h-5 text-gray-400 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <p className="text-xs sm:text-sm">Selecciona al menos una categoría para continuar</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer con botones de acción */}
            <div className="sticky bottom-0 flex flex-col-reverse justify-end gap-2 p-4 bg-white border-t border-gray-200 sm:flex-row sm:gap-3 sm:p-6">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={editLoading}
                className="w-full px-4 py-2 text-sm text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg sm:w-auto sm:px-6 hover:bg-gray-50 disabled:opacity-50 sm:text-base"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editLoading || !editGoalName.trim() || !editStartDate || !editEndDate || editCategories.length === 0}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-[#f74116] text-white rounded-lg hover:bg-[#f74116]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
              >
                {editLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de error específico */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md p-6 bg-white shadow-xl rounded-2xl">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-red-100 rounded-full">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900">Error al editar meta</h3>
                <p className="mt-2 text-sm text-gray-600">{errorMessage}</p>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-[#f74116] rounded-lg hover:bg-[#f74116]/90 transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de selección de fechas */}
      <DateRangePicker
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelect={handleDateSelection}
        initialStartDate={editStartDate}
        initialEndDate={editEndDate}
        blockedRanges={blockedDateRanges}
        minDate={(() => {
          if (!editStartDate) return new Date()
          
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          
          const startDate = new Date(editStartDate)
          startDate.setHours(0, 0, 0, 0)
          
          // Si la meta ya inició, no permitir fechas anteriores al inicio actual
          // Si la meta no inició, permitir desde hoy hacia atrás
          return startDate < today ? startDate : today
        })()}
      />
    </div>
  )
}

export default GoalDetails