import { useState, useEffect, useCallback, useMemo } from 'react'
import { productService, type Product } from '../services/productService'
import { categoryService, type Category as CategoryType } from '../services/categoryService'
import { useAuth } from '../contexts/useAuth'
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
              className="w-full rounded-lg border-2 border-gray-200 px-3 py-3 text-base transition focus:border-[#2563eb] focus:outline-none focus:ring-4 focus:ring-blue-100"
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
              className="w-full rounded-lg border-2 border-gray-200 px-3 py-3 text-base transition focus:border-[#2563eb] focus:outline-none focus:ring-4 focus:ring-blue-100"
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
              className="w-full min-h-[4rem] rounded-lg border-2 border-gray-200 px-3 py-3 text-base transition focus:border-[#2563eb] focus:outline-none focus:ring-4 focus:ring-blue-100"
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
              className="w-full rounded-lg border-2 border-gray-200 px-3 py-3 text-base transition focus:border-[#2563eb] focus:outline-none focus:ring-4 focus:ring-blue-100"
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
              className="rounded-lg bg-[#2563eb] px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-600 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
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
      <div className="min-h-screen bg-[#f8f7fc] p-6 md:p-10">
        <div className="flex min-h-[50vh] items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white/70">
          <p className="text-base font-medium text-gray-600">Cargando productos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f7fc] p-6 md:p-10">
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-base font-semibold text-red-600">Error: {error}</p>
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
    
    try {
      await categoryService.deleteCategory(businessId, id)
      await loadCategories() // Recargar categorías
    } catch (err) {
      console.error('Error eliminando categoría:', err)
      setError('Error al eliminar la categoría')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header que coincide con Sidebar */}
      <div className="bg-white border-b border-gray-200 p-7">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold leading-tight text-gray-900 md:text-2xl">Gestión de Productos</h1>
            <span className="text-xs font-medium text-gray-600 md:text-sm">
              Administra tu carta y controla tus productos
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-1 md:p-10">

        <div className="flex items-center justify-start gap-4">

          <button
            className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-6 py-3 text-base font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-xl disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleAddProduct}
            disabled={processing}
            type="button"
          >
            <span className="text-xl font-bold">+</span>
            {processing ? 'Procesando...' : 'Agregar Producto'}
          </button>

          <button
            className="inline-flex items-center gap-2 rounded-xl bg-[#ff5804] px-6 py-3 text-base font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-xl disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => setShowCategoryModal(true)}
            disabled={processing}
            type="button"
          >
            <span className="text-xl font-bold">+</span>
            {processing ? 'Procesando...' : 'Administrar categorías'}
          </button>
          
        </div>

        {/* Sección de filtros y categorías */}
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Dropdown de filtros */}
            <div className="relative filter-dropdown-container">
              <button
                className="
                  flex h-12 w-12 items-center justify-center 
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
                disabled={processing}
                type="button"
                onClick={handleToggleFilterDropdown}
              >
                <IoFilterCircle className="text-xl" />
              </button>
              
              {/* Dropdown menu */}
              {showFilterDropdown && (
                <div className="absolute left-0 z-50 w-64 py-2 mt-2 bg-white border border-gray-200 shadow-xl top-full rounded-xl">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-800">Filtrar por categoría</h3>
                  </div>
                  
                  <div className="overflow-y-auto max-h-64">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        className={`
                          w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors
                          ${selectedCategoryFilters.includes(category.id) ? 'bg-blue-50 text-blue-800' : 'text-gray-700'}
                        `}
                        onClick={() => handleToggleCategoryFilter(category.id)}
                        type="button"
                      >
                        <span className="text-lg">{category.icon}</span>
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
            <div className="flex flex-wrap items-center gap-2">
              {selectedCategoryFilters.map(categoryId => {
                const category = categories.find(cat => cat.id === categoryId)
                if (!category) return null
                
                return (
                  <div 
                    key={categoryId}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-800 bg-blue-100 border border-blue-200 rounded-full"
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                    <button 
                      className="ml-1 font-bold text-blue-600 hover:text-blue-800"
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
        <div className="mt-8 xl:max-w-[1400px] xl:mx-auto">
          {filteredProducts.length === 0 && products.length > 0 ? (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <div className="text-6xl opacity-50">🔍</div>
              <h3 className="text-xl font-semibold text-gray-700">No se encontraron productos</h3>
              <p className="text-gray-500">No hay productos que coincidan con los filtros seleccionados.</p>
              <button
                className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-600"
                onClick={handleClearAllFilters}
                type="button"
              >
                Limpiar filtros
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <EmptyState onAddProduct={handleAddProduct} />
          ) : (
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
          )}
        </div>

        {/* Modal */}
        <ProductModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingProduct(null)
            setError(null) // Limpiar errores al cerrar
          }}
          onSave={handleSaveProduct}
          product={editingProduct}
          error={error}
          categories={categories}
        />

        {/* Modal de confirmación de eliminación */}
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          productName={productToDelete?.name || ''}
          isDeleting={isDeleting}
        />

        {/* Modal de descripción completa */}
        <DescriptionModal
          isOpen={showDescriptionModal}
          onClose={() => setShowDescriptionModal(false)}
          productName={selectedProductDescription.name}
          description={selectedProductDescription.description}
        />

        {/* Modal de gestión de categorías */}
        <CategoryManagementModal
          isOpen={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          categories={categories}
          onAddCategory={handleAddCategory}
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategory}
        />
      </div>
    </div>
  )
}

export default Products