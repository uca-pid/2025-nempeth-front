import { useState, useEffect, useCallback, useMemo } from 'react'
import { productService, type Product } from '../services/productService'
import { categoryService, type Category as CategoryType } from '../services/categoryService'
import { useAuth } from '../contexts/useAuth'
import LoadingScreen from '../components/LoadingScreen'
import EmptyState from '../components/Products/EmptyState'
import DescriptionModal from '../components/Products/DescriptionModal'
import ProductCard from '../components/Products/ProductCard'
import CategoryManagementModal from '../components/Products/CategoryManagementModal'
import { IoFilterCircle } from 'react-icons/io5'

// Tipo para productos que vienen de la API con el objeto category anidado
interface ProductWithCategory extends Omit<Product, 'categoryId'> {
  category?: {
    id: string;
    name: string;
  };
}

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (product: Omit<Product, 'id'> & { id?: string }) => Promise<void>
  product?: Product | null
  error?: string | null
  categories: CategoryType[]
}

interface ConfirmDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  productName: string
  isDeleting: boolean
}

function ProductModal({ isOpen, onClose, onSave, product, error, categories }: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    categoryId: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        categoryId: product.categoryId ? product.categoryId : ''
      })
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        categoryId: categories.length > 0 ? categories[0].id : ''
      })
    }
    setSaving(false) // Resetear estado de guardado
  }, [product, isOpen, categories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim() && formData.description.trim() && formData.price > 0 && formData.categoryId) {
      setSaving(true)
      try {
        await onSave({
          ...formData,
          ...(product && { id: product.id })
        })
      } finally {
        setSaving(false)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Limitar descripción a 300 caracteres
    let finalValue = value
    if (name === 'description' && value.length > 300) {
      finalValue = value.substring(0, 300)
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(finalValue) || 0 : finalValue
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg overflow-hidden bg-white shadow-2xl rounded-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-800">{product ? 'Editar Producto' : 'Agregar Producto'}</h3>
          <button
            className="flex items-center justify-center w-8 h-8 text-2xl text-gray-500 transition rounded-md hover:bg-gray-200 hover:text-gray-700"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          {error && (
            <div className="px-4 py-3 text-sm font-medium text-red-600 border border-red-200 rounded-md bg-red-50">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700" htmlFor="name">Nombre del Producto</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Ingresa el nombre del producto"
              className="w-full rounded-lg border-2 border-gray-200 px-3 py-3 text-base transition focus:border-[#f74116] focus:outline-none focus:ring-4 focus:ring-[#f74116]/20"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700" htmlFor="categoryId">Categoría del Producto</label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className="w-full rounded-lg border-2 border-gray-200 px-3 py-3 text-base transition focus:border-[#f74116] focus:outline-none focus:ring-4 focus:ring-[#f74116]/20"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700" htmlFor="description">Descripción</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Describe el producto"
              className="w-full min-h-[4rem] rounded-lg border-2 border-gray-200 px-3 py-3 text-base transition focus:border-[#f74116] focus:outline-none focus:ring-4 focus:ring-[#f74116]/20"
            />
            <div className="flex justify-end">
              <span className={`text-sm ${formData.description.length > 280 ? 'text-orange-600' : formData.description.length === 300 ? 'text-red-600' : 'text-gray-500'}`}>
                {formData.description.length}/300
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700" htmlFor="price">Precio ($)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full rounded-lg border-2 border-gray-200 px-3 py-3 text-base transition focus:border-[#f74116] focus:outline-none focus:ring-4 focus:ring-[#f74116]/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              className="px-4 py-2 text-sm font-semibold text-gray-700 transition bg-gray-200 rounded-lg hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#f74116] px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#f74116]/90 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={saving}
            >
              {saving ? 'Guardando...' : (product ? 'Actualizar' : 'Guardar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ConfirmDeleteModal({ isOpen, onClose, onConfirm, productName, isDeleting }: ConfirmDeleteModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm overflow-hidden bg-white shadow-2xl rounded-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Confirmar eliminación</h3>
          <button
            className="flex items-center justify-center w-8 h-8 text-2xl text-gray-500 transition rounded-md hover:bg-gray-200 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onClose}
            disabled={isDeleting}
            type="button"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-6 space-y-3 text-center">
          <div className="text-4xl">⚠️</div>
          <p className="text-base text-gray-700">
            ¿Estás seguro de que deseas eliminar el producto <strong className="font-semibold text-gray-900">"{productName}"</strong>?
          </p>
          <p className="text-sm italic text-gray-500">Esta acción no se puede deshacer.</p>
        </div>

        <div className="flex items-center justify-center gap-3 px-6 py-4 border-t border-gray-200">
          <button
            type="button"
            className="px-4 py-2 text-sm font-semibold text-gray-700 transition bg-gray-200 rounded-lg hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="rounded-lg bg-red-500 px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-red-600 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-white"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Products() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDescriptionModal, setShowDescriptionModal] = useState(false)
  const [selectedProductDescription, setSelectedProductDescription] = useState({ name: '', description: '' })
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [categories, setCategories] = useState<CategoryType[]>([])
  const [selectedCategoryFilters, setSelectedCategoryFilters] = useState<string[]>([])
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

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

  // Función para contar productos por categoría
  const getProductCountByCategory = useCallback((categoryId: string) => {
    return products.filter(product => product.categoryId === categoryId).length
  }, [products])

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
    return <LoadingScreen message="Cargando productos..." />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-[#fff1eb] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 text-center hover:shadow-lg transition-all duration-200">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Error al cargar productos</h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={loadProducts}
              className="px-6 py-3 bg-[#f74116] text-white rounded-lg hover:bg-[#f74116]/90 transition-colors font-medium"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleAddProduct = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleDeleteProduct = (product: Product) => {
    if (!businessId || processing || isDeleting) return
    
    setProductToDelete(product)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!productToDelete || !businessId || isDeleting) return

    try {
      setIsDeleting(true)
      setError(null)
      await productService.deleteProduct(businessId, productToDelete.id)
      // Recargar la lista para asegurar consistencia
      await loadProducts()
      // Cerrar modal
      setShowDeleteModal(false)
      setProductToDelete(null)
    } catch (err) {
      console.error('Error eliminando producto:', err)
      setError('Error al eliminar el producto. Por favor, intenta nuevamente.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCloseDeleteModal = () => {
    if (isDeleting) return
    setShowDeleteModal(false)
    setProductToDelete(null)
  }

  const handleShowDescription = (product: Product) => {
    setSelectedProductDescription({ name: product.name, description: product.description })
    setShowDescriptionModal(true)
  }

  const handleSaveProduct = async (productData: Omit<Product, 'id'> & { id?: string }) => {
    if (!businessId || processing) return

    try {
      setProcessing(true)
      setError(null) // Limpiar errores previos
      
      if (productData.id) {
        // Editar producto existente
        await productService.updateProduct(
          businessId,
          productData.id, 
          {
            name: productData.name,
            description: productData.description,
            price: productData.price,
            categoryId: productData.categoryId!
          }
        )
      } else {
        // Agregar nuevo producto
        await productService.createProduct(businessId, {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          categoryId: productData.categoryId!
        })
      }
      
      // Recargar la lista de productos para asegurar consistencia
      await loadProducts()
      
      // Cerrar el modal después del guardado exitoso
      setIsModalOpen(false)
      setEditingProduct(null)
      
    } catch (err) {
      console.error('Error guardando producto:', err)
      setError('Error al guardar el producto. Por favor, intenta nuevamente.')
      // NO cerrar el modal si hay error, para que el usuario pueda reintentar
    } finally {
      setProcessing(false)
    }
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

  // Funciones para manejar categorías
  const handleAddCategory = async (category: Omit<CategoryType, 'id'>) => {
    if (!businessId) return
    
    try {
      await categoryService.createCategory(businessId, category)
      await loadCategories() // Recargar categorías
    } catch (err) {
      console.error('Error creando categoría:', err)
      setError('Error al crear la categoría')
    }
  }

  const handleEditCategory = async (id: string, category: Omit<CategoryType, 'id'>) => {
    if (!businessId) return
    
    try {
      await categoryService.updateCategory(businessId, id, category)
      await loadCategories() // Recargar categorías
    } catch (err) {
      console.error('Error actualizando categoría:', err)
      setError('Error al actualizar la categoría')
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!businessId) return
    
    // Verificar si hay productos asociados a esta categoría
    const productsWithCategory = products.filter(product => product.categoryId === id)
    
    if (productsWithCategory.length > 0) {
      setError(`No se puede eliminar la categoría porque tiene ${productsWithCategory.length} producto(s) asociado(s). Primero debe reasignar o eliminar estos productos.`)
      return
    }
    
    try {
      await categoryService.deleteCategory(businessId, id)
      await loadCategories() // Recargar categorías
    } catch (err) {
      console.error('Error eliminando categoría:', err)
      setError('Error al eliminar la categoría')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#fff1eb] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f74116]/10 px-4 py-2 text-sm font-semibold text-[#f74116] mb-4">
            <span className="h-2 w-2 rounded-full bg-[#f74116]" />
            Gestión de Inventario
          </div>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-2">
            Productos
          </h1>
          <p className="text-gray-600">Administra tu catálogo y controla tu inventario</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-[#f74116] px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-[#f74116]/90 hover:shadow-lg transform hover:scale-[1.02] duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            onClick={handleAddProduct}
            disabled={processing}
            type="button"
          >
            <span className="text-xl font-bold">+</span>
            {processing ? 'Procesando...' : 'Agregar Producto'}
          </button>

          <button
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-orange-600 hover:shadow-lg transform hover:scale-[1.02] duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            onClick={() => setShowCategoryModal(true)}
            disabled={processing}
            type="button"
          >
            <span className="text-xl font-bold">⚙️</span>
            {processing ? 'Procesando...' : 'Gestionar Categorías'}
          </button>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#f74116]/10 p-6 mb-8 hover:shadow-lg transition-all duration-200">
          <div className="flex flex-wrap items-center gap-4">
            {/* Dropdown de filtros */}
            <div className="relative filter-dropdown-container">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={processing}
                type="button"
                onClick={handleToggleFilterDropdown}
              >
                <IoFilterCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Filtrar por categoría</span>
              </button>
              
              {/* Dropdown menu */}
              {showFilterDropdown && (
                <div className="absolute left-0 z-50 w-64 py-2 mt-2 bg-white border border-gray-200 shadow-xl top-full rounded-xl">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-800">Seleccionar categorías</h4>
                  </div>
                  
                  <div className="overflow-y-auto max-h-64">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors ${selectedCategoryFilters.includes(category.id) ? 'bg-[#f74116]/10 text-[#f74116]' : 'text-gray-700'}`}
                        onClick={() => handleToggleCategoryFilter(category.id)}
                        type="button"
                      >
                        <span className="text-lg">{category.icon}</span>
                        <span className="flex-1 text-sm font-medium">{category.name}</span>
                        {selectedCategoryFilters.includes(category.id) && (
                          <span className="text-[#f74116]">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  {selectedCategoryFilters.length > 0 && (
                    <div className="px-4 py-2 border-t border-gray-100">
                      <button
                        className="w-full text-sm font-medium text-red-600 hover:text-red-800"
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
            {selectedCategoryFilters.map(categoryId => {
              const category = categories.find(cat => cat.id === categoryId)
              if (!category) return null
              
              return (
                <div 
                  key={categoryId}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#f74116] bg-[#f74116]/10 border border-[#f74116]/20 rounded-full"
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                  <button 
                    className="ml-1 font-bold text-[#f74116] hover:text-[#f74116]/80"
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

        {/* Products Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#f74116]/10 p-6 hover:shadow-lg transition-all duration-200">
          {filteredProducts.length === 0 && products.length > 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No se encontraron productos</h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                No hay productos que coincidan con los filtros seleccionados
              </p>
              <button
                className="px-6 py-3 bg-[#f74116] text-white rounded-lg hover:bg-[#f74116]/90 transition-colors font-medium"
                onClick={handleClearAllFilters}
                type="button"
              >
                Limpiar filtros
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <EmptyState />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Catálogo de Productos</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Mostrando {filteredProducts.length} de {products.length} productos
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                    onShowDescription={handleShowDescription}
                    processing={processing}
                    isDeleting={isDeleting}
                    categories={categories}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Modals */}
        <ProductModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingProduct(null)
            setError(null)
          }}
          onSave={handleSaveProduct}
          product={editingProduct}
          error={error}
          categories={categories}
        />

        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          productName={productToDelete?.name || ''}
          isDeleting={isDeleting}
        />

        <DescriptionModal
          isOpen={showDescriptionModal}
          onClose={() => setShowDescriptionModal(false)}
          productName={selectedProductDescription.name}
          description={selectedProductDescription.description}
        />

        <CategoryManagementModal
          isOpen={showCategoryModal}
          onClose={() => {
            setShowCategoryModal(false)
            setError(null)
          }}
          categories={categories}
          onAddCategory={handleAddCategory}
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategory}
          getProductCountByCategory={getProductCountByCategory}
          error={error}
        />
      </div>
    </div>
  )
}

export default Products