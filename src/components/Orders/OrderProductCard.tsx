import { useState } from 'react'
import { IoAddOutline, IoRemoveOutline, IoCartOutline } from 'react-icons/io5'
import { type Product } from '../../services/productService'
import { type Category as CategoryType } from '../../services/categoryService'

interface OrderProductCardProps {
  product: Product
  categories: CategoryType[]
  onAddToCart: (product: Product, quantity: number) => void
  onShowDescription: (product: Product) => void
}

function OrderProductCard({ 
  product, 
  categories, 
  onAddToCart, 
  onShowDescription 
}: OrderProductCardProps) {
  const [quantity, setQuantity] = useState(1)

  const productCategory = categories.find(c => c.id === product.categoryId)

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) setQuantity(newQuantity)
  }

  const handleAddToCart = () => {
    onAddToCart(product, quantity)
    setQuantity(1)
  }

  return (
    <div className="group flex min-h-[280px] flex-col overflow-hidden rounded-2xl border bg-white p-0 shadow-md ring-1 ring-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-gray-300">
      {/* Contenido con divisores para mantener separación */}
      <div className="flex flex-col flex-1 divide-y divide-gray-100">
        
        {/* Header: Título e icono de categoría */}
        <div className="relative items-center px-5 pb-5 pt-7">
          {productCategory && (
            <div className="absolute right-3 top-3">
              <div 
                className="flex items-center justify-center w-12 h-12 transition-all duration-300 rounded-full bg-amber-100/90 ring-1 ring-amber-200/90 hover:scale-110 hover:bg-amber-200 hover:ring-amber-300"
                title={productCategory.name}
              >
                <span className="text-xl" role="img" aria-label={productCategory.name}>
                  {productCategory.icon}
                </span>
              </div>
            </div>
          )}

          {/* Truncado con “…” si es muy largo */}
          <h3 className="pr-16 text-xl font-bold tracking-tight text-gray-900 truncate transition-colors">
            {product.name}
          </h3>
        </div>

        {/* Descripción (clamp 3 líneas) */}
        <div className="py-5 px-7">
          <div
            className="p-4 overflow-hidden text-sm leading-relaxed text-gray-700 transition-all duration-300 border shadow-inner cursor-pointer rounded-xl border-gray-200/50 bg-gray-50/50 group-hover:bg-gray-100/80 group-hover:shadow-md"
            onClick={() => onShowDescription(product)}
          >
            <div
              className="overflow-hidden"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {product.description}
            </div>
          </div>
        </div>

        {/* Precio y cantidad */}
        <div className="py-5 px-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Price */}
            <div className="flex-shrink-0">
              <div className="inline-flex items-center px-4 py-2 text-base font-semibold transition-all rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 ring-1 ring-emerald-200 group-hover:ring-emerald-300">
                ${product.price.toFixed(2)}
              </div>
            </div>

            {/* Quantity controls */}
            <div className="flex items-center gap-3 ml-0">
              <button
                className="flex items-center justify-center text-gray-600 transition-all duration-200 bg-gray-100 rounded-full h-9 w-9 hover:scale-105 hover:bg-gray-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                type="button"
              >
                <IoRemoveOutline className="text-base" />
              </button>

              <div className="flex items-center justify-center border-2 border-gray-200 rounded-lg h-9 w-14 bg-gray-50">
                <span className="text-base font-semibold text-gray-900">{quantity}</span>
              </div>

              <button
                className="flex items-center justify-center text-gray-600 transition-all duration-200 bg-gray-100 rounded-full h-9 w-9 hover:scale-105 hover:bg-gray-200 active:scale-95"
                onClick={() => handleQuantityChange(quantity + 1)}
                type="button"
              >
                <IoAddOutline className="text-base" />
              </button>
            </div>
          </div>
        </div>

        {/* Add to cart button */}
        <div className="px-7 py-7">
          <button
            className="flex items-center justify-center w-full gap-2 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 bg-blue-600 rounded-lg shadow-md hover:scale-105 hover:bg-blue-700 hover:shadow-lg active:scale-95"
            onClick={handleAddToCart}
            type="button"
          >
            <IoCartOutline className="text-lg" />
            Agregar al carrito
          </button>
        </div>

      </div>
    </div>
  )
}

export default OrderProductCard
