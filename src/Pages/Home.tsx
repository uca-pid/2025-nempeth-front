import PresentationImage from "../assets/Beepresentation.png"
import { businessService, type BusinessDetailResponse } from '../services/businessService'
import { useEffect, useState } from "react"
import {useAuth} from "../contexts/useAuth"
import LoadingScreen from "../components/LoadingScreen"



function Home() {
    const { user } = useAuth()
    const [businessDetail, setBusinessDetail] = useState<BusinessDetailResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

      const businessId = user?.businessId
    
      // Cargar detalles del negocio
      useEffect(() => {
        const loadBusinessDetail = async () => {
          if (!businessId) {
            setLoading(false)
            return
          }
    
          try {
            setLoading(true)
            setError(null)
            const detail = await businessService.getBusinessDetail(businessId)
            setBusinessDetail(detail)
          } catch (err) {
            console.error('Error cargando detalles del negocio:', err)
            setError('Error al cargar la información del negocio')
          } finally {
            setLoading(false)
          }
        }
    
        loadBusinessDetail()
      }, [businessId])

      // Mostrar pantalla de carga
      if (loading) {
        return <LoadingScreen message="Cargando información del negocio..." />
      }

      // Mostrar error si ocurrió
      if (error) {
        return (
          <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-white via-[#fff1eb] to-white">
            <div className="text-center">
              <div className="mb-4 text-red-500">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">Error al cargar datos</h2>
              <p className="text-gray-600">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-[#f74116] text-white rounded-lg hover:bg-[#f74116]/90 transition-colors"
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        )
      }


  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white via-[#fff1eb] to-white overflow-hidden">
      <div className="absolute inset-x-0 top-0 flex justify-center pt-6">
        <span className="rounded-full bg-[#f74116]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#f74116]">
          Bienvenido a Koven
        </span>
      </div>

      <div className="flex flex-col items-center justify-center w-full h-screen max-w-6xl gap-8 px-6 pt-20 mx-auto lg:flex-row lg:items-center lg:gap-12">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f74116]/10 px-4 py-2 text-sm font-semibold text-[#f74116]">
            <span className="h-2 w-2 rounded-full bg-[#f74116]" />
            Korven te da la bienvenida {user?.name?.toLocaleUpperCase()} {user?.lastName?.toLocaleUpperCase()}
          </div>

          <h1 className="mt-4 text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
            {businessDetail?.name}
          </h1>

          <p className="mt-4 text-base text-gray-700 sm:text-lg lg:text-xl">
            Centraliza la gestión de ventas, inventarios y seguimiento de órdenes desde un mismo lugar.
            Visualiza indicadores claves en tiempo real para tomar decisiones rápidas y mantener alineados
            a dueños y equipos operativos.
          </p>

          <div className="grid gap-3 mt-6 text-sm text-left text-gray-700 sm:grid-cols-2 lg:text-base">
            <div className="rounded-xl border border-[#f74116]/10 bg-white/90 p-4 shadow-sm">
              <p className="font-semibold text-gray-900">Paneles con foco en resultados</p>
              <p className="mt-2 text-xs text-gray-600 lg:text-sm">
                Monitorea producción, ventas diarias y rendimiento por colmena con una visión clara y accionable.
              </p>
            </div>
            <div className="rounded-xl border border-[#f74116]/10 bg-white/90 p-4 shadow-sm">
              <p className="font-semibold text-gray-900">Procesos colaborativos</p>
              <p className="mt-2 text-xs text-gray-600 lg:text-sm">
                Coordina tareas, comparte novedades con el equipo y automatiza alertas clave para no perder ninguna oportunidad.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-sm lg:max-w-md">
          <div className="relative mx-auto overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-[#f74116]/20">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#f74116]/15 via-transparent to-white/80" />
            <img
              src={PresentationImage}
              alt="Ilustración representativa de Koven"
              className="relative object-cover w-full h-auto"
            />
          </div>
        </div>
      </div>

      <div className="absolute transform -translate-x-1/2 bottom-8 left-1/2">
        <p className="text-base font-semibold text-[#f74116] lg:text-lg">
          Comienza a gestionar tu negocio
        </p>
      </div>
    </div>
  )
}

export default Home
