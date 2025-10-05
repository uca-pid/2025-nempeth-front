import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { salesManagementService, type SaleResponse } from '../services/salesManagementService'
import { useAuth } from '../contexts/useAuth'
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white border-b border-gray-200 p-4 sm:p-6 lg:p-7">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => navigate('/sales-history')}
              className="p-2 transition-colors rounded-lg hover:bg-gray-100"
            >
              <IoArrowBackOutline size={20} className="sm:w-6 sm:h-6" />
            </button>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Detalles de Venta</h1>
          </div>
        </div>
        <div className="flex items-center justify-center py-12 sm:py-16 lg:py-20">
          <div className="animate-spin rounded-full h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32 border-b-2 border-[#2563eb]"></div>
        </div>
      </div>
    )
  }

  if (error || !sale) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white border-b border-gray-200 p-4 sm:p-6 lg:p-7">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => navigate('/sales-history')}
              className="p-2 transition-colors rounded-lg hover:bg-gray-100"
            >
              <IoArrowBackOutline size={20} className="sm:w-6 sm:h-6" />
            </button>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Detalles de Venta</h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20 px-4">
          <div className="mb-4 text-4xl sm:text-5xl lg:text-6xl text-red-500">⚠️</div>
          <h2 className="mb-2 text-lg sm:text-xl font-semibold text-gray-800 text-center">Error al cargar la venta</h2>
          <p className="mb-4 text-sm sm:text-base text-gray-600 text-center max-w-md">{error || 'Venta no encontrada'}</p>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full max-w-sm">
            <button
              onClick={loadSaleDetails}
              className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-[#2563eb] text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
            <button
              onClick={() => navigate('/sales-history')}
              className="flex-1 px-4 sm:px-6 py-2 sm:py-3 text-white text-sm sm:text-base transition-colors bg-gray-600 rounded-lg hover:bg-gray-700"
            >
              Volver al Historial
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sm:p-6 lg:p-7">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={() => navigate('/sales-history')}
            className="p-2 transition-colors rounded-lg hover:bg-gray-100"
          >
            <IoArrowBackOutline size={20} className="sm:w-6 sm:h-6" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              Venta #{sale.id.substring(0, 8)}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-600">Detalles completos de la transacción</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-7">
        {/* Sale Summary Card */}
        <div className="p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6 bg-white border border-gray-200 rounded-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 sm:mb-6 gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-3 sm:p-4 bg-blue-100 rounded-xl">
                <IoReceiptOutline size={24} className="text-[#2563eb] sm:w-8 sm:h-8" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Información de la Venta</h2>
              </div>
            </div>
            <div className="text-left lg:text-right">
              <div className="flex items-center space-x-2 text-xl sm:text-2xl font-bold text-green-600">
                <IoCashOutline size={24} className="sm:w-7 sm:h-7" />
                <span>{formatCurrency(sale.totalAmount)}</span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-gray-600">Total de la venta</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
            <div className="flex items-center space-x-3">
              <IoCalendarOutline size={18} className="text-gray-500 sm:w-5 sm:h-5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-700">Fecha y Hora</p>
                <p className="text-sm sm:text-base text-gray-900 break-words">{formatDate(sale.occurredAt)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <IoPersonOutline size={18} className="text-gray-500 sm:w-5 sm:h-5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-700">Vendedor</p>
                <p className="text-sm sm:text-base text-gray-900 truncate">{sale.createdByUserName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Items Detail Card */}
        <div className="p-4 sm:p-5 lg:p-6 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center mb-4 sm:mb-6 space-x-3">
            <IoList size={20} className="text-[#2563eb] sm:w-6 sm:h-6" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Productos Vendidos ({sale.items.length})
            </h2>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {sale.items.map((item, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-gray-50 gap-3"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{item.productName}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Precio unitario: {formatCurrency(item.unitPrice)}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end space-x-4 sm:space-x-6">
                  <div className="text-center">
                    <p className="text-xs sm:text-sm font-semibold text-gray-700">Cantidad</p>
                    <p className="text-base sm:text-lg font-bold text-gray-900">{item.quantity}</p>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-xs sm:text-sm font-semibold text-gray-700">Subtotal</p>
                    <p className="text-base sm:text-lg font-bold text-green-600">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total Summary */}
          <div className="pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-base sm:text-lg font-semibold text-gray-700">Total de la Venta:</span>
              <span className="text-xl sm:text-2xl font-bold text-green-600">
                {formatCurrency(sale.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center mt-6 sm:mt-8">
          <button
            onClick={() => navigate('/sales-history')}
            className="w-full sm:w-auto px-6 py-3 font-semibold text-white transition-colors bg-gray-600 rounded-lg hover:bg-gray-700"
          >
            Volver al Historial
          </button>
        </div>
      </div>
    </div>
  )
}

export default SaleDetails