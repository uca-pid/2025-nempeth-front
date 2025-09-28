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

  // Encontrar la categoría del producto
  const productCategory = categories.find(category => category.id === product.categoryId)

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = () => {
    onAddToCart(product, quantity)
    setQuantity(1) // Resetear cantidad después de agregar
  }

  return (
    <div className="group flex min-h-[320px] flex-col overflow-hidden rounded-2xl border bg-white p-0 shadow-md ring-1 ring-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-gray-300">
      {/* Header: Enhanced title with gradient background and subtle hover effect */}
      <div className="relative px-6 pt-6 pb-4">
        {/* Icono de categoría en la esquina superior derecha */}
        {productCategory && (
          <div className="absolute top-6 right-6">
            <div 
              className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100/90 ring-1 ring-amber-200/90 
                        transition-all duration-300 hover:scale-110 hover:bg-amber-200 hover:ring-amber-300"
              title={productCategory.name}
            >
              <span className="text-xl" role="img" aria-label={productCategory.name}>
                {productCategory.icon}
              </span>
            </div>
          </div>
        )}
        
        <h3 className="text-xl font-bold tracking-tight text-gray-900 transition-colors pr-16">
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

      {/* Footer: Price and quantity controls */}
      <div className="mt-4 px-6 pb-6 space-y-4">
        {/* Price */}
        <div className="flex justify-center">
          <div className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 px-4 py-2 text-base font-semibold text-emerald-800 ring-1 ring-emerald-200 transition-all group-hover:ring-emerald-300">
            ${product.price.toFixed(2)}
          </div>
        </div>

        {/* Quantity controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-all duration-200 hover:bg-gray-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
            type="button"
          >
            <IoRemoveOutline className="text-lg" />
          </button>
          
          <div className="flex h-10 w-16 items-center justify-center rounded-lg bg-gray-50 border-2 border-gray-200">
            <span className="text-lg font-semibold text-gray-900">{quantity}</span>
          </div>
          
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-all duration-200 hover:bg-gray-200 hover:scale-105 active:scale-95"
            onClick={() => handleQuantityChange(quantity + 1)}
            type="button"
          >
            <IoAddOutline className="text-lg" />
          </button>
        </div>

        {/* Add to cart button */}
        <div className="flex justify-center">
          <button
            className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
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