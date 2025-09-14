import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import '../Styles/Products.css'
import { productService, type Product } from '../services/productService'
import { useAuth } from '../contexts/useAuth'

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (product: Omit<Product, 'id'> & { id?: string }) => Promise<void>
  product?: Product | null
  error?: string | null
}

interface ProductsProps {
  onBack?: () => void
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
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{product ? 'Editar Producto' : 'Agregar Producto'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="product-form">
          {error && (
            <div className="error-message" style={{ 
              color: '#e74c3c', 
              backgroundColor: '#fdf2f2', 
              padding: '10px', 
              borderRadius: '4px', 
              marginBottom: '15px',
              border: '1px solid #fecaca' 
            }}>
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="name">Nombre del Producto</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Ingresa el nombre del producto"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Describe el producto"
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Precio ($)</label>
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
            />
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-save"
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

function Products({ onBack }: ProductsProps = {}) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

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
      <div className="products-container">
        <div className="loading-state">
          <p>Cargando productos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="products-container">
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={loadProducts}>Reintentar</button>
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

  const handleDeleteProduct = async (id: string) => {
    if (!user?.userId || processing) return

    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        setProcessing(true)
        setError(null)
        await productService.deleteProduct(id, user.userId)
        // Recargar la lista para asegurar consistencia
        await loadProducts()
      } catch (err) {
        console.error('Error eliminando producto:', err)
        setError('Error al eliminar el producto. Por favor, intenta nuevamente.')
      } finally {
        setProcessing(false)
      }
    }
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
    <div className="products-container">
      {/* Header */}
      <div className="products-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => onBack ? onBack() : navigate('/home')}>
            ← Volver
          </button>
          <h1 className="products-title">Gestión de Productos</h1>
          <p className="products-subtitle">
            Administra tu carta y controla tus productos
          </p>
        </div>
        
        <button 
          className="btn-add-product" 
          onClick={handleAddProduct}
          disabled={processing}
        >
          <span className="btn-icon">+</span>
          {processing ? 'Procesando...' : 'Agregar Producto'}
        </button>
      </div>

      {/* Grid de productos */}
      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <div className="card-body">
              <h3 className="product-name">{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <div className="product-price">${product.price.toFixed(2)}</div>
            </div>
            
            <div className="card-actions">
              <button 
                className="btn-edit"
                onClick={() => handleEditProduct(product)}
                title="Editar producto"
                disabled={processing}
              >
                ✏️
              </button>
              <button 
                className="btn-delete"
                onClick={() => handleDeleteProduct(product.id)}
                title="Eliminar producto"
                disabled={processing}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No hay productos registrados</h3>
            <p>Comienza agregando tu primer producto</p>
            <button className="btn-add-first" onClick={handleAddProduct}>
              Agregar Primer Producto
            </button>
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
      />
    </div>
  )
}

export default Products
