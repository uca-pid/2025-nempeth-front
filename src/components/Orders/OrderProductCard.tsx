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
    <div className="group flex flex-col h-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-[#f74116]/30 w-full max-w-none">
      {/* Header: Título e icono de categoría */}
      <div className="relative px-6 pt-5 pb-4 bg-gradient-to-br from-gray-50 to-white">
        {productCategory && (
          <div className="absolute top-4 right-4">
            <div 
              className="flex items-center justify-center w-10 h-10 transition-all duration-300 rounded-full bg-amber-100 ring-2 ring-amber-200 hover:scale-110 hover:bg-amber-200"
              title={productCategory.name}
            >
              <span className="text-lg" role="img" aria-label={productCategory.name}>
                {productCategory.icon}
              </span>
            </div>
          </div>
        )}

        <h3 className="pr-14 text-lg font-bold tracking-tight text-gray-900 line-clamp-2">
          {product.name}
        </h3>
      </div>

      {/* Descripción */}
      <div className="px-6 py-4 flex-1">
        <div
          className="p-3 text-sm leading-relaxed text-gray-700 transition-all duration-200 border border-gray-200 rounded-lg cursor-pointer bg-gray-50/50 hover:bg-gray-100 hover:border-gray-300 line-clamp-3"
          onClick={() => onShowDescription(product)}
          title="Click para ver descripción completa"
        >
          {product.description}
        </div>
      </div>

      {/* Footer: Controles de cantidad y botón agregar */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gradient-to-br from-white to-gray-50">
        <div className="flex flex-col gap-3">
          {/* Precio - Primera fila */}
          <div className="flex justify-center">
            <div className="inline-flex items-center px-4 py-2 text-lg font-bold rounded-lg bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 ring-1 ring-emerald-200">
              ${product.price.toFixed(2)}
            </div>
          </div>

          {/* Controles de cantidad - Segunda fila */}
          <div className="flex items-center justify-center gap-2">
            <button
              className="flex items-center justify-center w-9 h-9 text-gray-600 transition-all duration-200 bg-white border-2 border-gray-300 rounded-lg hover:scale-105 hover:bg-gray-50 hover:border-gray-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              type="button"
            >
              <IoRemoveOutline className="text-base" />
            </button>

            <div className="flex items-center justify-center w-12 h-9 font-bold text-gray-900 bg-white border-2 border-gray-300 rounded-lg">
              {quantity}
            </div>

            <button
              className="flex items-center justify-center w-9 h-9 text-gray-600 transition-all duration-200 bg-white border-2 border-gray-300 rounded-lg hover:scale-105 hover:bg-gray-50 hover:border-gray-400 active:scale-95"
              onClick={() => handleQuantityChange(quantity + 1)}
              type="button"
            >
              <IoAddOutline className="text-base" />
            </button>
          </div>

          {/* Fila inferior: Botón agregar al carrito - ancho completo */}
          <button
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 bg-[#f74116] rounded-lg shadow-sm hover:bg-[#f74116]/90 hover:shadow-md active:scale-[0.98]"
            onClick={handleAddToCart}
            type="button"
          >
            <IoCartOutline className="text-lg" />
            <span>Agregar al carrito</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderProductCard
