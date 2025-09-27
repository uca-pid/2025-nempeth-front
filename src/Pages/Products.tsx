import { useState, useEffect, useCallback, useMemo } from 'react'
import { productService, type Product } from '../services/productService'
import { useAuth } from '../contexts/useAuth'
import EmptyState from '../components/Products/EmptyState'
import DescriptionModal from '../components/Products/DescriptionModal'
import CategorySection, { type Category } from '../components/Products/CategorySection'

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (product: Omit<Product, 'id'> & { id?: string }) => Promise<void>
  product?: Product | null
  error?: string | null
}

interface ConfirmDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  productName: string
  isDeleting: boolean
}

function ProductModal({ isOpen, onClose, onSave, product, error }: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price
      })
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0
      })
    }
    setSaving(false) // Resetear estado de guardado
  }, [product, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim() && formData.description.trim() && formData.price > 0) {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h3 className="text-xl font-semibold text-gray-800">{product ? 'Editar Producto' : 'Agregar Producto'}</h3>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-md text-2xl text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
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

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-6">
            <button
              type="button"
              className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
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
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-800">Confirmar eliminación</h3>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-md text-2xl text-gray-500 transition hover:bg-gray-200 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onClose}
            disabled={isDeleting}
            type="button"
          >
            ×
          </button>
        </div>

        <div className="space-y-3 px-6 py-6 text-center">
          <div className="text-4xl">⚠️</div>
          <p className="text-base text-gray-700">
            ¿Estás seguro de que deseas eliminar el producto <strong className="font-semibold text-gray-900">"{productName}"</strong>?
          </p>
          <p className="text-sm italic text-gray-500">Esta acción no se puede deshacer.</p>
        </div>

        <div className="flex items-center justify-center gap-3 border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
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

  // Función temporal para asignar categorías basada en palabras clave en el nombre del producto
  // En el futuro esta información vendrá del backend
  const getCategoryForProduct = (product: Product): { id: string; name: string; icon: string } => {
    const name = product.name.toLowerCase()
    
    if (name.includes('bebida') || name.includes('jugo') || name.includes('agua') || name.includes('refresco') || name.includes('café') || name.includes('té')) {
      return { id: 'bebidas', name: 'Bebidas', icon: '🥤' }
    }
    if (name.includes('hamburguesa') || name.includes('sandwich') || name.includes('torta') || name.includes('empanada')) {
      return { id: 'principales', name: 'Platos Principales', icon: '🍔' }
    }
    if (name.includes('ensalada') || name.includes('vegetal') || name.includes('verdura') || name.includes('lechuga')) {
      return { id: 'ensaladas', name: 'Ensaladas', icon: '🥗' }
    }
    if (name.includes('postre') || name.includes('helado') || name.includes('torta') || name.includes('flan') || name.includes('dulce')) {
      return { id: 'postres', name: 'Postres', icon: '🍰' }
    }
    if (name.includes('pizza') || name.includes('italiana')) {
      return { id: 'pizzas', name: 'Pizzas', icon: '🍕' }
    }
    
    // Categoría por defecto
    return { id: 'otros', name: 'Otros', icon: '🍽️' }
  }

  // Agrupar productos por categorías usando useMemo para optimizar
  const categorizedProducts = useMemo(() => {
    const categoryMap = new Map<string, Category>()

    products.forEach(product => {
      const categoryInfo = getCategoryForProduct(product)
      
      if (!categoryMap.has(categoryInfo.id)) {
        categoryMap.set(categoryInfo.id, {
          id: categoryInfo.id,
          name: categoryInfo.name,
          icon: categoryInfo.icon,
          products: []
        })
      }
      
      categoryMap.get(categoryInfo.id)!.products.push(product)
    })

    return Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [products])

  const loadProducts = useCallback(async () => {
    if (!user?.userId) return

    try {
      setLoading(true)
      setError(null)
      const fetchedProducts = await productService.getProducts(user.userId)
      setProducts(fetchedProducts)
    } catch (err) {
      console.error('Error cargando productos:', err)
      setError('Error al cargar los productos')
    } finally {
      setLoading(false)
    }
  }, [user?.userId])

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProducts()
  }, [loadProducts])

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
    if (!user?.userId || processing || isDeleting) return
    
    setProductToDelete(product)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!productToDelete || !user?.userId || isDeleting) return

    try {
      setIsDeleting(true)
      setError(null)
      await productService.deleteProduct(productToDelete.id, user.userId)
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
    if (!user?.userId || processing) return

    try {
      setProcessing(true)
      setError(null) // Limpiar errores previos
      
      if (productData.id) {
        // Editar producto existente
        await productService.updateProduct(
          productData.id, 
          user.userId, 
          {
            name: productData.name,
            description: productData.description,
            price: productData.price
          }
        )
      } else {
        // Agregar nuevo producto
        await productService.createProduct(user.userId, {
          name: productData.name,
          description: productData.description,
          price: productData.price
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
          
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-6 py-3 text-base font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-xl disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleAddProduct}
            disabled={processing}
            type="button"
          >
            <span className="text-xl font-bold">+</span>
            {processing ? 'Procesando...' : 'Agregar Producto'}
          </button>
        </div>
      </div>
      
      <div className="p-6 md:p-10">

        {/* Productos agrupados por categorías */}
        <div className="mt-8 xl:max-w-[1400px] xl:mx-auto">
          {products.length === 0 ? (
            <EmptyState onAddProduct={handleAddProduct} />
          ) : (
            categorizedProducts.map(category => (
              <CategorySection
                key={category.id}
                category={category}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onShowDescription={handleShowDescription}
                processing={processing}
                isDeleting={isDeleting}
              />
            ))
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
      </div>
    </div>
  )
}

export default Products
