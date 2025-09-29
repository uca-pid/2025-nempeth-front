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
        <div className="bg-white border-b border-gray-200 p-7">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/sales-history')}
              className="p-2 transition-colors rounded-lg hover:bg-gray-100"
            >
              <IoArrowBackOutline size={24} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Detalles de Venta</h1>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#2563eb]"></div>
        </div>
      </div>
    )
  }

  if (error || !sale) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white border-b border-gray-200 p-7">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/sales-history')}
              className="p-2 transition-colors rounded-lg hover:bg-gray-100"
            >
              <IoArrowBackOutline size={24} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Detalles de Venta</h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 text-6xl text-red-500">⚠️</div>
          <h2 className="mb-2 text-xl font-semibold text-gray-800">Error al cargar la venta</h2>
          <p className="mb-4 text-gray-600">{error || 'Venta no encontrada'}</p>
          <div className="flex space-x-4">
            <button
              onClick={loadSaleDetails}
              className="px-6 py-3 bg-[#2563eb] text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
            <button
              onClick={() => navigate('/sales-history')}
              className="px-6 py-3 text-white transition-colors bg-gray-600 rounded-lg hover:bg-gray-700"
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
      <div className="bg-white border-b border-gray-200 p-7">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/sales-history')}
            className="p-2 transition-colors rounded-lg hover:bg-gray-100"
          >
            <IoArrowBackOutline size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Venta #{sale.id.substring(0, 8)}
            </h1>
            <p className="mt-1 text-sm text-gray-600">Detalles completos de la transacción</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-7">
        {/* Sale Summary Card */}
        <div className="p-6 mb-6 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-blue-100 rounded-xl">
                <IoReceiptOutline size={32} className="text-[#2563eb]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Información de la Venta</h2>
                <p className="text-gray-600">ID: {sale.id}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 text-2xl font-bold text-green-600">
                <IoCashOutline size={28} />
                <span>{formatCurrency(sale.totalAmount)}</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">Total de la venta</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex items-center space-x-3">
              <IoCalendarOutline size={20} className="text-gray-500" />
              <div>
                <p className="text-sm font-semibold text-gray-700">Fecha y Hora</p>
                <p className="text-gray-900">{formatDate(sale.occurredAt)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <IoPersonOutline size={20} className="text-gray-500" />
              <div>
                <p className="text-sm font-semibold text-gray-700">Vendedor</p>
                <p className="text-gray-900">{sale.createdByUserName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Items Detail Card */}
        <div className="p-6 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center mb-6 space-x-3">
            <IoList size={24} className="text-[#2563eb]" />
            <h2 className="text-xl font-bold text-gray-900">
              Productos Vendidos ({sale.items.length})
            </h2>
          </div>

          <div className="space-y-4">
            {sale.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                  <p className="text-sm text-gray-600">
                    Precio unitario: {formatCurrency(item.unitPrice)}
                  </p>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-700">Cantidad</p>
                    <p className="text-lg font-bold text-gray-900">{item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-700">Subtotal</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total Summary */}
          <div className="pt-6 mt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-700">Total de la Venta:</span>
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(sale.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate('/sales-history')}
            className="px-6 py-3 font-semibold text-white transition-colors bg-gray-600 rounded-lg hover:bg-gray-700"
          >
            Volver al Historial
          </button>
        </div>
      </div>
    </div>
  )
}

export default SaleDetails