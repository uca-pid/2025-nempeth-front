import { useState, useEffect } from 'react'
import { IoClose } from 'react-icons/io5'

interface MealSuggestionsModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectMeal: (mealName: string) => void
}

interface MealData {
  name: string
}

interface MealResponse {
  success: boolean
  count: number
  data: MealData[]
}

function MealSuggestionsModal({ isOpen, onClose, onSelectMeal }: MealSuggestionsModalProps) {
  const [meals, setMeals] = useState<MealData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchMeals()
    }
  }, [isOpen])

  const fetchMeals = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('https://que-comemos-api.vercel.app/api/meals')
      
      if (!response.ok) {
        throw new Error('Error al obtener las sugerencias')
      }

      const data: MealResponse = await response.json()
      
      if (data.success && data.data) {
        setMeals(data.data)
      } else {
        throw new Error('Formato de respuesta inválido')
      }
    } catch (err) {
      console.error('Error fetching meals:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectMeal = (mealName: string) => {
    onSelectMeal(mealName)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl overflow-hidden bg-white shadow-2xl rounded-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Sugerencias de Productos</h3>
            {!loading && !error && (
              <p className="mt-1 text-sm text-gray-500">
                {meals.length} sugerencia{meals.length !== 1 ? 's' : ''} disponible{meals.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <button
            className="flex items-center justify-center w-8 h-8 text-gray-500 transition rounded-lg hover:bg-gray-200 hover:text-gray-700"
            onClick={onClose}
            type="button"
            aria-label="Cerrar"
          >
            <IoClose className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-4 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-[#f74116] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Cargando sugerencias...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="mb-2 text-lg font-semibold text-gray-900">Error al cargar sugerencias</h4>
              <p className="mb-4 text-gray-600">{error}</p>
              <button
                onClick={fetchMeals}
                className="px-4 py-2 bg-[#f74116] text-white rounded-lg hover:bg-[#f74116]/90 transition-colors font-medium"
                type="button"
              >
                Reintentar
              </button>
            </div>
          ) : meals.length === 0 ? (
            <div className="py-12 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h4 className="mb-2 text-lg font-semibold text-gray-900">No hay sugerencias disponibles</h4>
              <p className="text-gray-600">No se encontraron sugerencias de productos en este momento.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {meals.map((meal, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectMeal(meal.name)}
                  className="w-full flex items-center gap-3 p-4 transition-all duration-200 border border-gray-200 rounded-lg hover:border-[#f74116]/50 hover:shadow-md hover:bg-[#f74116]/5 cursor-pointer"
                >
                  <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-[#f74116]/10 rounded-lg">
                    <span className="text-xl">🍽️</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">{meal.name}</p>
                    <p className="text-sm text-gray-500">Click para crear producto</p>
                  </div>
                  <div className="flex-shrink-0 text-[#f74116]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            className="px-6 py-2 text-sm font-semibold text-gray-700 transition bg-gray-200 rounded-lg hover:bg-gray-300"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default MealSuggestionsModal
