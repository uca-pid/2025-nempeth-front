import { businessService, type BusinessDetailResponse } from '../services/businessService'
import { salesManagementService, type SaleResponse } from '../services/salesManagementService'
import { useEffect, useState, useCallback } from "react"
import { useAuth } from "../contexts/useAuth"
import { useNavigate } from "react-router-dom"
import LoadingScreen from "../components/LoadingScreen"

function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [businessDetail, setBusinessDetail] = useState<BusinessDetailResponse | null>(null)
  const [recentSales, setRecentSales] = useState<SaleResponse[]>([])
  const [allSales, setAllSales] = useState<SaleResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalSalesAmount, setTotalSalesAmount] = useState(0)
  const [salesPeriod, setSalesPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month')
  const [filteredSalesCount, setFilteredSalesCount] = useState(0)

  const businessId = user?.businessId

  // Función para filtrar ventas por período
  const filterSalesByPeriod = (sales: SaleResponse[], period: 'today' | 'week' | 'month' | 'all') => {
    const now = new Date()
    
    switch (period) {
      case 'today':
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        return sales.filter(sale => new Date(sale.occurredAt) >= today)
      
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return sales.filter(sale => new Date(sale.occurredAt) >= weekAgo)
      
      case 'month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        return sales.filter(sale => new Date(sale.occurredAt) >= monthAgo)
      
      case 'all':
      default:
        return sales
    }
  }

  // Función para obtener el total de ventas filtradas
  const getFilteredSalesData = useCallback(() => {
    const filteredSales = filterSalesByPeriod(allSales, salesPeriod)
    return {
      total: filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0),
      count: filteredSales.length
    }
  }, [allSales, salesPeriod])

  // Recalcular cuando cambian las ventas o el período
  useEffect(() => {
    if (allSales.length > 0) {
      const { total, count } = getFilteredSalesData()
      setTotalSalesAmount(total)
      setFilteredSalesCount(count)
    }
  }, [allSales, salesPeriod, getFilteredSalesData])

  // Cargar datos del dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!businessId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        // Cargar detalles del negocio y ventas en paralelo
        const [businessData, salesData] = await Promise.all([
          businessService.getBusinessDetail(businessId),
          salesManagementService.getAllSales(businessId)
        ])
        
        setBusinessDetail(businessData)
        setAllSales(salesData)
        
        // Obtener las últimas 3 ventas
        const sortedSales = salesData.sort((a, b) => 
          new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
        )
        setRecentSales(sortedSales.slice(0, 3))
        
      } catch (err) {
        console.error('Error cargando datos del dashboard:', err)
        setError('Error al cargar la información del dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [businessId])

  function capitalize(word?: string) {
    if (!word) return ''
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function getPeriodText(period: 'today' | 'week' | 'month' | 'all'): string {
    switch (period) {
      case 'today': return 'Hoy'
      case 'week': return 'Esta semana'
      case 'month': return 'Este mes'
      case 'all': return 'Total histórico'
      default: return 'Este mes'
    }
  }

  // Mostrar pantalla de carga
  if (loading) {
    return <LoadingScreen message="Cargando dashboard..." />
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
    <div className="min-h-screen bg-gradient-to-b from-white via-[#fff1eb] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f74116]/10 px-4 py-2 text-sm font-semibold text-[#f74116] mb-4">
            <span className="h-2 w-2 rounded-full bg-[#f74116]" />
            Dashboard de {businessDetail?.name}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Bienvenido, {capitalize(user?.name)} {capitalize(user?.lastName)}
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          
          {/* Empleados */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#f74116]/10 p-6 hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Equipo</p>
                <p className="text-3xl font-bold text-gray-900">
                  {businessDetail?.stats.totalMembers || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  miembro{(businessDetail?.stats.totalMembers || 0) !== 1 ? 's' : ''} activo{(businessDetail?.stats.totalMembers || 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Productos */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#f74116]/10 p-6 hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Catálogo</p>
                <p className="text-3xl font-bold text-gray-900">
                  {businessDetail?.stats.totalProducts || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  producto{(businessDetail?.stats.totalProducts || 0) !== 1 ? 's' : ''} disponible{(businessDetail?.stats.totalProducts || 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Ventas con Filtro */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#f74116]/10 p-6 hover:shadow-lg transition-all duration-200 group lg:col-span-1">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#f74116]/10 to-[#f74116]/20 rounded-xl flex items-center justify-center mr-4 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6 text-[#f74116]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Ventas</p>
                  <p className="text-xs text-[#f74116] font-medium">{getPeriodText(salesPeriod)}</p>
                </div>
              </div>
              
              {/* Selector de período mejorado */}
              <div className="relative">
                <select
                  value={salesPeriod}
                  onChange={(e) => setSalesPeriod(e.target.value as 'today' | 'week' | 'month' | 'all')}
                  className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#f74116]/20 focus:border-[#f74116] cursor-pointer hover:bg-gray-100 transition-colors min-w-[80px]"
                >
                  <option value="today">Hoy</option>
                  <option value="week">7 días</option>
                  <option value="month">30 días</option>
                  <option value="all">Total</option>
                </select>
                <svg className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(totalSalesAmount)}
              </p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {filteredSalesCount} venta{filteredSalesCount !== 1 ? 's' : ''} registrada{filteredSalesCount !== 1 ? 's' : ''}
                </p>
                {filteredSalesCount > 0 && (
                  <div className="flex items-center text-xs text-green-600">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span>Activo</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className={`grid grid-cols-1 gap-4 ${user?.role === 'OWNER' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
            <button 
              onClick={() => navigate('/create-order')}
              className="group bg-gradient-to-r from-[#f74116] to-[#e63912] text-white rounded-xl p-6 text-left hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <span className="font-semibold text-lg">Nueva Venta</span>
                  </div>
                  <p className="text-sm text-white/90 leading-relaxed">
                    Registrar una venta y actualizar el inventario en tiempo real
                  </p>
                </div>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
            
            {/* Botón de Productos - Solo para OWNER */}
            {user?.role === 'OWNER' && (
              <button 
                onClick={() => navigate('/products')}
                className="group bg-white border border-gray-200 text-gray-900 rounded-xl p-6 text-left hover:border-[#f74116]/40 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <span className="font-semibold text-lg text-gray-900">Productos</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Gestionar catálogo, precios y disponibilidad de productos
                    </p>
                  </div>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            )}
            
            <button 
              onClick={() => navigate('/analytics')}
              className="group bg-white border border-gray-200 text-gray-900 rounded-xl p-6 text-left hover:border-[#f74116]/40 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <span className="font-semibold text-lg text-gray-900">Reportes</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Analizar ventas, tendencias y métricas de rendimiento
                  </p>
                </div>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#f74116]/10 p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Actividad Reciente</h2>
              <p className="text-sm text-gray-500 mt-1">Últimas ventas realizadas</p>
            </div>
            <button 
              onClick={() => navigate('/sales-history')}
              className="inline-flex items-center text-[#f74116] hover:text-[#f74116]/80 text-sm font-medium transition-colors group"
            >
              <span>Ver historial completo</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {recentSales.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Todo listo para empezar!</h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                Cuando realices tu primera venta, aparecerá aquí junto con el resto de la actividad
              </p>
              <button 
                onClick={() => navigate('/create-order')}
                className="inline-flex items-center px-4 py-2 bg-[#f74116] text-white rounded-lg hover:bg-[#f74116]/90 transition-colors font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Crear primera venta
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSales.map((sale) => (
                <div key={sale.id} className="group p-4 bg-gray-50/50 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">
                              Venta #{sale.id.slice(-6)}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {sale.items.length} producto{sale.items.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-[#f74116]">
                            {formatCurrency(sale.totalAmount)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-600 pl-11">
                        <div className="flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>{sale.createdByUserName}</span>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{formatDate(sale.occurredAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
