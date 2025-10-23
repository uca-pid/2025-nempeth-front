import { useState, useEffect } from 'react'
import { searchUnsplashPhoto } from '../../services/unsplashService'
import { type Product } from '../../services/productService'
import { IoCloseOutline } from 'react-icons/io5'

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
  isOpen: boolean
  onClose: () => void
}

// Componente para manejar la imagen de cada producto
function CartItemImage({ productName }: { productName: string }) {
  const [imageUrl, setImageUrl] = useState<string>('https://via.placeholder.com/400x300?text=Cargando...')

  useEffect(() => {
    const loadImage = async () => {
      const query = productName || 'product'
      const url = await searchUnsplashPhoto(query)
      setImageUrl(url || '/not_image.png')
    }
    loadImage()
  }, [productName])

  return (
    <img
      src={imageUrl}
      alt={productName}
      className="w-[80px] h-[80px] object-cover rounded-lg flex-shrink-0"
    />
  )
}

// Componente para manejar la imagen en vista móvil
function CartItemImageMobile({ productName }: { productName: string }) {
  const [imageUrl, setImageUrl] = useState<string>('https://via.placeholder.com/400x300?text=Cargando...')

  useEffect(() => {
    const loadImage = async () => {
      const query = productName || 'product'
      const url = await searchUnsplashPhoto(query)
      setImageUrl(url || '/not_image.png')
    }
    loadImage()
  }, [productName])

  return (
    <img
      src={imageUrl}
      alt={productName}
      className="flex-shrink-0 object-cover w-20 h-20 rounded-lg sm:w-24 sm:h-24"
    />
  )
}

function ShoppingCart({ 
  items, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCreateOrder, 
  isCreatingOrder,
  isOpen,
  onClose
}: ShoppingCartProps) {
  const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

  // Efecto para bloquear el scroll cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      
      return () => {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  const cartContent = items.length === 0 ? (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 text-6xl opacity-30">🛒</div>
      <h3 className="mb-2 text-lg font-medium text-gray-500">Carrito vacío</h3>
      <p className="text-sm text-gray-400">Agrega productos para crear una orden</p>
    </div>
  ) : null

  const handleDecrement = (productId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      onUpdateQuantity(productId, currentQuantity - 1)
    }
  }

  const handleIncrement = (productId: string, currentQuantity: number) => {
    onUpdateQuantity(productId, currentQuantity + 1)
  }

  return (
    <>
      {/* Overlay de fondo */}
      <div 
        className="fixed inset-0 z-50 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal del carrito */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-[70vw] h-[85vh] overflow-hidden shadow-2xl border border-[#f74116]/10 transform transition-transform duration-300 ease-out flex flex-col">
          
          {/* Header del modal */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-[#fff1eb] to-white flex-shrink-0">
            <h2 className="text-lg font-bold text-gray-900">Carrito de Ventas</h2>
            <button
              className="p-2 transition-colors rounded-full hover:bg-gray-100"
              onClick={onClose}
              type="button"
            >
              <IoCloseOutline className="text-xl text-gray-600" />
            </button>
          </div>

          {/* Contenido del modal */}
          <div className="flex flex-col flex-1 p-4 overflow-hidden">
            {cartContent}
            
            {items.length > 0 && (
              <div className="flex flex-col flex-1 w-full overflow-hidden">
                {/* Vista de tabla para pantallas grandes (oculta en móvil) */}
                <div className="hidden lg:flex lg:flex-col lg:flex-1 lg:overflow-hidden">
                  {/* Header fijo de la tabla */}
                  <div className="flex-shrink-0 overflow-hidden bg-white rounded-t-xl">
                      <table className="w-full table-fixed">
                        <thead>
                          <tr className="border-b border-gray-400 text-[#7f7f7f] text-sm font-medium uppercase leading-[14px] tracking-wide">
                            <th className="px-4 py-3 text-left" style={{ width: '40%' }}>Producto</th>
                            <th className="px-4 py-3 text-center" style={{ width: '15%' }}>Precio</th>
                            <th className="px-4 py-3 text-center" style={{ width: '20%' }}>Cantidad</th>
                            <th className="px-4 py-3 text-center" style={{ width: '15%' }}>Subtotal</th>
                            <th className="px-4 py-3" style={{ width: '10%' }}></th>
                          </tr>
                        </thead>
                      </table>
                    </div>
                    
                    {/* Contenido scrolleable de la tabla */}
                    <div className="flex-1 overflow-y-auto bg-white rounded-b-xl">
                      <table className="w-full table-fixed">
                        <tbody>
                          {items.map((item) => (
                            <tr key={item.product.id} className="text-center border-b border-gray-100">
                              <td className="px-4 py-4 text-left align-middle" style={{ width: '40%' }}>
                                <div className="flex items-center gap-3">
                                  <CartItemImage productName={item.product.name} />
                                  <span className="text-[#191919] font-medium">{item.product.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-center text-[#191919] font-medium" style={{ width: '15%' }}>
                                ${item.product.price.toFixed(2)}
                              </td>
                              <td className="px-4 py-4 text-center" style={{ width: '20%' }}>
                                <div className="inline-flex items-center justify-center gap-3 px-4 py-2 bg-white rounded-full border border-[#a0a0a0]">
                                  <button
                                    onClick={() => handleDecrement(item.product.id, item.quantity)}
                                    className="transition-opacity cursor-pointer hover:opacity-70"
                                    type="button"
                                  >
                                    <svg
                                      width="14"
                                      height="15"
                                      viewBox="0 0 14 15"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M2.33398 7.5H11.6673"
                                        stroke="#666666"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </button>
                                  <span className="w-8 text-center text-[#191919] text-base font-normal">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => handleIncrement(item.product.id, item.quantity)}
                                    className="transition-opacity cursor-pointer hover:opacity-70"
                                    type="button"
                                  >
                                    <svg
                                      width="14"
                                      height="15"
                                      viewBox="0 0 14 15"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M2.33398 7.49998H11.6673M7.00065 2.83331V12.1666V2.83331Z"
                                        stroke="#1A1A1A"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-center text-[#191919] font-semibold" style={{ width: '15%' }}>
                                ${(item.product.price * item.quantity).toFixed(2)}
                              </td>
                              <td className="px-4 py-4 text-center" style={{ width: '10%' }}>
                                <button
                                  onClick={() => onRemoveItem(item.product.id)}
                                  className="transition-opacity cursor-pointer hover:opacity-70"
                                  type="button"
                                >
                                  <svg
                                    width="24"
                                    height="25"
                                    viewBox="0 0 24 25"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M12 23.5C18.0748 23.5 23 18.5748 23 12.5C23 6.42525 18.0748 1.5 12 1.5C5.92525 1.5 1 6.42525 1 12.5C1 18.5748 5.92525 23.5 12 23.5Z"
                                      stroke="#CCCCCC"
                                      strokeMiterlimit="10"
                                    />
                                    <path
                                      d="M16 8.5L8 16.5"
                                      stroke="#666666"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                    <path
                                      d="M16 16.5L8 8.5"
                                      stroke="#666666"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Vista de cards para pantallas pequeñas (oculta en desktop) */}
                  <div className="flex-1 space-y-4 overflow-y-auto lg:hidden">
                    {items.map((item) => (
                      <div key={item.product.id} className="p-4 bg-white border border-gray-200 rounded-xl">
                                    <div className="flex gap-3 mb-4">
                          <CartItemImageMobile productName={item.product.name} />
                          <div className="flex flex-col justify-between flex-1 min-w-0">
                            <div>
                              <h3 className="text-[#191919] font-semibold text-sm sm:text-base mb-1 truncate">
                                {item.product.name}
                              </h3>
                              <p className="text-[#f74116] font-bold text-base sm:text-lg">
                                ${item.product.price.toFixed(2)}
                              </p>
                            </div>
                            <button
                              onClick={() => onRemoveItem(item.product.id)}
                              className="self-start mt-1 text-xs font-medium text-red-500 transition-colors hover:text-red-700 sm:text-sm"
                              type="button"
                            >
                              Eliminar
                            </button>
                          </div>
                                    </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-gray-50 rounded-full border border-[#a0a0a0]">
                            <button
                              onClick={() => handleDecrement(item.product.id, item.quantity)}
                              className="transition-opacity cursor-pointer hover:opacity-70"
                              type="button"
                            >
                  <svg
                    width="12"
                    height="13"
                    viewBox="0 0 14 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="sm:w-[14px] sm:h-[15px]"
                  >
                    <path
                      d="M2.33398 7.5H11.6673"
                      stroke="#666666"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <span className="w-6 sm:w-8 text-center text-[#191919] text-sm sm:text-base font-semibold">
                  {item.quantity}
                </span>
                            <button
                              onClick={() => handleIncrement(item.product.id, item.quantity)}
                              className="transition-opacity cursor-pointer hover:opacity-70"
                              type="button"
                            >
                              <svg
                                width="12"
                                height="13"
                                viewBox="0 0 14 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="sm:w-[14px] sm:h-[15px]"
                              >
                                <path
                                  d="M2.33398 7.49998H11.6673M7.00065 2.83331V12.1666V2.83331Z"
                                  stroke="#1A1A1A"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 mb-0.5">Subtotal</p>
                            <p className="text-[#191919] font-bold text-base sm:text-lg">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Footer fijo con resumen del total - Responsive */}
          {items.length > 0 && (
            <div className="flex-shrink-0 p-4 bg-white border-t border-gray-200 sm:p-6">
              <div className="flex items-center justify-between py-3 mb-4">
                <h2 className="text-[#191919] text-lg sm:text-xl font-medium">
                  Total del Carrito
                </h2>
                <span className="text-[#22c55e] text-xl sm:text-2xl font-bold">${totalPrice.toFixed(2)}</span>
              </div>
              <button
                onClick={onCreateOrder}
                disabled={isCreatingOrder}
                className="w-full text-white px-6 sm:px-10 py-3 sm:py-4 bg-[#f74116] rounded-[44px] text-sm sm:text-base font-semibold hover:bg-[#f74116]/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                type="button"
              >
                {isCreatingOrder ? 'Creando orden...' : 'Crear orden de venta'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ShoppingCart