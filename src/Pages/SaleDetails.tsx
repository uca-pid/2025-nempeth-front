import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { salesManagementService, type SaleResponse } from '../services/salesManagementService'
import { useAuth } from '../contexts/useAuth'
import LoadingScreen from '../components/LoadingScreen'
import { 
  IoArrowBackOutline, 
  IoReceiptOutline, 
  IoCalendarOutline, 
  IoPersonOutline, 
  IoCashOutline,
  IoList
} from 'react-icons/io5'

function SaleDetails() {
  const { saleId } = useParams<{ saleId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sale, setSale] = useState<SaleResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const businessId = user?.businessId

  const loadSaleDetails = useCallback(async () => {
    if (!businessId || !saleId) return

    try {
      setLoading(true)
      setError(null)
      const saleData = await salesManagementService.getSaleById(businessId, saleId)
      setSale(saleData)
    } catch (err) {
      console.error('Error cargando detalles de venta:', err)
      setError('Error al cargar los detalles de la venta')
    } finally {
      setLoading(false)
    }
  }, [businessId, saleId])

  useEffect(() => {
    loadSaleDetails()
  }, [loadSaleDetails])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return <LoadingScreen message="Cargando detalles de la venta..." />
  }

  if (error || !sale) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-[#fff1eb] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <button
                onClick={() => navigate('/sales-history')}
                className="flex items-center gap-1 hover:text-[#f74116] transition-colors"
              >
                <span>Historial de Ventas</span>
              </button>
              <span>/</span>
              <span className="text-red-600 font-medium">Error</span>
            </nav>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-[#f74116]/10 p-8 text-center hover:shadow-lg transition-all duration-200">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Error al cargar la venta</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {error || 'No se pudieron cargar los detalles de esta venta. Verifica que la venta existe e intenta nuevamente.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={loadSaleDetails}
                className="px-6 py-3 bg-[#f74116] text-white rounded-lg hover:bg-[#f74116]/90 transition-colors font-medium"
              >
                Reintentar
              </button>
              <button
                onClick={() => navigate('/sales-history')}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Volver al Historial
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#fff1eb] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/sales-history')}
            className="inline-flex items-center gap-2 rounded-full bg-[#f74116]/10 px-4 py-2 text-sm font-semibold text-[#f74116] mb-6 hover:bg-[#f74116]/20 transition-colors group"
          >
            <IoArrowBackOutline className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Volver al Historial</span>
          </button>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-2">
              Venta #{sale.id.substring(0, 8)}
            </h1>
            <p className="text-gray-600">Detalle completo de la transacción</p>
          </div>
        </div>

        {/* Sale Summary Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#f74116]/10 p-6 mb-6 hover:shadow-lg transition-all duration-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#f74116]/10 to-[#f74116]/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <IoReceiptOutline className="w-8 h-8 text-[#f74116]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Resumen de la Venta</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <IoCalendarOutline className="w-4 h-4 text-gray-500" />
                    <div>
                      <span className="text-gray-600 font-medium">Fecha: </span>
                      <span className="text-gray-900">{formatDate(sale.occurredAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <IoPersonOutline className="w-4 h-4 text-gray-500" />
                    <div>
                      <span className="text-gray-600 font-medium">Vendedor: </span>
                      <span className="text-gray-900">{sale.createdByUserName}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center lg:text-right">
              <div className="inline-flex items-center gap-2 text-3xl font-bold text-green-600 mb-2">
                <IoCashOutline className="w-8 h-8" />
                <span>{formatCurrency(sale.totalAmount)}</span>
              </div>
              <p className="text-sm text-gray-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                Total de la venta
              </p>
            </div>
          </div>
        </div>

        {/* Items Detail Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#f74116]/10 p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
              <IoList className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Productos Vendidos</h2>
              <p className="text-sm text-gray-600">
                {sale.items.length} producto{sale.items.length !== 1 ? 's' : ''} en esta venta
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {sale.items.map((item, index) => (
              <div
                key={index}
                className="group p-5 bg-gray-50/50 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200 hover:shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{item.productName}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <span>Precio de venta:</span>
                        <span className="font-medium text-gray-900">{formatCurrency(item.unitPrice)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <span>Costo unitario:</span>
                        <span className="font-medium text-gray-900">{formatCurrency(item.unitCost || 0)}</span>
                      </div>
        
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Cantidad</p>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg font-bold text-blue-600">{item.quantity}</span>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Costo Total</p>
                      <div className="bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                        <span className="text-sm font-bold text-orange-600">
                          {formatCurrency(item.quantity * (item.unitCost || 0))}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Subtotal</p>
                      <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                        <span className="text-sm font-bold text-green-600">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Ganancia</p>
                      <div className={`px-3 py-2 rounded-lg border ${
                        (item.quantity * (item.unitPrice - (item.unitCost || 0))) >= 0 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-red-50 border-red-200'
                      }`}>
                        <span className={`text-sm font-bold ${
                          (item.quantity * (item.unitPrice - (item.unitCost || 0))) >= 0 
                            ? 'text-blue-600' 
                            : 'text-red-600'
                        }`}>
                          {formatCurrency(item.quantity * (item.unitPrice - (item.unitCost || 0)))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Costo Total */}
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-200 rounded-lg flex items-center justify-center">
                      <IoCashOutline className="w-4 h-4 text-orange-700" />
                    </div>
                    <span className="text-sm font-bold text-orange-800">Costo Total</span>
                  </div>
                  <span className="text-lg font-bold text-orange-700">
                    {formatCurrency(sale.items.reduce((total, item) => total + (item.quantity * (item.unitCost || 0)), 0))}
                  </span>
                </div>
              </div>

              {/* Venta Total */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-200 rounded-lg flex items-center justify-center">
                      <IoCashOutline className="w-4 h-4 text-green-700" />
                    </div>
                    <span className="text-sm font-bold text-green-800">Total Venta</span>
                  </div>
                  <span className="text-lg font-bold text-green-700">
                    {formatCurrency(sale.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Ganancia Total */}
              <div className={`bg-gradient-to-r p-4 rounded-xl border ${
                (sale.totalAmount - sale.items.reduce((total, item) => total + (item.quantity * (item.unitCost || 0)), 0)) >= 0
                  ? 'from-blue-50 to-blue-100 border-blue-200'
                  : 'from-red-50 to-red-100 border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      (sale.totalAmount - sale.items.reduce((total, item) => total + (item.quantity * (item.unitCost || 0)), 0)) >= 0
                        ? 'bg-blue-200'
                        : 'bg-red-200'
                    }`}>
                      <IoCashOutline className={`w-4 h-4 ${
                        (sale.totalAmount - sale.items.reduce((total, item) => total + (item.quantity * (item.unitCost || 0)), 0)) >= 0
                          ? 'text-blue-700'
                          : 'text-red-700'
                      }`} />
                    </div>
                    <span className={`text-sm font-bold ${
                      (sale.totalAmount - sale.items.reduce((total, item) => total + (item.quantity * (item.unitCost || 0)), 0)) >= 0
                        ? 'text-blue-800'
                        : 'text-red-800'
                    }`}>Ganancia Total</span>
                  </div>
                  <span className={`text-lg font-bold ${
                    (sale.totalAmount - sale.items.reduce((total, item) => total + (item.quantity * (item.unitCost || 0)), 0)) >= 0
                      ? 'text-blue-700'
                      : 'text-red-700'
                  }`}>
                    {formatCurrency(sale.totalAmount - sale.items.reduce((total, item) => total + (item.quantity * (item.unitCost || 0)), 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate('/sales-history')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium border border-gray-200 hover:border-gray-300 shadow-sm"
          >
            <IoArrowBackOutline className="w-4 h-4" />
            <span>Volver al Historial</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default SaleDetails