import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/useAuth'
import { businessService, type BusinessDetailResponse } from '../services/businessService'
import { IoCopyOutline, IoCheckmarkCircle, IoBusinessOutline, IoCodeSlashOutline } from 'react-icons/io5'

function BusinessInfo() {
  const { user } = useAuth()
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [businessDetail, setBusinessDetail] = useState<BusinessDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  
  const businessId = user?.businessId
  const status = user?.status
  const role = user?.role

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

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000) // Resetear después de 2 segundos
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white border-b border-gray-200 p-7">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold leading-tight text-gray-900 md:text-2xl">Información del Negocio</h1>
              <span className="text-xs font-medium text-gray-600 md:text-sm">
                Detalles de tu negocio
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-6 md:p-10">
          <div className="flex min-h-[50vh] items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white/70">
            <p className="text-base font-medium text-gray-600">Cargando información del negocio...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !user || !businessDetail) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white border-b border-gray-200 p-7">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold leading-tight text-gray-900 md:text-2xl">Información del Negocio</h1>
              <span className="text-xs font-medium text-gray-600 md:text-sm">
                Detalles de tu negocio
              </span>
            </div>
          </div>
        </div>``
        
        <div className="p-6 md:p-10">
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <div className="text-6xl opacity-50">🏪</div>
            <h3 className="text-xl font-semibold text-gray-700">
              {error ? 'Error al cargar información' : 'Sin información de negocio'}
            </h3>
            <p className="text-gray-500">
              {error || 'No se encontró información del negocio asociado a tu cuenta.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-7">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold leading-tight text-gray-900 md:text-2xl">Información del Negocio</h1>
            <span className="text-xs font-medium text-gray-600 md:text-sm">
              Detalles de tu negocio
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          {/* Tarjeta principal */}
          <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-2xl">
            {/* Header de la tarjeta */}
            <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full shadow-lg bg-gradient-to-r from-blue-100 to-indigo-100 ring-4 ring-white">
                  <IoBusinessOutline className="text-2xl text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Tu Negocio</h2>
                  <p className="text-gray-600">Información y configuración</p>
                </div>
              </div>
            </div>

            {/* Contenido de la tarjeta */}
            <div className="p-8 space-y-8">
              {/* Nombre del Negocio */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <IoBusinessOutline className="text-lg text-gray-500" />
                  <label className="text-sm font-semibold text-gray-700">Nombre del Negocio</label>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 p-4 border-2 border-gray-200 bg-gray-50 rounded-xl">
                    <p className="text-lg font-medium text-gray-900">{businessDetail.name}</p>
                  </div>
                  <button
                    className="flex items-center justify-center w-12 h-12 text-blue-600 transition-all duration-200 bg-blue-100 rounded-xl hover:bg-blue-200 hover:scale-105 active:scale-95"
                    onClick={() => copyToClipboard(businessDetail.name, 'name')}
                    title="Copiar nombre del negocio"
                    type="button"
                  >
                    {copiedField === 'name' ? (
                      <IoCheckmarkCircle className="text-xl text-green-600" />
                    ) : (
                      <IoCopyOutline className="text-xl" />
                    )}
                  </button>
                </div>
                {copiedField === 'name' && (
                  <p className="text-sm font-medium text-green-600">✓ Nombre copiado al portapapeles</p>
                )}
              </div>

              {/* Código del Negocio */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <IoCodeSlashOutline className="text-lg text-gray-500" />
                  <label className="text-sm font-semibold text-gray-700">Código del Negocio</label>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 p-4 border-2 border-gray-200 bg-gray-50 rounded-xl">
                    <p className="font-mono text-lg font-medium tracking-wider text-gray-900">{businessDetail.joinCode}</p>
                  </div>
                  <button
                    className="flex items-center justify-center w-12 h-12 text-indigo-600 transition-all duration-200 bg-indigo-100 rounded-xl hover:bg-indigo-200 hover:scale-105 active:scale-95"
                    onClick={() => copyToClipboard(businessDetail.joinCode, 'code')}
                    title="Copiar código del negocio"
                    type="button"
                  >
                    {copiedField === 'code' ? (
                      <IoCheckmarkCircle className="text-xl text-green-600" />
                    ) : (
                      <IoCopyOutline className="text-xl" />
                    )}
                  </button>
                </div>
                {copiedField === 'code' && (
                  <p className="text-sm font-medium text-green-600">✓ Código copiado al portapapeles</p>
                )}
              </div>

              {/* Información adicional */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Estado */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Estado</label>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <p className={`text-sm font-medium ${
                      status === 'ACTIVE' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                    </p>
                  </div>
                </div>

                {/* Rol */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Tu Rol</label>
                  <p className="text-sm font-medium text-gray-900 capitalize">{role?.toLowerCase()}</p>
                </div>
              </div>

              {/* Nota informativa */}
              <div className="p-4 border border-blue-200 bg-blue-50 rounded-xl">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                      <IoBusinessOutline className="text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-blue-900">Información importante</h3>
                    <p className="mt-1 text-sm text-blue-700">
                      El código del negocio es único e identifica tu establecimiento en el sistema. 
                      Puedes compartir esta información con empleados o colaboradores que necesiten acceso.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BusinessInfo