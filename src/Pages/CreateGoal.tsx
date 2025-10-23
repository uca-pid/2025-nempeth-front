import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { categoryService } from '../services/categoryService'
import type { Category } from '../services/categoryService'
import LoadingScreen from '../components/LoadingScreen'
import DateRangePicker from '../components/DateRangePicker'

interface CategoryAmount {
  categoryName: string
  amount: number
}

function CreateGoal() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [goalName, setGoalName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [categories, setCategories] = useState<CategoryAmount[]>([])
  const [availableCategories, setAvailableCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [newCategoryAmount, setNewCategoryAmount] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)

  // Cargar categorías disponibles
  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true)
      if (!user?.businessId) return

      try {
        setCategoriesLoading(true)
        const categoriesData = await categoryService.getCategories(user.businessId)
        setAvailableCategories(categoriesData)
      } catch (error) {
        console.error('Error loading categories:', error)
      } finally {
        setCategoriesLoading(false)
        setLoading(false)
      }
    }

    loadCategories()
  }, [user?.businessId])

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

  // Agregar una categoría del select
  const addSelectedCategory = () => {
    if (!selectedCategoryId || !newCategoryAmount) return

    const category = availableCategories.find(cat => cat.id === selectedCategoryId)
    if (!category) return

    // Verificar si ya está agregada
    if (categories.find(cat => cat.categoryName === category.displayName)) return

    const amount = parseFloat(newCategoryAmount)
    if (isNaN(amount) || amount <= 0) return

    setCategories([...categories, { categoryName: category.displayName, amount: amount }])
    setSelectedCategoryId('')
    setNewCategoryAmount('')
  }

  // Actualizar el monto de una categoría
  const updateCategoryAmount = (categoryName: string, amount: number) => {
    setCategories(categories.map(cat =>
      cat.categoryName === categoryName ? { ...cat, amount } : cat
    ))
  }

  // Remover una categoría
  const removeCategory = (categoryName: string) => {
    setCategories(categories.filter(cat => cat.categoryName !== categoryName))
  }

  // Calcular el total
  const totalAmount = categories.reduce((sum, cat) => sum + cat.amount, 0)

  // Manejar selección de fechas
  const handleDateSelection = (start: string, end: string) => {
    setStartDate(start)
    setEndDate(end)
  }

  // Guardar la meta
  const handleSave = () => {
    if (!goalName.trim() || !startDate || !endDate || categories.length === 0) {
      alert('Por favor complete todos los campos requeridos')
      return
    }

    if (new Date(startDate) >= new Date(endDate)) {
      alert('La fecha de fin debe ser posterior a la fecha de inicio')
      return
    }

    // Aquí iría la lógica para guardar la meta
    console.log('Guardando meta:', {
      name: goalName,
      startDate,
      endDate,
      categories
    })

    // Por ahora solo navegamos de vuelta
    navigate('/goals')
  }

  if (loading || categoriesLoading) {
    return <LoadingScreen message={categoriesLoading ? "Cargando categorías..." : "Cargando..."} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#fff1eb] to-white">
      <div className="max-w-4xl px-4 py-8 pb-24 mx-auto sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f74116]/10 px-4 py-2 text-sm font-semibold text-[#f74116] mb-4">
            <span className="h-2 w-2 rounded-full bg-[#f74116]" />
            Crear Nueva Meta
          </div>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Definir objetivo comercial
          </h1>
          <p className="mt-2 text-gray-600">Establece una nueva meta para tu negocio con categorías específicas</p>
        </div>

        {/* Formulario */}
        <div className="space-y-6">

          {/* Información básica */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#f74116]/10 p-6">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Información Básica</h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Nombre de la meta */}
              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Nombre de la Meta *
                </label>
                <input
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="Ej: Aumentar ventas mensuales"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f74116]/20 focus:border-[#f74116] transition-colors"
                  required
                />
              </div>

              {/* Selector de Rango de Fechas */}
              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Período de la Meta *
                </label>
                <button
                  type="button"
                  onClick={() => setShowDatePicker(true)}
                  className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg hover:border-[#f74116] focus:ring-2 focus:ring-[#f74116]/20 focus:border-[#f74116] transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#f74116]/10 text-[#f74116] group-hover:bg-[#f74116]/20 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        {!startDate || !endDate ? (
                          <span className="text-gray-500">Seleccionar período de la meta</span>
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                              {new Date(startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                              {' → '}
                              {new Date(endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            <span className="text-xs text-gray-500">
                              {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} días
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Categorías */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#f74116]/10 p-6">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Categorías y Montos</h2>
            <p className="mb-6 text-sm text-gray-600">
              Selecciona las categorías relevantes para tu meta e ingresa los montos objetivo para cada una.
            </p>

            {/* Agregar categoría personalizada */}
            <div className="p-4 mb-6 rounded-lg bg-gray-50">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">Agregar Categoría</h3>
              <div className="flex gap-2">
                {/* Dropdown custom para categorías */}
                <div className="relative flex-1 category-dropdown">
                  <button
                    type="button"
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    disabled={categoriesLoading}
                    className="w-full flex items-center justify-between px-3 py-2 text-left border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f74116]/20 focus:border-[#f74116] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className={selectedCategoryId ? 'text-gray-900' : 'text-gray-500'}>
                      {categoriesLoading
                        ? 'Cargando categorías...'
                        : selectedCategoryId
                          ? availableCategories.find(cat => cat.id === selectedCategoryId)?.displayName || 'Selecciona una categoría'
                          : 'Selecciona una categoría'
                      }
                    </span>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown menu */}
                  {showCategoryDropdown && (
                    <div className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg max-h-60">
                      {availableCategories
                        .filter(cat => !categories.find(selected => selected.categoryName === cat.displayName))
                        .map(category => (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => {
                              setSelectedCategoryId(category.id)
                              setShowCategoryDropdown(false)
                            }}
                            className="flex items-center w-full gap-3 px-3 py-2 text-left transition-colors hover:bg-gray-50"
                          >
                            <span className="text-lg">{category.icon}</span>
                            <span className="text-sm text-gray-900">{category.displayName}</span>
                          </button>
                        ))}
                      {availableCategories.filter(cat => !categories.find(selected => selected.categoryName === cat.displayName)).length === 0 && (
                        <div className="px-3 py-2 text-sm text-center text-gray-500">
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
                  className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f74116]/20 focus:border-[#f74116] transition-colors"
                />
                <button
                  onClick={addSelectedCategory}
                  disabled={!selectedCategoryId || !newCategoryAmount}
                  className="px-4 py-2 bg-[#f74116] text-white rounded-lg hover:bg-[#f74116]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Agregar
                </button>
              </div>
            </div>

            {/* Lista de categorías seleccionadas */}
            {categories.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Categorías Seleccionadas</h3>
                {categories.map(category => (
                  <div key={category.categoryName} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">{category.categoryName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">$</span>
                      <input
                        type="number"
                        value={category.amount || ''}
                        onChange={(e) => updateCategoryAmount(category.categoryName, parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#f74116]/20 focus:border-[#f74116] transition-colors"
                      />
                    </div>
                    <button
                      onClick={() => removeCategory(category.categoryName)}
                      className="p-1 text-red-500 transition-colors hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}

                {/* Total */}
                <div className="mt-4 p-4 bg-[#f74116]/10 rounded-lg border border-[#f74116]/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#f74116]">Total de la Meta:</span>
                    <span className="text-lg font-bold text-[#f74116]">
                      ${totalAmount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {categories.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-sm">Selecciona al menos una categoría para continuar</p>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => navigate('/goals')}
              className="px-6 py-2 text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!goalName.trim() || !startDate || !endDate || categories.length === 0}
              className="px-6 py-2 bg-[#f74116] text-white rounded-lg hover:bg-[#f74116]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Crear Meta
            </button>
          </div>
        </div>
      </div>

      {/* Modal de selección de fechas */}
      <DateRangePicker
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelect={handleDateSelection}
        initialStartDate={startDate}
        initialEndDate={endDate}
        blockedRanges={[
          // Mock de fechas bloqueadas para testing
          { start: new Date('2025-11-01'), end: new Date('2025-11-07'), label: 'Meta Q4 - Noviembre' },
          { start: new Date('2025-11-15'), end: new Date('2025-11-20'), label: 'Meta Black Friday' },
          { start: new Date('2025-12-10'), end: new Date('2025-12-25'), label: 'Meta Navidad' },
          { start: new Date('2026-01-01'), end: new Date('2026-01-15'), label: 'Meta Año Nuevo' },
          { start: new Date('2025-10-28'), end: new Date('2025-10-31'), label: 'Meta Halloween' },
          { start: new Date('2025-09-15'), end: new Date('2025-09-22'), label: 'Meta Septiembre' },
          { start: new Date('2026-02-01'), end: new Date('2026-02-14'), label: 'Meta San Valentín' },
        ]}
      />
    </div>
  )
}

export default CreateGoal