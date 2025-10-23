import { useState, useEffect } from 'react'
import { searchUnsplashPhoto } from '../../services/unsplashService'
import { type Product } from '../../services/productService'
import { type Category as CategoryType } from '../../services/categoryService'

interface TestingCardProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  onShowDescription: (product: Product) => void
  processing: boolean
  isDeleting: boolean
  categories: CategoryType[]
}

function TestingCard({ 
  product, 
  onEdit, 
  onDelete, 
  onShowDescription, 
  processing, 
  isDeleting,
  categories 
}: TestingCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>('https://via.placeholder.com/400x300?text=Cargando...')

  // Encontrar la categoría del producto
  const productCategory = categories.find(category => category.id === product.categoryId)

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showMenu && !target.closest('.menu-container')) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  // Cargar imagen desde Unsplash
  useEffect(() => {
    const loadImage = async () => {
      const query = product?.name || 'product'
      const url = await searchUnsplashPhoto(query)
      setImageUrl(url || '/not_image.png')
    }
    loadImage()
  }, [product?.name])

  // Función para truncar texto a aproximadamente 1 línea
  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  const description = product?.description || 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore nobis iure obcaecati pariatur. Officiis qui, enim cupiditate aliquam corporis iste.'
  return (
    <div className="relative block overflow-hidden group">
      {/* Botones en la parte superior derecha */}
      <div className="absolute z-10 flex gap-2 end-4 top-4">
        
        <div className="relative menu-container">
          <button
            className="rounded-full bg-white p-1.5 text-gray-900 transition hover:text-gray-900/75"
            onClick={(e) => {
              e.preventDefault()
              setShowMenu(!showMenu)
            }}
          >
            <span className="sr-only">Opciones</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
              />
            </svg>
          </button>

          {/* Menú desplegable */}
          {showMenu && (
            <div className="absolute right-0 z-20 w-40 py-1 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg top-full">
              <button
                className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={(e) => {
                  e.preventDefault()
                  onEdit(product)
                  setShowMenu(false)
                }}
                disabled={processing}
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
                Editar
              </button>
              <button
                className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={(e) => {
                  e.preventDefault()
                  onDelete(product)
                  setShowMenu(false)
                }}
                disabled={processing || isDeleting}
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
                Eliminar
              </button>
            </div>
          )}
        </div>
      </div>

            <img
        src={imageUrl}
        alt=""
        className="object-cover w-full h-64 transition duration-500 group-hover:scale-105 sm:h-72"
      />

      {/* Badge de categoría */}
      {productCategory && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-gray-200">
          <span className="text-sm">{productCategory.icon}</span>
          <span className="text-xs font-medium text-gray-700">{productCategory.name}</span>
        </div>
      )}

      <div className="relative p-6 bg-white border border-gray-100">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-green-600">
            ${product?.price || '49.99'}
          </p>
          <span className="text-sm text-red-500">
            (${product?.cost || '25.00'})
          </span>
        </div>

        <h3 className="mt-1.5 text-lg font-medium text-gray-900">{product?.name || 'Wireless Headphones'}</h3>

        <button
          className="mt-1.5 text-left line-clamp-1 text-gray-700 cursor-pointer hover:bg-gray-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-1 py-0.5 transition-all"
          onClick={() => onShowDescription(product)}
          type="button"
        >
          {truncateText(description)}
        </button>
      </div>
    </div>
  )
}

export default TestingCard