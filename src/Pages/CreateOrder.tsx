import { useState, useEffect, useCallback, useMemo } from 'react'
import { productService, type Product } from '../services/productService'
import { categoryService, type Category as CategoryType } from '../services/categoryService'

// Tipo para productos que vienen de la API con el objeto category anidado
interface ProductWithCategory extends Omit<Product, 'categoryId'> {
  category?: {
    id: string;
    name: string;
  };
}
import { salesService, type CreateSaleRequest } from '../services/salesService'
import { useAuth } from '../contexts/useAuth'
import EmptyState from '../components/Products/EmptyState'
import DescriptionModal from '../components/Products/DescriptionModal'
import SuccessOperation from '../components/SuccesOperation'
import { OrderProductCard, ShoppingCart, type CartItem } from '../components/Orders'
import { IoFilterCircle, IoCartOutline, IoCloseOutline } from 'react-icons/io5'

function CreateOrder() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<CategoryType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategoryFilters, setSelectedCategoryFilters] = useState<string[]>([])
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [showDescriptionModal, setShowDescriptionModal] = useState(false)
  const [selectedProductDescription, setSelectedProductDescription] = useState({ name: '', description: '' })
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showMobileCart, setShowMobileCart] = useState(false)

  const businessId = user?.businessId

  const loadCategories = useCallback(async () => {
    if (!businessId) return

    try {
      const fetchedCategories = await categoryService.getCategories(businessId)
      setCategories(fetchedCategories)
    } catch (err) {
      console.error('Error cargando categorías:', err)
      setError('Error al cargar las categorías')
    }
  }, [businessId])

  const loadProducts = useCallback(async () => {
    if (!businessId) return

    try {
      setLoading(true)
      setError(null)
      const fetchedProducts = await productService.getProducts(businessId)
      
      // Transformar los productos para extraer el categoryId del objeto category
      const transformedProducts = (fetchedProducts as ProductWithCategory[]).map((product) => ({
        ...product,
        categoryId: product.category?.id || ''
      })) as Product[]
      
      setProducts(transformedProducts)
    } catch (err) {
      console.error('Error cargando productos:', err)
      setError('Error al cargar los productos')
    } finally {
      setLoading(false)
    }
  }, [businessId])

  // Filtrar productos basado en las categorías seleccionadas
  const filteredProducts = useMemo(() => {
    if (selectedCategoryFilters.length === 0) {
      return products // Si no hay filtros, mostrar todos los productos
    }
    return products.filter(product => 
      selectedCategoryFilters.includes(product.categoryId || '')
    )
  }, [products, selectedCategoryFilters])

  // Cargar productos y categorías al montar el componente
  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [loadProducts, loadCategories])

  // Efecto para cerrar el dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showFilterDropdown && !target.closest('.filter-dropdown-container')) {
        setShowFilterDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFilterDropdown])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f7fc] p-4 sm:p-6 lg:p-10">
        <div className="flex min-h-[40vh] sm:min-h-[50vh] items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white/70">
          <p className="text-sm sm:text-base font-medium text-gray-600">Cargando productos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f7fc] p-4 sm:p-6 lg:p-10">
        <div className="flex min-h-[40vh] sm:min-h-[50vh] flex-col items-center justify-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-6 sm:p-8 text-center">
          <p className="text-sm sm:text-base font-semibold text-red-600">Error: {error}</p>
          <button
            onClick={loadProducts}
            className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-600"
            type="button"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  // Funciones para manejar filtros de categorías
  const handleToggleCategoryFilter = (categoryId: string) => {
    setSelectedCategoryFilters(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleClearAllFilters = () => {
    setSelectedCategoryFilters([])
  }

  const handleToggleFilterDropdown = () => {
    setShowFilterDropdown(!showFilterDropdown)
  }

  const handleShowDescription = (product: Product) => {
    setSelectedProductDescription({ name: product.name, description: product.description })
    setShowDescriptionModal(true)
  }

  // Funciones del carrito
  const handleAddToCart = (product: Product, quantity: number) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id)
      if (existingItem) {
        // Si el producto ya existe, actualizar la cantidad
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        // Si es un producto nuevo, agregarlo
        return [...prev, { product, quantity }]
      }
    })
  }

  const handleUpdateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId)
      return
    }
    
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId))
  }

  const handleCreateOrder = async () => {
    if (cartItems.length === 0) return
    if (!businessId) {
      setError('No se pudo encontrar el ID del negocio')
      return
    }

    setIsCreatingOrder(true)
    
    try {
      // Preparar los items para la API
      const saleData: CreateSaleRequest = {
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        }))
      }
      
      // Crear la venta usando el servicio
      await salesService.createSale(businessId, saleData)
      
      // Limpiar carrito después de crear la orden
      setCartItems([])
      
      // Cerrar modal del carrito móvil si está abierto
      setShowMobileCart(false)
      
      // Mostrar modal de éxito
      setShowSuccessModal(true)
      
    } catch (err) {
      console.error('Error creando orden:', err)
      setError('Error al crear la orden')
    } finally {
      setIsCreatingOrder(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sm:p-6 lg:p-7">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold leading-tight text-gray-900 sm:text-xl lg:text-2xl">Crear Orden de Venta</h1>
            <span className="text-xs font-medium text-gray-600 sm:text-sm">
              Selecciona productos para crear una nueva orden
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:h-screen">
        {/* Panel izquierdo - Productos */}
        <div className="flex-1 p-4 sm:p-6 lg:p-10 lg:pr-4 pb-20 lg:pb-6">
          {/* Sección de filtros y categorías */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-4">
              {/* Dropdown de filtros */}
              <div className="relative filter-dropdown-container">
                <button
                  className="
                    flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center 
                    rounded-full 
                    bg-white
                    border border-gray-500  
                    text-gray-700 shadow-md 
                    transition-all duration-200
                    hover:-translate-y-0.5 hover:shadow-xl
                    hover:from-rose-100 hover:to-rose-200 hover:text-rose-600
                    hover:border-rose-300 
                    disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60
                  "
                  type="button"
                  onClick={handleToggleFilterDropdown}
                >
                  <IoFilterCircle className="text-lg sm:text-xl" />
                </button>
                
                {/* Dropdown menu */}
                {showFilterDropdown && (
                  <div className="absolute left-0 z-50 w-72 sm:w-64 py-2 mt-2 bg-white border border-gray-200 shadow-xl top-full rounded-xl max-h-80 overflow-hidden">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-800">Filtrar por categoría</h3>
                    </div>
                    
                    <div className="overflow-y-auto max-h-60 sm:max-h-64">
                      {categories.map(category => (
                        <button
                          key={category.id}
                          className={`
                            w-full flex items-center gap-3 px-4 py-3 sm:py-2 text-left hover:bg-gray-50 transition-colors
                            ${selectedCategoryFilters.includes(category.id) ? 'bg-blue-50 text-blue-800' : 'text-gray-700'}
                          `}
                          onClick={() => handleToggleCategoryFilter(category.id)}
                          type="button"
                        >
                          <span className="text-base sm:text-lg">{category.icon}</span>
                          <span className="flex-1 text-sm font-medium">{category.name}</span>
                          {selectedCategoryFilters.includes(category.id) && (
                            <span className="text-blue-600">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                    
                    {selectedCategoryFilters.length > 0 && (
                      <div className="px-4 py-2 border-t border-gray-100">
                        <button
                          className="w-full text-sm font-medium text-red-600 hover:text-red-800 py-1"
                          onClick={handleClearAllFilters}
                          type="button"
                        >
                          Limpiar filtros
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Categorías seleccionadas como filtros */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {selectedCategoryFilters.map(categoryId => {
                  const category = categories.find(cat => cat.id === categoryId)
                  if (!category) return null
                  
                  return (
                    <div 
                      key={categoryId}
                      className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-blue-800 bg-blue-100 border border-blue-200 rounded-full"
                    >
                      <span className="text-sm sm:text-base">{category.icon}</span>
                      <span className="truncate max-w-24 sm:max-w-none">{category.name}</span>
                      <button 
                        className="ml-1 font-bold text-blue-600 hover:text-blue-800 text-sm sm:text-base"
                        onClick={() => handleToggleCategoryFilter(categoryId)}
                        type="button"
                      >
                        ×
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Productos */}
          <div className="w-full max-w-none sm:max-w-full xl:max-w-[1200px]">
            {filteredProducts.length === 0 && products.length > 0 ? (
              <div className="flex min-h-[40vh] sm:min-h-[50vh] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 sm:p-8 text-center">
                <div className="text-4xl sm:text-6xl opacity-50">🔍</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-700">No se encontraron productos</h3>
                <p className="text-sm sm:text-base text-gray-500">No hay productos que coincidan con los filtros seleccionados.</p>
                <button
                  className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-600"
                  onClick={handleClearAllFilters}
                  type="button"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <EmptyState  />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredProducts.map(product => (
                  <OrderProductCard
                    key={product.id}
                    product={product}
                    categories={categories}
                    onAddToCart={handleAddToCart}
                    onShowDescription={handleShowDescription}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel derecho - Carrito (oculto en móvil) */}
        <div className="hidden lg:block lg:w-96 lg:max-w-md lg:border-l border-gray-200 bg-gray-50">
          <div className="p-4 sm:p-6">
            <ShoppingCart
              items={cartItems}
              onUpdateQuantity={handleUpdateCartQuantity}
              onRemoveItem={handleRemoveFromCart}
              onCreateOrder={handleCreateOrder}
              isCreatingOrder={isCreatingOrder}
            />
          </div>
        </div>
      </div>

      {/* Botón flotante del carrito (solo visible en móvil cuando hay items) */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40 lg:hidden">
          <button
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105"
            onClick={() => setShowMobileCart(true)}
            type="button"
          >
            <IoCartOutline className="text-xl" />
            <span className="font-semibold">{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </button>
        </div>
      )}

      {/* Modal del carrito para móvil */}
      {showMobileCart && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
            onClick={() => setShowMobileCart(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] overflow-hidden z-50 lg:hidden transform transition-transform duration-300 ease-out">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Carrito de Ventas</h2>
              <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => setShowMobileCart(false)}
                type="button"
              >
                <IoCloseOutline className="text-xl text-gray-600" />
              </button>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 80px)' }}>
              <div className="p-4">
                <ShoppingCart
                  items={cartItems}
                  onUpdateQuantity={handleUpdateCartQuantity}
                  onRemoveItem={handleRemoveFromCart}
                  onCreateOrder={handleCreateOrder}
                  isCreatingOrder={isCreatingOrder}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal de descripción completa */}
      <DescriptionModal
        isOpen={showDescriptionModal}
        onClose={() => setShowDescriptionModal(false)}
        productName={selectedProductDescription.name}
        description={selectedProductDescription.description}
      />

      {/* Modal de éxito */}
      {showSuccessModal && (
        <SuccessOperation
          message="Orden de venta creada exitosamente"
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </div>
  )
}

export default CreateOrder