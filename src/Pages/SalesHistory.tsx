import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { salesManagementService, type SaleResponse } from '../services/salesManagementService'
import { useAuth } from '../contexts/useAuth'
import { IoReceiptOutline, IoCalendarOutline, IoPersonOutline, IoCashOutline, IoEyeOutline } from 'react-icons/io5'

function SalesHistory() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [sales, setSales] = useState<SaleResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const businessId = user?.businessId

  const loadSales = useCallback(async () => {
    if (!businessId) return

    try {
      setLoading(true)
      setError(null)
      const salesData = await salesManagementService.getAllSales(businessId)
      setSales(salesData)
    } catch (err) {
      console.error('Error cargando ventas:', err)
      setError('Error al cargar el historial de ventas')
    } finally {
      setLoading(false)
    }
  }, [businessId])

  useEffect(() => {
    loadSales()
  }, [loadSales])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const handleViewDetails = (saleId: string) => {
    navigate(`/sales/${saleId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white border-b border-gray-200 p-7">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Historial de Ventas</h1>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#2563eb]"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white border-b border-gray-200 p-7">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Historial de Ventas</h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 text-6xl text-red-500">⚠️</div>
          <h2 className="mb-2 text-xl font-semibold text-gray-800">Error al cargar las ventas</h2>
          <p className="mb-4 text-gray-600">{error}</p>
          <button
            onClick={loadSales}
            className="px-6 py-3 bg-[#2563eb] text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
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
            <h1 className="text-2xl font-bold text-gray-900">Historial de Ventas</h1>
            <p className="mt-1 text-sm text-gray-600">
              {sales.length} {sales.length === 1 ? 'venta registrada' : 'ventas registradas'}
            </p>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <IoReceiptOutline size={24} />
            <span className="text-lg font-semibold">
              Total: {formatCurrency(sales.reduce((sum, sale) => sum + sale.totalAmount, 0))}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-7">
        {sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <IoReceiptOutline size={64} className="mb-4 text-gray-400" />
            <h2 className="mb-2 text-xl font-semibold text-gray-800">No hay ventas registradas</h2>
            <p className="mb-6 text-center text-gray-600">
              Las ventas que generes aparecerán aquí
            </p>
            <button
              onClick={() => navigate('/create-order')}
              className="px-6 py-3 bg-[#2563eb] text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Crear Primera Venta
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sales.map((sale) => (
              <div
                key={sale.id}
                className="p-6 transition-shadow bg-white border border-gray-200 rounded-xl hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <IoReceiptOutline size={24} className="text-[#2563eb]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Venta #{sale.id.substring(0, 8)}
                      </h3>
                      <div className="flex items-center mt-1 space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <IoCalendarOutline size={16} />
                          <span>{formatDate(sale.occurredAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <IoPersonOutline size={16} />
                          <span>{sale.createdByUserName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-lg font-bold text-green-600">
                        <IoCashOutline size={20} />
                        <span>{formatCurrency(sale.totalAmount)}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {sale.items.length} {sale.items.length === 1 ? 'producto' : 'productos'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleViewDetails(sale.id)}
                      className="flex items-center px-4 py-2 space-x-2 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      <IoEyeOutline size={18} />
                      <span>Ver Detalles</span>
                    </button>
                  </div>
                </div>

                {/* Quick preview of items */}
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <h4 className="mb-2 text-sm font-semibold text-gray-700">Productos vendidos:</h4>
                  <div className="flex flex-wrap gap-2">
                    {sale.items.slice(0, 3).map((item, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center px-3 py-1 text-xs text-blue-700 rounded-full bg-blue-50"
                      >
                        {item.productName} × {item.quantity}
                      </div>
                    ))}
                    {sale.items.length > 3 && (
                      <div className="inline-flex items-center px-3 py-1 text-xs text-gray-600 bg-gray-100 rounded-full">
                        +{sale.items.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SalesHistory