import { type Product } from '../../services/productService'
import ProductCard from './ProductCard'

export interface Category {
  id: string
  name: string
  icon: string
  products: Product[]
}

interface CategorySectionProps {
  category: Category
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  onShowDescription: (product: Product) => void
  processing: boolean
  isDeleting: boolean
}

function CategorySection({ 
  category, 
  onEdit, 
  onDelete, 
  onShowDescription, 
  processing, 
  isDeleting 
}: CategorySectionProps) {
  return (
    <div className="mb-12">
      {/* Divisor de categoría con diseño especial */}
      <div className="relative mb-8 flex items-center">
        {/* Línea izquierda expandible con gradiente */}
        <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-gray-400 shadow-sm"></div>
        
        {/* Contenedor central con icono y nombre - diseño mejorado */}
        <div className="mx-6 flex items-center gap-3 rounded-full bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 px-6 py-4 shadow-lg hover:shadow-xl transition-all duration-300 ring-1 ring-gray-100">
          <span className="text-3xl animate-pulse" role="img" aria-label={category.name}>
            {category.icon}
          </span>
          <h2 className="text-xl font-bold text-gray-800 tracking-wide">
            {category.name}
          </h2>
          <span className="rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1 text-sm font-bold text-indigo-700 border border-indigo-200">
            {category.products.length}
          </span>
        </div>
        
        {/* Línea derecha expandible con gradiente */}
        <div className="flex-1 h-0.5 bg-gradient-to-l from-transparent via-gray-300 to-gray-400 shadow-sm"></div>
      </div>

      {/* Grid de productos de esta categoría */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {category.products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={onEdit}
            onDelete={onDelete}
            onShowDescription={onShowDescription}
            processing={processing}
            isDeleting={isDeleting}
          />
        ))}
      </div>
    </div>
  )
}

export default CategorySection