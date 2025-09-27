import { IoOptionsOutline, IoTrashSharp } from 'react-icons/io5'
import { type Product } from '../../services/productService'

interface ProductCardProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  onShowDescription: (product: Product) => void
  processing: boolean
  isDeleting: boolean
}

function ProductCard({ 
  product, 
  onEdit, 
  onDelete, 
  onShowDescription, 
  processing, 
  isDeleting 
}: ProductCardProps) {
  return (
    <div className="group flex min-h-[320px] flex-col overflow-hidden rounded-2xl border bg-white p-0 shadow-md ring-1 ring-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-gray-300">
      {/* Header: Enhanced title with gradient background and subtle hover effect */}
      <div className="relative px-6 pt-6 pb-4">
        <h3 className="text-xl font-bold tracking-tight text-gray-900 transition-colors">
          {product.name}
        </h3>
      </div>

      {/* Body: Enhanced description with better typography and hover animation */}
      <div className="flex-1 px-6 py-4">
        <div
          className="min-h-[140px] max-h-[140px] rounded-xl border border-gray-200/50 bg-gray-50/50 p-4 text-sm leading-relaxed text-gray-700 shadow-inner transition-all duration-300 group-hover:bg-gray-100/80 group-hover:shadow-md cursor-pointer overflow-hidden"
          onClick={() => onShowDescription(product)}
        >
          <div 
            className="overflow-hidden"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 6,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {product.description}
          </div>
        </div>
      </div>

      {/* Footer: Improved layout with price and actions, enhanced hover effects */}
      <div className="mt-4 flex items-center justify-between px-6 pb-6">
        {/* Price: Larger, more prominent with gradient background */}
        <div className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 px-4 py-2 text-base font-semibold text-emerald-800 ring-1 ring-emerald-200 transition-all group-hover:ring-emerald-300">
          ${product.price.toFixed(2)}
        </div>

        {/* Actions: Refined buttons with beautiful, color-matched icons */}
        <div className="flex items-center gap-4">
          {/* Edit button */}
          <button
            className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100/90 ring-1 ring-indigo-200/90 
                      transition-all duration-300 hover:scale-110 hover:bg-indigo-200 hover:ring-indigo-300 active:scale-95 
                      disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => onEdit(product)}
            aria-label="Edit product"
            disabled={processing}
            type="button"
          >
            <IoOptionsOutline size={20} className="text-indigo-600 transition-all duration-200 hover:text-indigo-700 group-hover:rotate-3" />
          </button>

          {/* Delete button */}
          <button
            className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-100/90 ring-1 ring-rose-200/90 
                      transition-all duration-300 hover:scale-110 hover:bg-rose-200 hover:ring-rose-300 active:scale-95 
                      disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => onDelete(product)}
            aria-label="Delete product"
            disabled={processing || isDeleting}
            type="button"
          >
            <IoTrashSharp size={20} className="text-rose-600 transition-all duration-200 hover:text-rose-700 group-hover:-rotate-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard