import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'
import { useAuth } from '../contexts/useAuth'
import { analyticsService } from '../services/analyticsService'
import { IoFilterCircle } from 'react-icons/io5'
import LoadingScreen from '../components/LoadingScreen'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface AnalyticsData {
  monthlyRevenue: { month: string; revenue: number }[]
  monthlyProfit: { month: string; profit: number }[]
  revenueByCategoryAllMonths: { month: string; categoryName: string; revenue: number }[]
  profitByCategoryAllMonths: { month: string; categoryName: string; profit: number }[]
}

function Analytics() {
  const { user } = useAuth()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    monthlyRevenue: [],
    monthlyProfit: [],
    revenueByCategoryAllMonths: [],
    profitByCategoryAllMonths: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Estados para el selector de mes/año del gráfico de torta
  const currentDate = new Date()
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1) // getMonth() devuelve 0-11
  
  // Estados para el filtro de categorías
  const [selectedCategoryFilters, setSelectedCategoryFilters] = useState<string[]>([])
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  useEffect(() => {
    if (user?.businessId) {
      fetchAnalyticsData()
    }
  }, [user?.businessId])

  const fetchAnalyticsData = async () => {
    if (!user?.businessId) {
      setError('No se pudo obtener el ID del negocio')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Llamadas a los endpoints reales
      const [monthlyRevenueData, monthlyProfitData, revenueByCategoryData, profitByCategoryData] = await Promise.all([
        analyticsService.getMonthlyRevenue(user.businessId),
        analyticsService.getMonthlyProfit(user.businessId),
        analyticsService.getRevenueByCategoryAllMonths(user.businessId),
        analyticsService.getProfitByCategoryAllMonths(user.businessId)
      ])

      const formattedData: AnalyticsData = {
        monthlyRevenue: monthlyRevenueData.map(item => ({
          month: formatMonthName(item.month),
          revenue: item.revenue
        })),
        monthlyProfit: monthlyProfitData.map(item => ({
          month: formatMonthName(item.month),
          profit: item.profit
        })),
        revenueByCategoryAllMonths: revenueByCategoryData.map(item => ({
          month: formatMonthName(item.month),
          categoryName: item.categoryName,
          revenue: item.revenue
        })),
        profitByCategoryAllMonths: profitByCategoryData.map(item => ({
          month: formatMonthName(item.month),
          categoryName: item.categoryName,
          profit: item.profit
        }))
      }
      
      setAnalyticsData(formattedData)
    } catch (err) {
      setError('Error al cargar los datos de analytics')
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  // Función auxiliar para formatear el nombre del mes
  const formatMonthName = (monthString: string): string => {
    const [year, month] = monthString.split('-')
    const monthNames = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ]
    const monthIndex = parseInt(month) - 1
    return `${monthNames[monthIndex]} ${year.slice(-2)}`
  }

  // Configuración del gráfico combinado para ingresos y ganancias mensuales
  const combinedChartData = {
    labels: analyticsData.monthlyRevenue.map(item => item.month),
    datasets: [
      {
        label: 'Ingresos Mensuales ($)',
        data: analyticsData.monthlyRevenue.map(item => item.revenue),
        borderColor: '#E8A66B', // Naranja melocotón suave
        backgroundColor: 'rgba(232, 166, 107, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#E8A66B',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Ganancias Mensuales ($)',
        data: analyticsData.monthlyProfit.map(item => item.profit),
        borderColor: '#E6946A', // Naranja suave apagado  
        backgroundColor: 'rgba(230, 148, 106, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#E6946A',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  }

  // Filtrar datos por mes/año seleccionados y categorías filtradas para el gráfico de torta
  const getSelectedMonthData = () => {
    // Crear el formato esperado después de formatMonthName
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const selectedMonthFormatted = `${monthNames[selectedMonth - 1]} ${selectedYear.toString().slice(-2)}`
    
    let filteredData = analyticsData.revenueByCategoryAllMonths.filter(item => item.month === selectedMonthFormatted)
    
    // Aplicar filtro de categorías si hay categorías seleccionadas
    if (selectedCategoryFilters.length > 0) {
      filteredData = filteredData.filter(item => selectedCategoryFilters.includes(item.categoryName))
    }
    
    return filteredData
  }

  const getSelectedMonthProfitData = () => {
    // Crear el formato esperado después de formatMonthName
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const selectedMonthFormatted = `${monthNames[selectedMonth - 1]} ${selectedYear.toString().slice(-2)}`
    
    let filteredData = analyticsData.profitByCategoryAllMonths.filter(item => item.month === selectedMonthFormatted)
    
    // Aplicar filtro de categorías si hay categorías seleccionadas
    if (selectedCategoryFilters.length > 0) {
      filteredData = filteredData.filter(item => selectedCategoryFilters.includes(item.categoryName))
    }
    
    return filteredData
  }

  // Obtener todas las categorías únicas para el filtro
  const getAvailableCategories = () => {
    // Crear el formato esperado después de formatMonthName
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const selectedMonthFormatted = `${monthNames[selectedMonth - 1]} ${selectedYear.toString().slice(-2)}`
    
    const monthData = analyticsData.revenueByCategoryAllMonths.filter(item => item.month === selectedMonthFormatted)
    
    const uniqueCategories = monthData.reduce((acc, item) => {
      if (!acc.find(cat => cat.categoryName === item.categoryName)) {
        acc.push({
          categoryName: item.categoryName
        })
      }
      return acc
    }, [] as { categoryName: string }[])

    return uniqueCategories
  }

  // Configuración del gráfico de torta para ingresos por categoría
  const selectedMonthData = getSelectedMonthData()
  const selectedMonthProfitData = getSelectedMonthProfitData()
  const totalRevenue = selectedMonthData.reduce((sum, item) => sum + item.revenue, 0)
  const totalProfit = selectedMonthProfitData.reduce((sum, item) => sum + item.profit, 0)
  
  const categoryChartData = {
    labels: selectedMonthData.map(item => {
      const percentage = totalRevenue > 0 ? ((item.revenue / totalRevenue) * 100).toFixed(1) : '0.0'
      return `${item.categoryName}: $${item.revenue.toLocaleString()} (${percentage}%)`
    }),
    datasets: [
      {
        data: selectedMonthData.map(item => item.revenue),
        backgroundColor: [
          '#F4B400', // Amarillo dorado (de la paleta)
          '#F28C38', // Naranja cálido (de la paleta)
          '#f74116', // Naranja principal Korven
          '#E6946A', // Naranja suave apagado
          '#E8A66B', // Naranja melocotón suave
          '#F2B85F', // Naranja dorado claro
          '#E5956C', // Naranja terracota suave
          '#F0C78A', // Amarillo naranja pastel
        ],
        borderColor: [
          '#F4B400',
          '#F28C38',
          '#f74116',
          '#E6946A',
          '#E8A66B',
          '#F2B85F',
          '#E5956C',
          '#F0C78A',
        ],
        borderWidth: 2,
      }
    ]
  }

  const profitChartData = {
    labels: selectedMonthProfitData.map(item => {
      const percentage = totalProfit > 0 ? ((item.profit / totalProfit) * 100).toFixed(1) : '0.0'
      return `${item.categoryName}: $${item.profit.toLocaleString()} (${percentage}%)`
    }),
    datasets: [
      {
        data: selectedMonthProfitData.map(item => item.profit),
        backgroundColor: [
          '#E6946A', 
          '#F4B400', 
          '#F28C38', 
          '#f74116', 
          '#E8A66B', 
          '#F2B85F', 
          '#E5956C', 
          '#F0C78A', 
        ],
        borderColor: [
          '#E6946A',
          '#F4B400',
          '#F28C38',
          '#f74116',
          '#E8A66B',
          '#F2B85F',
          '#E5956C',
          '#F0C78A',
        ],
        borderWidth: 2,
      }
    ]
  }

  // Generar años disponibles (últimos 5 años)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
  
  // Meses del año
  const months = [
    { value: 1, name: 'Enero' },
    { value: 2, name: 'Febrero' },
    { value: 3, name: 'Marzo' },
    { value: 4, name: 'Abril' },
    { value: 5, name: 'Mayo' },
    { value: 6, name: 'Junio' },
    { value: 7, name: 'Julio' },
    { value: 8, name: 'Agosto' },
    { value: 9, name: 'Septiembre' },
    { value: 10, name: 'Octubre' },
    { value: 11, name: 'Noviembre' },
    { value: 12, name: 'Diciembre' }
  ]

  // Funciones para manejar el filtro de categorías
  const handleToggleCategoryFilter = (categoryName: string) => {
    setSelectedCategoryFilters(prev => 
      prev.includes(categoryName)
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    )
  }

  const handleClearAllFilters = () => {
    setSelectedCategoryFilters([])
  }

  const handleToggleFilterDropdown = () => {
    setShowFilterDropdown(prev => !prev)
  }

  // Obtener categorías disponibles y datos filtrados
  const availableCategories = getAvailableCategories()
  const categoryData = getSelectedMonthData()
  const profitCategoryData = getSelectedMonthProfitData()

  if (loading) {
    return <LoadingScreen message="Cargando analíticas..." />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-[#fff1eb] to-white">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="w-full max-w-md text-center">
            <div className="flex justify-center mb-3 text-red-500 sm:mb-4">
              <svg className="w-12 h-12 sm:w-16 sm:h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900 sm:text-xl">Error al cargar datos</h2>
            <p className="mb-4 text-sm text-gray-600 sm:text-base">{error}</p>
            <button 
              onClick={fetchAnalyticsData}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-[#f74116] text-white text-sm sm:text-base rounded-lg hover:bg-[#f74116]/90 transition-colors font-medium"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#fff1eb] to-white">
      <div className="px-3 py-4 pb-20 mx-auto sm:px-4 sm:py-6 sm:pb-24 md:px-6 md:py-8 max-w-7xl lg:px-8">
        
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f74116]/10 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-[#f74116] mb-3 sm:mb-4">
            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-[#f74116]" />
            Analíticas de Ventas
          </div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl lg:text-4xl">
            Análisis detallado del rendimiento
          </h1>
          <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-gray-600">Métricas y estadísticas de tu negocio</p>
        </div>


        {/* Layout principal - Responsive */}
        <div className="space-y-4 sm:space-y-6">
          
          {/* Gráfico de líneas - Ancho completo */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-[#f74116]/10 p-3 sm:p-4 md:p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center mb-3 sm:mb-4 md:mb-6">
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#f74116]/10 to-[#f74116]/20 rounded-lg sm:rounded-xl flex items-center justify-center mr-2.5 sm:mr-3 md:mr-4 flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#f74116]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-gray-900 truncate sm:text-lg md:text-xl">Evolución Temporal</h2>
                <p className="text-xs text-gray-600 sm:text-sm line-clamp-1">Tendencias de ingresos y ganancias a lo largo del tiempo</p>
              </div>
            </div>
            <div className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] xl:h-[450px]">
              <Line 
                data={combinedChartData} 
                options={{
                  ...chartOptions,
                  maintainAspectRatio: false,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      position: 'top' as const,
                      labels: {
                        usePointStyle: true,
                        padding: 10,
                        font: {
                          size: window.innerWidth < 640 ? 10 : window.innerWidth < 768 ? 11 : 12,
                          weight: 'bold' as const
                        }
                      }
                    },
                    tooltip: {
                      enabled: true,
                      titleFont: {
                        size: window.innerWidth < 640 ? 11 : 12
                      },
                      bodyFont: {
                        size: window.innerWidth < 640 ? 10 : 11
                      },
                      padding: window.innerWidth < 640 ? 8 : 10
                    }
                  },
                  elements: {
                    point: {
                      radius: window.innerWidth < 640 ? 3 : window.innerWidth < 768 ? 4 : 4,
                      hoverRadius: window.innerWidth < 640 ? 5 : window.innerWidth < 768 ? 6 : 6,
                      borderWidth: 2
                    },
                    line: {
                      borderWidth: window.innerWidth < 640 ? 2 : 2
                    }
                  },
                  scales: {
                    ...chartOptions.scales,
                    y: {
                      ...chartOptions.scales.y,
                      ticks: {
                        font: {
                          size: window.innerWidth < 640 ? 9 : window.innerWidth < 768 ? 10 : 11
                        }
                      }
                    },
                    x: {
                      ...chartOptions.scales.x,
                      ticks: {
                        font: {
                          size: window.innerWidth < 640 ? 9 : window.innerWidth < 768 ? 10 : 11
                        },
                        maxRotation: window.innerWidth < 640 ? 45 : 0,
                        minRotation: window.innerWidth < 640 ? 45 : 0
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>

          {/* Sección de análisis por categoría */}
          <div className="space-y-3 sm:space-y-4">
            
            {/* Controles unificados */}
            <div className="bg-white rounded-xl shadow-sm border border-[#f74116]/10 p-3 sm:p-4 hover:shadow-lg transition-all duration-200">
              <div className="flex flex-col gap-2.5 sm:gap-3">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 mr-2.5 sm:mr-3 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex-shrink-0">
                    <svg className="w-4 h-4 text-purple-600 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate sm:text-base">Análisis por Categoría</h3>
                    <p className="text-xs text-gray-500 line-clamp-1">Controles para gráficos</p>
                  </div>
                </div>
                
                {/* Controles */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
                  {/* Filtro de categorías */}
                  <div className="relative flex-1 min-w-0 sm:max-w-xs">
                    <button
                      className="w-full flex items-center justify-between gap-2 px-2.5 sm:px-3 py-2 text-xs sm:text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#f74116]/20 focus:border-[#f74116]"
                      type="button"
                      onClick={handleToggleFilterDropdown}
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                        <IoFilterCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="font-medium truncate">Filtrar categorías</span>
                      </div>
                      {selectedCategoryFilters.length > 0 && (
                        <span className="px-1.5 sm:px-2 py-0.5 text-xs font-semibold text-white bg-[#f74116] rounded-full flex-shrink-0">
                          {selectedCategoryFilters.length}
                        </span>
                      )}
                    </button>
                    
                    {/* Dropdown menu */}
                    {showFilterDropdown && (
                      <div className="absolute left-0 right-0 z-50 py-2 mt-2 bg-white border border-gray-200 shadow-lg top-full rounded-xl max-h-[60vh] overflow-hidden flex flex-col">
                        <div className="px-3 py-2 border-b border-gray-100">
                          <h4 className="text-xs font-semibold text-gray-800">Categorías</h4>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto">
                          {availableCategories.map(category => (
                            <button
                              key={category.categoryName}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${selectedCategoryFilters.includes(category.categoryName) ? 'bg-[#f74116]/10 text-[#f74116]' : 'text-gray-700'}`}
                              onClick={() => handleToggleCategoryFilter(category.categoryName)}
                              type="button"
                            >
                              <span className="flex-1 text-xs font-medium break-words sm:text-sm">{category.categoryName}</span>
                              {selectedCategoryFilters.includes(category.categoryName) && (
                                <span className="text-[#f74116] flex-shrink-0">✓</span>
                              )}
                            </button>
                          ))}
                        </div>
                        
                        {selectedCategoryFilters.length > 0 && (
                          <div className="px-3 py-2 border-t border-gray-100">
                            <button
                              className="w-full text-xs font-medium text-red-600 sm:text-sm hover:text-red-800"
                              onClick={handleClearAllFilters}
                              type="button"
                            >
                              Limpiar filtros
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Selectores de mes y año */}
                  <div className="flex w-full gap-2 sm:w-auto">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      className="flex-1 sm:flex-none sm:min-w-[120px] px-2.5 sm:px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#f74116]/20 focus:border-[#f74116] hover:bg-gray-100 transition-colors"
                    >
                      {months.map(month => (
                        <option key={month.value} value={month.value}>
                          {month.name}
                        </option>
                      ))}
                    </select>
                    
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="flex-1 sm:flex-none sm:min-w-[100px] px-2.5 sm:px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#f74116]/20 focus:border-[#f74116] hover:bg-gray-100 transition-colors"
                    >
                      {years.map(year => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráficos de torta lado a lado */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 sm:gap-4">
              
              {/* Gráfico de Ingresos */}
              <div className="bg-white rounded-xl shadow-sm border border-[#f74116]/10 p-3 sm:p-4 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center mb-2.5 sm:mb-3">
                  <div className="flex items-center justify-center flex-shrink-0 mr-2 rounded-lg w-7 h-7 sm:w-8 sm:h-8 sm:mr-3 bg-gradient-to-br from-blue-100 to-blue-200">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate sm:text-base">Ingresos</h3>
                    <p className="text-xs text-gray-500 truncate sm:text-sm">${totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
                
                {categoryData.length > 0 ? (
                  <div className="w-full aspect-square max-w-[280px] sm:max-w-[320px] md:max-w-[300px] lg:max-w-[350px] mx-auto">
                    <Doughnut data={categoryChartData} options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      aspectRatio: 1,
                      plugins: {
                        legend: {
                          position: 'bottom' as const,
                          labels: {
                            boxWidth: window.innerWidth < 640 ? 10 : 12,
                            padding: window.innerWidth < 640 ? 8 : 10,
                            font: { size: window.innerWidth < 640 ? 10 : 11 },
                            generateLabels: function(chart: any) {
                              const data = chart.data
                              if (data.labels.length && data.datasets.length) {
                                return data.labels.map((label: string, i: number) => {
                                  const dataset = data.datasets[0]
                                  const backgroundColor = Array.isArray(dataset.backgroundColor) 
                                    ? dataset.backgroundColor[i] 
                                    : dataset.backgroundColor
                                  const categoryName = label.split(':')[0]
                                  return {
                                    text: categoryName,
                                    fillStyle: backgroundColor,
                                    hidden: false,
                                    index: i
                                  }
                                })
                              }
                              return []
                            }
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context: any) {
                              const fullLabel = context.label
                              const categoryName = fullLabel.split(':')[0]
                              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
                              const percentage = ((context.parsed / total) * 100).toFixed(1)
                              return `${categoryName}: ${percentage}%`
                            }
                          },
                          titleFont: {
                            size: window.innerWidth < 640 ? 11 : 12
                          },
                          bodyFont: {
                            size: window.innerWidth < 640 ? 10 : 11
                          },
                          padding: window.innerWidth < 640 ? 8 : 10
                        }
                      }
                    }} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-500 sm:h-48">
                    <div className="flex items-center justify-center w-10 h-10 mb-2 bg-gray-100 rounded-full sm:w-12 sm:h-12 sm:mb-3">
                      <svg className="w-5 h-5 text-gray-400 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6" />
                      </svg>
                    </div>
                    <p className="text-xs font-medium text-gray-600 sm:text-sm">Sin datos</p>
                  </div>
                )}
              </div>

              {/* Gráfico de Ganancias */}
              <div className="bg-white rounded-xl shadow-sm border border-[#f74116]/10 p-3 sm:p-4 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center mb-2.5 sm:mb-3">
                  <div className="flex items-center justify-center flex-shrink-0 mr-2 rounded-lg w-7 h-7 sm:w-8 sm:h-8 sm:mr-3 bg-gradient-to-br from-green-100 to-green-200">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate sm:text-base">Ganancias</h3>
                    <p className="text-xs text-gray-500 truncate sm:text-sm">${totalProfit.toLocaleString()}</p>
                  </div>
                </div>
                
                {profitCategoryData.length > 0 ? (
                  <div className="w-full aspect-square max-w-[280px] sm:max-w-[320px] md:max-w-[300px] lg:max-w-[350px] mx-auto">
                    <Doughnut data={profitChartData} options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      aspectRatio: 1,
                      plugins: {
                        legend: {
                          position: 'bottom' as const,
                          labels: {
                            boxWidth: window.innerWidth < 640 ? 10 : 12,
                            padding: window.innerWidth < 640 ? 8 : 10,
                            font: { size: window.innerWidth < 640 ? 10 : 11 },
                            generateLabels: function(chart: any) {
                              const data = chart.data
                              if (data.labels.length && data.datasets.length) {
                                return data.labels.map((label: string, i: number) => {
                                  const dataset = data.datasets[0]
                                  const backgroundColor = Array.isArray(dataset.backgroundColor) 
                                    ? dataset.backgroundColor[i] 
                                    : dataset.backgroundColor
                                  const categoryName = label.split(':')[0]
                                  return {
                                    text: categoryName,
                                    fillStyle: backgroundColor,
                                    hidden: false,
                                    index: i
                                  }
                                })
                              }
                              return []
                            }
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context: any) {
                              const fullLabel = context.label
                              const categoryName = fullLabel.split(':')[0]
                              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
                              const percentage = ((context.parsed / total) * 100).toFixed(1)
                              return `${categoryName}: ${percentage}%`
                            }
                          },
                          titleFont: {
                            size: window.innerWidth < 640 ? 11 : 12
                          },
                          bodyFont: {
                            size: window.innerWidth < 640 ? 10 : 11
                          },
                          padding: window.innerWidth < 640 ? 8 : 10
                        }
                      }
                    }} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-500 sm:h-48">
                    <div className="flex items-center justify-center w-10 h-10 mb-2 bg-gray-100 rounded-full sm:w-12 sm:h-12 sm:mb-3">
                      <svg className="w-5 h-5 text-gray-400 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6" />
                      </svg>
                    </div>
                    <p className="text-xs font-medium text-gray-600 sm:text-sm">Sin datos</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>      </div>
    </div>
  )
}

export default Analytics