import { useEffect, useState } from 'react'
import { IoClose, IoOptionsOutline, IoTrashSharp  } from 'react-icons/io5'

interface Category {
  id: string
  displayName: string
  name: string
  type?: string
  icon: string
}

interface CategoryManagementModalProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  onAddCategory: (category: Omit<Category, 'id'>) => Promise<void>
  onEditCategory: (id: string, category: Omit<Category, 'id'>) => Promise<void>
  onDeleteCategory: (id: string) => Promise<void>
  getProductCountByCategory?: (categoryId: string) => number
  error?: string | null
}

// Iconos disponibles para las categorías
const AVAILABLE_ICONS = [
  '🍔', '🍕', '🥗', '🍰', '🥤', '☕', '🍽️', '🥘',
  '🌮', '🍜', '🍣', '🍦', '🧋', '🥙', '🍪', '🥧',
  '🍊', '🥑', '🍇', '🍓', '🥝', '🍌', '🍎', '🥭',
  '🥩', '🍗', '🥓', '🦐', '🐟', '🥚', '🧀', '🥖'
]

function CategoryManagementModal({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  getProductCountByCategory,
  error
}: CategoryManagementModalProps) {
  const [categoryName, setCategoryName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('')
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [processing, setProcessing] = useState(false)

  const handleAddCategory = async () => {
    if (!categoryName.trim() || !selectedIcon || processing) return

    try {
      setProcessing(true)
      
      if (editingCategory) {
        await onEditCategory(editingCategory.id, {
          name: categoryName.trim(),
          displayName: categoryName.trim(),
          icon: selectedIcon
        })
        setEditingCategory(null)
      } else {
        await onAddCategory({
          name: categoryName.trim(),
          displayName: categoryName.trim(),
          icon: selectedIcon
        })
      }
      
      // Resetear formulario
      setCategoryName('')
      setSelectedIcon('')
      setShowIconPicker(false)
    } catch (error) {
      console.error('Error al procesar categoría:', error)
      // El error ya se maneja en Products.tsx, aquí solo logueamos
    } finally {
      setProcessing(false)
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setCategoryName(category.name)
    setSelectedIcon(category.icon)
    setShowIconPicker(false)
  }

  const handleCancelEdit = () => {
    setEditingCategory(null)
    setCategoryName('')
    setSelectedIcon('')
    setShowIconPicker(false)
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (processing) return
    
    try {
      setProcessing(true)
      await onDeleteCategory(categoryId)
    } catch (error) {
      console.error('Error al eliminar categoría:', error)
    } finally {
      setProcessing(false)
    }
  }

  const isFormValid = !!(categoryName.trim() && selectedIcon)

  // Cerrar mini-modal con Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showIconPicker) setShowIconPicker(false)
        else if (isOpen) onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showIconPicker, isOpen, onClose])

  // Prevenir scroll del fondo cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-2 sm:p-4 md:p-6 overflow-auto">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl max-h-[95vh] overflow-hidden bg-gradient-to-b from-white via-[#fff1eb] to-white shadow-2xl rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 sm:px-6 sm:py-4 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 sm:text-xl">Administrar categorías</h3>
          <button
            className="flex items-center justify-center w-8 h-8 text-xl text-gray-500 transition rounded-lg sm:text-2xl sm:w-9 sm:h-9 hover:bg-gray-200 hover:text-gray-700"
            onClick={onClose}
            type="button"
            aria-label="Cerrar modal"
            title="Cerrar"
          >
            <IoClose />
          </button>
        </div>

        <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          {/* Mostrar error si existe */}
          {error && (
            <div className="p-4 transition-all duration-200 bg-white border border-red-200 shadow-sm rounded-2xl sm:p-6 hover:shadow-lg">
              <div className="px-4 py-3 text-sm font-medium text-red-600 border border-red-200 rounded-md bg-red-50">
                {error}
              </div>
            </div>
          )}

          {/* Formulario añadir/editar categoría */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#f74116]/10 p-4 sm:p-6 hover:shadow-lg transition-all duration-200">
            <h4 className="mb-3 text-base font-semibold text-gray-800 sm:mb-4 sm:text-lg">
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </h4>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              {/* Input para nombre */}
              <div className="flex-1">
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Nombre de la categoría
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Ej: Bebidas, Postres, etc."
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 sm:py-3 text-sm sm:text-base transition focus:border-[#f74116] focus:outline-none focus:ring-4 focus:ring-[#f74116]/20"
                />
              </div>

              {/* Botón selector de iconos */}
              <div className="sm:w-auto">
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Icono
                </label>
                <button
                  type="button"
                  onClick={() => setShowIconPicker(true)}
                  className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 text-xl sm:text-2xl transition bg-white border-2 border-gray-200 rounded-full hover:border-[#f74116] hover:shadow-md focus:border-[#f74116] focus:outline-none focus:ring-4 focus:ring-[#f74116]/20"
                  aria-label="Elegir icono"
                  title="Elegir icono"
                >
                  {selectedIcon || '➕'}
                </button>
              </div>

              {/* Botón añadir/actualizar */}
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={handleAddCategory}
                  disabled={!isFormValid || processing}
                  className="rounded-lg bg-[#f74116] px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#f74116]/90 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {processing ? 'Procesando...' : (editingCategory ? 'Actualizar' : 'Añadir')}
                </button>

                {/* Botón cancelar (solo en modo edición) */}
                {editingCategory && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-3 py-2 text-sm font-semibold text-gray-700 transition bg-gray-200 rounded-lg sm:px-4 sm:py-3 sm:text-base hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Lista de categorías existentes */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#f74116]/10 p-4 sm:p-6 hover:shadow-lg transition-all duration-200">
            <h4 className="mb-4 text-base font-semibold text-gray-800 sm:text-lg sm:mb-6">Categorías Existentes</h4>

            {categories.length === 0 ? (
              <div className="flex items-center justify-center py-6 text-gray-500 border border-gray-300 border-dashed sm:py-8 rounded-xl">
                <p className="text-sm sm:text-base">No hay categorías creadas aún</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {categories.map((category) => {
                  const productCount = getProductCountByCategory ? getProductCountByCategory(category.id) : 0
                  const hasProducts = productCount > 0

                  return (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 transition-shadow border border-gray-200 sm:p-4 bg-gray-50 rounded-xl hover:shadow-sm hover:bg-white"
                    >
                      <div className="flex flex-col flex-1 min-w-0 gap-1">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="flex-shrink-0 text-xl sm:text-2xl">{category.icon}</span>
                          <span className="text-sm font-medium text-gray-800 truncate sm:text-base">{category.name}</span>
                        </div>
                        {hasProducts && (
                          <span className="text-xs text-gray-500 ml-7 sm:ml-11">
                            {productCount} producto{productCount !== 1 ? 's' : ''} asociado{productCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {category.type === "CUSTOM" && (
                        <div className="flex items-center gap-1 ml-2 sm:gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditCategory(category)}
                            disabled={processing}
                            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 text-[#f74116] transition rounded-full ring-1 ring-[#f74116]/20 hover:bg-[#f74116]/10 hover:ring-[#f74116]/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Editar categoría"
                            aria-label="Editar categoría"
                          >
                            <IoOptionsOutline size={16} className="sm:w-5 sm:h-5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(category.id)}
                            disabled={processing || hasProducts}
                            className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 transition rounded-full ring-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                              hasProducts
                                ? 'text-gray-400 ring-gray-200 bg-gray-50'
                                : 'text-red-700 ring-red-200/70 hover:bg-red-50 hover:ring-red-300'
                            }`}
                            title={hasProducts ? `No se puede eliminar: tiene ${productCount} producto(s) asociado(s)` : "Eliminar categoría"}
                            aria-label="Eliminar categoría"
                          >
                            <IoTrashSharp size={16} className="sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-4 py-3 border-t border-gray-200 sm:px-6 sm:py-4 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#f74116] px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#f74116]/90"
          >
            Listo
          </button>
        </div>
      </div>

      {/* Mini-modal de selección de iconos */}
      {showIconPicker && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 p-2 sm:p-4"
          onClick={() => setShowIconPicker(false)}
        >
          <div
            className="w-full max-w-sm sm:max-w-md md:max-w-lg mx-2 sm:mx-4 bg-white border border-gray-200 shadow-2xl rounded-2xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 sm:px-5 sm:py-4 bg-gray-50 rounded-t-2xl">
              <h5 className="text-sm font-semibold text-gray-800 sm:text-base">Selecciona un icono</h5>
              <button
                className="flex items-center justify-center text-lg text-gray-500 rounded-lg w-7 h-7 sm:w-8 sm:h-8 sm:text-xl hover:bg-gray-200"
                onClick={() => setShowIconPicker(false)}
                aria-label="Cerrar selector de iconos"
                title="Cerrar"
              >
                <IoClose />
              </button>
            </div>

            <div className="p-3 sm:p-5">
                <div className="p-3 sm:p-4">
                    {/* Contenedor con scroll controlado */}
                    <div className="p-3 overflow-y-auto sm:p-4 max-h-60 sm:max-h-72 md:max-h-80 overscroll-contain">
                        {/* Grid fluida: llena filas con celdas mín. de 3rem */}
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(3rem,1fr))] md:grid-cols-[repeat(auto-fill,minmax(3.5rem,1fr))] gap-2 sm:gap-3 auto-rows-[2.5rem] sm:auto-rows-[3rem] md:auto-rows-[3.5rem]">
                        {AVAILABLE_ICONS.map((icon) => {
                            const isActive = selectedIcon === icon
                            return (
                            <button
                                key={icon}
                                type="button"
                                onClick={() => {
                                setSelectedIcon(icon)
                                setShowIconPicker(false)
                                }}
                                aria-label={`Elegir ${icon}`}
                                aria-selected={isActive}
                                title={`Elegir ${icon}`}
                                className={[
                                'inline-flex items-center justify-center rounded-full text-lg sm:text-2xl leading-none',
                                'w-10 aspect-square sm:w-12 sm:aspect-square shrink-0',
                                'ring-1 ring-gray-200 hover:bg-gray-50 hover:ring-gray-300',
                                'focus:outline-none focus:ring-2 focus:ring-[#f74116]/40',
                                'transition',
                                isActive ? 'bg-[#f74116]/10 ring-2 ring-[#f74116]' : ''
                                ].join(' ')}
                            >
                                {icon}
                            </button>
                            )
                        })}
                        </div>
                    </div>
                </div>
              {/* Acción secundaria para limpiar */}
              <div className="flex items-center justify-between mt-3 sm:mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIcon('')
                    setShowIconPicker(false)
                  }}
                  className="text-xs font-medium text-gray-600 sm:text-sm hover:text-gray-800"
                >
                  Quitar icono
                </button>
                <button
                  type="button"
                  onClick={() => setShowIconPicker(false)}
                  className="px-3 sm:px-4 py-2 text-sm font-semibold text-white bg-[#f74116] rounded-lg hover:bg-[#f74116]/90"
                >
                  Listo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryManagementModal
