import { useNavigate } from 'react-router-dom'
import { IoArrowRedoSharp } from 'react-icons/io5'

function Home() {
  const navigate = useNavigate()

  const handleProductsClick = () => {
    navigate('/products')
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-20 md:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">¡Bienvenido a Korven!</h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg">
            Sistema integral de gestión para bares y restaurantes
          </p>
        </div>

        <div className="mb-8 flex flex-col items-center gap-6">
          <div
            className="flex w-full max-w-5xl cursor-pointer flex-col gap-6 rounded-2xl border border-emerald-500 bg-white p-5 shadow-lg transition duration-300 hover:-translate-y-0.5 hover:border-[#f74116] hover:shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f74116] md:min-h-[100px] md:flex-row md:items-center md:gap-8"
            onClick={handleProductsClick}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                handleProductsClick()
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div className="flex flex-shrink-0 items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-100 text-4xl md:h-20 md:w-20 md:text-5xl">
                🍽️
              </div>
            </div>

            <div className="flex w-full flex-1 flex-col md:flex-row md:items-stretch md:gap-10">
              <div className="flex min-w-[240px] flex-1 flex-col gap-2">
                <h3 className="text-xl font-bold text-gray-900 md:text-[1.35rem]">Gestión de Productos</h3>
                <div className="flex flex-col gap-1 text-sm font-medium text-gray-600">
                  <span>• Crear y editar productos</span>
                  <span>• Gestionar categorías</span>
                  <span>• Control de precios</span>
                  <span>• Seguimiento de stock</span>
                </div>
              </div>

              <div className="hidden w-px -translate-x-10 bg-gray-200 md:block" />

              <div className="flex max-w-xs items-center md:pl-6">
                <p className="text-sm leading-relaxed text-gray-600">
                  Administra tu carta, precios, categorías y stock de productos de manera integral
                </p>
              </div>
            </div>

            <div className="flex flex-shrink-0 justify-center">
              <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f74116] text-white transition hover:-translate-y-0.5 hover:bg-[#e73d14] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f74116] md:h-20 md:w-20">
                <IoArrowRedoSharp className="h-6 w-6 md:h-10 md:w-10" />
              </button>
            </div>
          </div>
        </div>
    </div>
  )
}

export default Home
