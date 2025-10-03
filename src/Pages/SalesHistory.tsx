import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { salesManagementService, type SaleResponse } from '../services/salesManagementService'
import { useAuth } from '../contexts/useAuth'
import { IoReceiptOutline, IoCalendarOutline, IoPersonOutline, IoCashOutline, IoEyeOutline, IoSwapVerticalOutline } from 'react-icons/io5'

type SortField = 'date' | 'amount'
type SortOrder = 'asc' | 'desc'

function SalesHistory() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [sales, setSales] = useState<SaleResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const getSortedSales = () => {
    const sorted = [...sales].sort((a, b) => {
      if (sortField === 'date') {
        const dateA = new Date(a.occurredAt).getTime()
        const dateB = new Date(b.occurredAt).getTime()
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
      } else {
        return sortOrder === 'asc' 
          ? a.totalAmount - b.totalAmount 
          : b.totalAmount - a.totalAmount
      }
    })
    return sorted
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white border-b border-gray-200 p-4 sm:p-6 lg:p-7">
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Historial de Ventas</h1>
          </div>
        </div>
        <div className="flex items-center justify-center py-12 sm:py-16 lg:py-20">
          <div className="animate-spin rounded-full h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32 border-b-2 border-[#2563eb]"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white border-b border-gray-200 p-4 sm:p-6 lg:p-7">
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Historial de Ventas</h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20 px-4">
          <div className="mb-4 text-4xl sm:text-5xl lg:text-6xl text-red-500">⚠️</div>
          <h2 className="mb-2 text-lg sm:text-xl font-semibold text-gray-800 text-center">Error al cargar las ventas</h2>
          <p className="mb-4 text-sm sm:text-base text-gray-600 text-center max-w-md">{error}</p>
          <button
            onClick={loadSales}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-[#2563eb] text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 transition-colors"
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
      <div className="bg-white border-b border-gray-200 p-4 sm:p-6 lg:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Historial de Ventas</h1>
            <p className="text-xs sm:text-sm text-gray-600">
              {sales.length} {sales.length === 1 ? 'venta registrada' : 'ventas registradas'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Controles de ordenamiento */}
            <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
              <IoSwapVerticalOutline size={18} className="text-gray-600" />
              <span className="text-xs sm:text-sm text-gray-600 mr-2">Ordenar por:</span>
              <button
                onClick={() => handleSort('date')}
                className={`flex items-center space-x-1 px-2 py-1 text-xs sm:text-sm rounded-md transition-colors ${
                  sortField === 'date' 
                    ? 'bg-[#2563eb] text-white' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <IoCalendarOutline size={14} />
                <span>Fecha</span>
                {sortField === 'date' && (
                  <span className="text-xs">
                    {sortOrder === 'desc' ? '↓' : '↑'}
                  </span>
                )}
              </button>
              <button
                onClick={() => handleSort('amount')}
                className={`flex items-center space-x-1 px-2 py-1 text-xs sm:text-sm rounded-md transition-colors ${
                  sortField === 'amount' 
                    ? 'bg-[#2563eb] text-white' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <IoCashOutline size={14} />
                <span>Monto</span>
                {sortField === 'amount' && (
                  <span className="text-xs">
                    {sortOrder === 'desc' ? '↓' : '↑'}
                  </span>
                )}
              </button>
            </div>
            {/* Total de ventas */}
            <div className="flex items-center space-x-2 text-gray-600 bg-gray-50 px-3 sm:px-4 py-2 rounded-lg">
              <IoReceiptOutline size={20} className="sm:w-6 sm:h-6" />
              <span className="text-sm sm:text-base lg:text-lg font-semibold">
                Total: {formatCurrency(sales.reduce((sum, sale) => sum + sale.totalAmount, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-7">
        {sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20 px-4">
            <IoReceiptOutline size={48} className="mb-4 text-gray-400 sm:w-16 sm:h-16" />
            <h2 className="mb-2 text-lg sm:text-xl font-semibold text-gray-800 text-center">No hay ventas registradas</h2>
            <p className="mb-6 text-center text-sm sm:text-base text-gray-600 max-w-md">
              Las ventas que generes aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {getSortedSales().map((sale) => (
              <div
                key={sale.id}
                className="p-4 sm:p-5 lg:p-6 transition-shadow bg-white border border-gray-200 rounded-xl hover:shadow-lg"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="p-2 sm:p-3 bg-blue-100 rounded-lg flex-shrink-0">
                      <IoReceiptOutline size={20} className="text-[#2563eb] sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                        Venta #{sale.id.substring(0, 8)}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center mt-1 space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <IoCalendarOutline size={14} className="sm:w-4 sm:h-4" />
                          <span>{formatDate(sale.occurredAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <IoPersonOutline size={14} className="sm:w-4 sm:h-4" />
                          <span className="truncate">{sale.createdByUserName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:justify-end gap-3 sm:gap-4">
                    <div className="text-left sm:text-right">
                      <div className="flex items-center space-x-1 text-base sm:text-lg font-bold text-green-600">
                        <IoCashOutline size={18} className="sm:w-5 sm:h-5" />
                        <span>{formatCurrency(sale.totalAmount)}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {sale.items.length} {sale.items.length === 1 ? 'producto' : 'productos'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleViewDetails(sale.id)}
                      className="flex items-center justify-center px-3 sm:px-4 py-2 space-x-2 text-xs sm:text-sm text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200 w-full sm:w-auto"
                    >
                      <IoEyeOutline size={16} className="sm:w-[18px] sm:h-[18px]" />
                      <span>Ver Detalles</span>
                    </button>
                  </div>
                </div>

                {/* Quick preview of items */}
                <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-gray-100">
                  <h4 className="mb-2 text-xs sm:text-sm font-semibold text-gray-700">Productos vendidos:</h4>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {sale.items.slice(0, 3).map((item, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center px-2 sm:px-3 py-1 text-xs text-blue-700 rounded-full bg-blue-50"
                      >
                        <span className="truncate max-w-24 sm:max-w-none">{item.productName}</span>
                        <span className="ml-1">× {item.quantity}</span>
                      </div>
                    ))}
                    {sale.items.length > 3 && (
                      <div className="inline-flex items-center px-2 sm:px-3 py-1 text-xs text-gray-600 bg-gray-100 rounded-full">
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