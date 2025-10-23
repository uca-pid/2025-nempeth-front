import { useState } from 'react'

interface BlockedDateRange {
  start: Date
  end: Date
  label?: string
}

interface DateRangePickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (startDate: string, endDate: string) => void
  blockedRanges?: BlockedDateRange[]
  initialStartDate?: string
  initialEndDate?: string
}

export default function DateRangePicker({
  isOpen,
  onClose,
  onSelect,
  blockedRanges = [],
  initialStartDate,
  initialEndDate
}: DateRangePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedStart, setSelectedStart] = useState<Date | null>(
    initialStartDate ? new Date(initialStartDate) : null
  )
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(
    initialEndDate ? new Date(initialEndDate) : null
  )
  const [hoverDate, setHoverDate] = useState<Date | null>(null)

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  // Generar los días del mes
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []

    // Días del mes anterior
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startingDayOfWeek + i + 1)
      days.push(prevDate)
    }

    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    // Días del mes siguiente para completar la última semana
    const remainingDays = 7 - (days.length % 7)
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        days.push(new Date(year, month + 1, i))
      }
    }

    return days
  }

  // Verificar si una fecha está bloqueada
  const isDateBlocked = (date: Date): boolean => {
    return blockedRanges.some(range => {
      const dateTime = date.getTime()
      return dateTime >= range.start.getTime() && dateTime <= range.end.getTime()
    })
  }

  // Verificar si hay fechas bloqueadas entre dos fechas
  const hasBlockedDatesBetween = (start: Date, end: Date): boolean => {
    const startTime = start.getTime()
    const endTime = end.getTime()

    return blockedRanges.some(range => {
      const rangeStart = range.start.getTime()
      const rangeEnd = range.end.getTime()

      // Verificar si hay intersección
      return (rangeStart >= startTime && rangeStart <= endTime) ||
             (rangeEnd >= startTime && rangeEnd <= endTime) ||
             (rangeStart <= startTime && rangeEnd >= endTime)
    })
  }

  // Verificar si una fecha está en el rango seleccionado
  const isInSelectedRange = (date: Date): boolean => {
    if (!selectedStart) return false
    
    const compareDate = selectedEnd || hoverDate
    if (!compareDate) return false

    const start = selectedStart.getTime()
    const end = compareDate.getTime()
    const current = date.getTime()

    if (start <= end) {
      return current >= start && current <= end
    } else {
      return current >= end && current <= start
    }
  }

  // Verificar si una fecha es el inicio o fin del rango
  const isRangeEdge = (date: Date): 'start' | 'end' | null => {
    if (selectedStart && date.getTime() === selectedStart.getTime()) return 'start'
    if (selectedEnd && date.getTime() === selectedEnd.getTime()) return 'end'
    return null
  }

  // Manejar click en una fecha
  const handleDateClick = (date: Date) => {
    if (isDateBlocked(date)) return

    if (!selectedStart || (selectedStart && selectedEnd)) {
      // Primera selección o reiniciar
      setSelectedStart(date)
      setSelectedEnd(null)
    } else {
      // Segunda selección
      const start = selectedStart.getTime() < date.getTime() ? selectedStart : date
      const end = selectedStart.getTime() < date.getTime() ? date : selectedStart

      // Verificar si hay fechas bloqueadas en el rango
      if (hasBlockedDatesBetween(start, end)) {
        // No permitir la selección
        return
      }

      setSelectedStart(start)
      setSelectedEnd(end)
    }
  }

  // Confirmar selección
  const handleConfirm = () => {
    if (selectedStart && selectedEnd) {
      const formatDate = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      onSelect(formatDate(selectedStart), formatDate(selectedEnd))
      onClose()
    }
  }

  // Limpiar selección
  const handleClear = () => {
    setSelectedStart(null)
    setSelectedEnd(null)
  }

  // Navegar entre meses
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  // Verificar si una fecha es del mes actual
  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentMonth.getMonth()
  }

  // Verificar si una fecha es hoy
  const isToday = (date: Date): boolean => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }

  if (!isOpen) return null

  const days = getDaysInMonth(currentMonth)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        
        {/* Header - Fijo */}
        <div className="flex-shrink-0 p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Seleccionar Rango de Fechas</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-100 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Instrucciones */}
          <p className="mt-2 text-sm text-gray-600">
            {!selectedStart && 'Selecciona la fecha de inicio'}
            {selectedStart && !selectedEnd && 'Ahora selecciona la fecha de fin'}
            {selectedStart && selectedEnd && 'Rango seleccionado correctamente'}
          </p>
        </div>

        {/* Contenido Scrolleable */}
        <div className="flex-1 overflow-y-auto">
          {/* Calendario */}
          <div className="p-6">
          {/* Navegación del mes */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={previousMonth}
              className="p-2 text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h3 className="text-lg font-semibold text-gray-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            
            <button
              onClick={nextMonth}
              className="p-2 text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Nombres de los días */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-xs font-semibold text-center text-gray-500 uppercase">
                {day}
              </div>
            ))}
          </div>

          {/* Días del calendario */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((date, index) => {
              if (!date) return <div key={index} />

              const isBlocked = isDateBlocked(date)
              const inRange = isInSelectedRange(date)
              const edge = isRangeEdge(date)
              const currentMonth = isCurrentMonth(date)
              const today = isToday(date)

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(date)}
                  onMouseEnter={() => setHoverDate(date)}
                  onMouseLeave={() => setHoverDate(null)}
                  disabled={isBlocked}
                  className={`
                    relative h-10 text-sm font-medium rounded-lg transition-all
                    ${!currentMonth ? 'text-gray-300' : ''}
                    ${isBlocked 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed line-through' 
                      : 'cursor-pointer'
                    }
                    ${edge === 'start' || edge === 'end'
                      ? 'bg-[#f74116] text-white font-bold shadow-md'
                      : inRange && !isBlocked
                        ? 'bg-[#f74116]/20 text-[#f74116]'
                        : !isBlocked
                          ? 'hover:bg-gray-100 text-gray-700'
                          : ''
                    }
                    ${today && !edge && !isBlocked ? 'ring-2 ring-[#f74116]/50' : ''}
                  `}
                >
                  {date.getDate()}
                  {today && !edge && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#f74116] rounded-full" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Rango seleccionado (texto) */}
          {selectedStart && (
            <div className="mt-4 p-4 bg-[#f74116]/10 rounded-lg border border-[#f74116]/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#f74116] mb-1">Rango Seleccionado:</p>
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">
                      {selectedStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    {selectedEnd && (
                      <>
                        <span className="mx-2 text-gray-400">→</span>
                        <span className="font-semibold">
                          {selectedEnd.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </>
                    )}
                  </p>
                </div>
                {selectedStart && !selectedEnd && (
                  <button
                    onClick={() => {
                      setSelectedStart(null)
                      setSelectedEnd(null)
                    }}
                    className="text-xs text-[#f74116] hover:text-[#f74116]/80"
                  >
                    Reiniciar
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Referencias */}
          <div className="p-4 mt-6 rounded-lg bg-gray-50">
            <h4 className="mb-3 text-sm font-semibold text-gray-700">Referencias:</h4>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#f74116] rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-white">15</span>
                </div>
                <span className="text-xs text-gray-600">Fecha seleccionada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#f74116]/20 rounded flex items-center justify-center">
                  <span className="text-xs font-semibold text-[#f74116]">15</span>
                </div>
                <span className="text-xs text-gray-600">En rango seleccionado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded">
                  <span className="text-xs text-gray-400 line-through">15</span>
                </div>
                <span className="text-xs text-gray-600">Fecha bloqueada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 border-2 border-[#f74116]/50 rounded flex items-center justify-center relative">
                  <span className="text-xs font-medium text-gray-700">15</span>
                  <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#f74116] rounded-full" />
                </div>
                <span className="text-xs text-gray-600">Día actual</span>
              </div>
            </div>
          </div>

          {/* Fechas Ocupadas */}
          {blockedRanges.length > 0 && (
            <div className="p-4 mt-4 border border-red-200 rounded-lg bg-red-50">
              <h4 className="mb-3 text-sm font-semibold text-red-900">Fechas Ocupadas:</h4>
              <div className="space-y-2">
                {blockedRanges.map((range, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-white border border-red-100 rounded">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="mb-1 text-xs font-semibold text-gray-900">
                        {range.label || 'Meta sin nombre'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {range.start.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' → '}
                        {range.end.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          </div>
        </div>

        {/* Footer con botones - Fijo */}
        <div className="flex justify-end flex-shrink-0 gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleClear}
            disabled={!selectedStart && !selectedEnd}
            className="px-6 py-2 text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Limpiar Selección
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedStart || !selectedEnd}
            className="px-6 py-2 bg-[#f74116] text-white rounded-lg hover:bg-[#f74116]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Confirmar Selección
          </button>
        </div>
      </div>
    </div>
  )
}
