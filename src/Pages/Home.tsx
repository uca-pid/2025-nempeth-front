import { businessService, type BusinessDetailResponse } from '../services/businessService'
import { salesManagementService, type SaleResponse } from '../services/salesManagementService'
import { useEffect, useState } from "react"
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

  const businessId = user?.businessId

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
        
        // Obtener las últimas 3 ventas y calcular total
        const sortedSales = salesData.sort((a, b) => 
          new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
        )
        setRecentSales(sortedSales.slice(0, 3))
        
        // Calcular total de ventas
        const total = salesData.reduce((sum, sale) => sum + sale.totalAmount, 0)
        setTotalSalesAmount(total)
        
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
          <p className="mt-2 text-lg text-gray-600">
            Aquí tienes un resumen del estado de tu negocio
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          
          {/* Empleados */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#f74116]/10 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Empleados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {businessDetail?.stats.totalMembers || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Productos */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#f74116]/10 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Productos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {businessDetail?.stats.totalProducts || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Total Órdenes */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#f74116]/10 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Órdenes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {allSales.length || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Total Ventas */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#f74116]/10 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-[#f74116]/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#f74116]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Ventas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalSalesAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#f74116]/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Últimas Órdenes</h2>
            <button 
              onClick={() => navigate('/sales-history')}
              className="text-[#f74116] hover:text-[#f74116]/80 text-sm font-medium"
            >
              Ver todas
            </button>
          </div>
          
          {recentSales.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay órdenes aún</h3>
              <p className="text-gray-600">Las órdenes aparecerán aquí cuando comiences a vender</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Orden #{sale.id.slice(-8)}
                      </h3>
                      <span className="text-lg font-bold text-[#f74116]">
                        {formatCurrency(sale.totalAmount)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-sm text-gray-600">
                      <span>Por: {sale.createdByUserName}</span>
                      <span>{formatDate(sale.occurredAt)}</span>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">
                        {sale.items.length} producto{sale.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <button 
            onClick={() => navigate('/create-order')}
            className="bg-[#f74116] text-white rounded-xl p-6 text-left hover:bg-[#f74116]/90 transition-colors group"
          >
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="font-semibold">Nueva Venta</span>
            </div>
            <p className="mt-2 text-sm text-white/80">Registrar una nueva venta</p>
          </button>
          
          <button 
            onClick={() => navigate('/products')}
            className="bg-white border border-[#f74116]/20 text-gray-900 rounded-xl p-6 text-left hover:border-[#f74116]/40 transition-colors group"
          >
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-3 text-[#f74116] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="font-semibold">Gestionar Productos</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">Ver y editar productos</p>
          </button>
          
          <button 
            onClick={() => navigate('/sales-history')}
            className="bg-white border border-[#f74116]/20 text-gray-900 rounded-xl p-6 text-left hover:border-[#f74116]/40 transition-colors group"
          >
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-3 text-[#f74116] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="font-semibold">Ver Reportes</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">Analizar ventas y estadísticas</p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home
