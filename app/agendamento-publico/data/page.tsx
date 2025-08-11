"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isBefore,
  startOfDay,
  getDay,
} from "date-fns"
import { ptBR } from "date-fns/locale"

function DataContent() {
  const router = useRouter()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAvailableDates()
  }, [currentMonth])

  const fetchAvailableDates = async () => {
    try {
      setLoading(true)
      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth() + 1

      const response = await fetch(`/api/disponibilidade-mes?year=${year}&month=${month}`)

      if (response.ok) {
        const data = await response.json()
        setAvailableDates(data.availableDates || [])
      } else {
        console.error("Erro ao buscar disponibilidade")
        // Fallback: disponibilizar dias úteis do mês
        const start = startOfMonth(currentMonth)
        const end = endOfMonth(currentMonth)
        const days = eachDayOfInterval({ start, end })
        const weekdays = days
          .filter((day) => {
            const dayOfWeek = getDay(day)
            return dayOfWeek !== 0 && dayOfWeek !== 6 && !isBefore(day, startOfDay(new Date()))
          })
          .map((day) => format(day, "yyyy-MM-dd"))
        setAvailableDates(weekdays)
      }
    } catch (error) {
      console.error("Erro ao buscar disponibilidade:", error)
      // Fallback em caso de erro
      const start = startOfMonth(currentMonth)
      const end = endOfMonth(currentMonth)
      const days = eachDayOfInterval({ start, end })
      const weekdays = days
        .filter((day) => {
          const dayOfWeek = getDay(day)
          return dayOfWeek !== 0 && dayOfWeek !== 6 && !isBefore(day, startOfDay(new Date()))
        })
        .map((day) => format(day, "yyyy-MM-dd"))
      setAvailableDates(weekdays)
    } finally {
      setLoading(false)
    }
  }

  const handleDateSelect = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    if (availableDates.includes(dateStr)) {
      setSelectedDate(date)
      // Navegar automaticamente para seleção de horário
      setTimeout(() => {
        router.push(`/agendamento-publico/horario?data=${dateStr}`)
      }, 300)
    }
  }

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentMonth(subMonths(currentMonth, 1))
    } else {
      setCurrentMonth(addMonths(currentMonth, 1))
    }
  }

  const generateCalendarDays = () => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start, end })

    // Adicionar dias do mês anterior para completar a primeira semana
    const startDay = getDay(start)
    const prevMonthDays = []
    for (let i = startDay - 1; i >= 0; i--) {
      const prevDay = new Date(start)
      prevDay.setDate(start.getDate() - i - 1)
      prevMonthDays.push(prevDay)
    }

    // Adicionar dias do próximo mês para completar a última semana
    const endDay = getDay(end)
    const nextMonthDays = []
    for (let i = 1; i <= 6 - endDay; i++) {
      const nextDay = new Date(end)
      nextDay.setDate(end.getDate() + i)
      nextMonthDays.push(nextDay)
    }

    return [...prevMonthDays, ...days, ...nextMonthDays]
  }

  const calendarDays = generateCalendarDays()
  const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-md mx-auto px-4">
          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="p-8 text-center">
              <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Carregando calendário...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <Card className="shadow-lg border-0 bg-white">
          <CardContent className="p-8">
            {/* Ícone e Título */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-500 rounded-full mb-4">
                <CalendarIcon className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Escolha a Data</h1>
              <p className="text-gray-600">Selecione um dia disponível para sua consulta</p>
            </div>

            {/* Navegação do Mês */}
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" size="sm" onClick={() => navigateMonth("prev")} className="h-8 w-8 p-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <h2 className="text-lg font-semibold text-gray-900">
                {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
              </h2>

              <Button variant="ghost" size="sm" onClick={() => navigateMonth("next")} className="h-8 w-8 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Dias da Semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day, index) => (
                <div key={index} className="h-8 flex items-center justify-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendário */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const dateStr = format(day, "yyyy-MM-dd")
                const isCurrentMonth = isSameMonth(day, currentMonth)
                const isAvailable = availableDates.includes(dateStr)
                const isSelected = selectedDate && format(selectedDate, "yyyy-MM-dd") === dateStr
                const isTodayDate = isToday(day)
                const isPast = isBefore(day, startOfDay(new Date()))

                return (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(day)}
                    disabled={!isAvailable || isPast}
                    className={`
                      h-10 w-10 text-sm rounded-lg transition-all duration-200 flex items-center justify-center
                      ${!isCurrentMonth ? "text-gray-300" : ""}
                      ${isTodayDate && isCurrentMonth ? "bg-purple-100 text-purple-700 font-semibold" : ""}
                      ${isSelected ? "bg-purple-500 text-white font-semibold" : ""}
                      ${isAvailable && !isSelected && !isTodayDate && isCurrentMonth ? "hover:bg-purple-50 text-gray-900" : ""}
                      ${!isAvailable || isPast ? "cursor-not-allowed opacity-40" : "cursor-pointer"}
                      ${isAvailable && isCurrentMonth && !isSelected && !isTodayDate ? "hover:scale-105" : ""}
                    `}
                  >
                    {format(day, "d")}
                  </button>
                )
              })}
            </div>

            {/* Legenda */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">{availableDates.length} dias disponíveis este mês</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function DataPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-md mx-auto px-4">
            <Card className="shadow-lg border-0 bg-white">
              <CardContent className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Carregando...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      }
    >
      <DataContent />
    </Suspense>
  )
}
