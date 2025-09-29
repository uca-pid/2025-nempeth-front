import { IoTrashOutline, IoAddOutline, IoRemoveOutline } from 'react-icons/io5'
import { type Product } from '../../services/productService'

export interface CartItem {
  product: Product
  quantity: number
}

interface ShoppingCartProps {
  items: CartItem[]
  onUpdateQuantity: (productId: string, newQuantity: number) => void
  onRemoveItem: (productId: string) => void
  onCreateOrder: () => void
  isCreatingOrder: boolean
  isMobile?: boolean
}

function ShoppingCart({ 
  items, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCreateOrder, 
  isCreatingOrder,
  isMobile = false
}: ShoppingCartProps) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Carrito de Ventas</h2>
        <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
          <div className="text-4xl sm:text-6xl opacity-30 mb-4">🛒</div>
          <h3 className="text-base sm:text-lg font-medium text-gray-500 mb-2">Carrito vacío</h3>
          <p className="text-xs sm:text-sm text-gray-400">Agrega productos para crear una orden</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <h2 className="text-base sm:text-lg font-bold text-gray-900">Carrito de Ventas</h2>
          <div className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1">
            <span className="text-xs sm:text-sm font-semibold text-blue-800">{totalItems} items</span>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="max-h-80 sm:max-h-96 overflow-y-auto">
        {items.map((item) => (
          <div key={item.product.id} className="border-b border-gray-100 p-3 sm:p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start sm:items-center gap-3">
              {/* Product info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 truncate">{item.product.name}</h3>
                <p className="text-xs sm:text-sm text-gray-500">${item.product.price.toFixed(2)} c/u</p>
              </div>

              {/* Quantity controls - Stack vertically on mobile */}
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-2">
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-all duration-200 hover:bg-gray-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    type="button"
                  >
                    <IoRemoveOutline className="text-xs sm:text-sm" />
                  </button>
                  
                  <div className="flex h-7 w-10 sm:h-8 sm:w-12 items-center justify-center rounded bg-gray-50 border border-gray-200">
                    <span className="text-xs sm:text-sm font-semibold text-gray-900">{item.quantity}</span>
                  </div>
                  
                  <button
                    className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-all duration-200 hover:bg-gray-200 hover:scale-105 active:scale-95"
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                    type="button"
                  >
                    <IoAddOutline className="text-xs sm:text-sm" />
                  </button>
                </div>

                {/* Remove button */}
                <button
                  className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-red-100 text-red-600 transition-all duration-200 hover:bg-red-200 hover:scale-105 active:scale-95"
                  onClick={() => onRemoveItem(item.product.id)}
                  type="button"
                  title="Eliminar del carrito"
                >
                  <IoTrashOutline className="text-xs sm:text-sm" />
                </button>
              </div>
            </div>

            {/* Subtotal */}
            <div className="mt-2 flex justify-end">
              <span className="text-xs sm:text-sm font-semibold text-gray-900">
                Subtotal: ${(item.product.price * item.quantity).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer with total and create order button */}
      <div className="bg-gray-50 border-t border-gray-200 p-4 sm:p-6 space-y-3 sm:space-y-4">
        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="text-base sm:text-lg font-semibold text-gray-900">Total:</span>
          <span className="text-lg sm:text-xl font-bold text-blue-600">${totalPrice.toFixed(2)}</span>
        </div>

        {/* Create order button */}
        <button
          className="w-full rounded-xl bg-blue-600 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
          onClick={onCreateOrder}
          disabled={isCreatingOrder}
          type="button"
        >
          {isCreatingOrder ? 'Creando orden...' : 'Crear Orden de Venta'}
        </button>
      </div>
    </div>
  )
}

export default ShoppingCart