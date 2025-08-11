"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

type MonthAvailability = {
  success: boolean
  dias_disponiveis: string[]
  error?: string
}

type TimesResponse = {
  success: boolean
  horarios_disponiveis?: string[]
  error?: string
}

type SimpleSchedulerProps = {
  onConfirm?: (payload: { date: string; time: string }) => void
  className?: string
  availabilityApi?: string
  timesApi?: string
}

function ymd(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export default function SimpleScheduler({
  onConfirm,
  className,
  availabilityApi = "/api/disponibilidade-mes",
  timesApi = "/api/horarios-disponiveis",
}: SimpleSchedulerProps) {
  const [month, setMonth] = React.useState<Date>(new Date())
  const [availableDays, setAvailableDays] = React.useState<Set<string>>(new Set())
  const [loadingMonth, setLoadingMonth] = React.useState(true)
  const [monthError, setMonthError] = React.useState<string | null>(null)

  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>()
  const [times, setTimes] = React.useState<string[]>([])
  const [loadingTimes, setLoadingTimes] = React.useState(false)
  const [timesError, setTimesError] = React.useState<string | null>(null)
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null)

  const fetchMonthAvailability = React.useCallback(async (m: Date) => {
    try {
      setLoadingMonth(true)
      setMonthError(null)
      const ano = m.getFullYear()
      const mes = m.getMonth() + 1
      const res = await fetch(`${availabilityApi}?ano=${ano}&mes=${mes}`)
      const json: MonthAvailability = await res.json()
      if (!res.ok || !json.success) {
        setMonthError(json.error || "Erro ao carregar disponibilidade do mês")
        setAvailableDays(new Set())
      } else {
        setAvailableDays(new Set(json.dias_disponiveis))
      }
    } catch {
      setMonthError("Erro ao carregar disponibilidade do mês")
      setAvailableDays(new Set())
    } finally {
      setLoadingMonth(false)
    }
  }, [availabilityApi])

  React.useEffect(() => {
    fetchMonthAvailability(month)
  }, [fetchMonthAvailability, month])

  const isPastOrSunday = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date < today) return true
    if (date.getDay() === 0) return true
    return false
  }

  const isDisabled = (date: Date) => {
    if (loadingMonth) return true
    if (isPastOrSunday(date)) return true
    return !availableDays.has(ymd(date))
  }

  const handleSelectDate = async (date?: Date) => {
    setSelectedDate(date)
    setSelectedTime(null)
    setTimes([])
    setTimesError(null)
    if (!date) return
    
    try {
      setLoadingTimes(true)
      const dateStr = ymd(date)
      const res = await fetch(`${timesApi}?data=${encodeURIComponent(dateStr)}`)
      const json: TimesResponse = await res.json()
      if (!res.ok || !json.success) {
        setTimesError(json.error || "Erro ao carregar horários disponíveis")
        setTimes([])
      } else {
        setTimes(json.horarios_disponiveis || [])
      }
    } catch {
      setTimesError("Erro ao carregar horários disponíveis")
      setTimes([])
    } finally {
      setLoadingTimes(false)
    }
  }

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) return
    const payload = { date: ymd(selectedDate), time: selectedTime }
    if (onConfirm) {
      onConfirm(payload)
    } else {
      alert(`Selecionado: ${format(selectedDate, "dd/MM/yyyy", { locale: ptBR })} às ${selectedTime}`)
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Calendário */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="mb-3">
              <h2 className="text-base font-semibold">Selecione a data</h2>
              <p className="text-xs text-muted-foreground">
                Apenas dias com horários livres estão habilitados.
              </p>
            </div>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                month={month}
                onMonthChange={setMonth}
                selected={selectedDate}
                onSelect={handleSelectDate}
                disabled={isDisabled}
                showOutsideDays={false}
                locale={ptBR}
                formatters={{
                  formatWeekdayName: (date) => {
                    const weekdays = ["D", "S", "T", "Q", "Q", "S", "S"]
                    return weekdays[date.getDay()]
                  },
                }}
              />
            </div>

            {monthError && (
              <p className="mt-3 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                {monthError}
              </p>
            )}
            {!monthError && loadingMonth && (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Carregando disponibilidade do mês...
              </p>
            )}
          </CardContent>
        </Card>

        {/* Horários */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="mb-3">
              <h2 className="text-base font-semibold">Selecione o horário</h2>
              <p className="text-xs text-muted-foreground">
                Escolha um horário disponível para a data selecionada.
              </p>
            </div>

            {!selectedDate && (
              <p className="text-sm text-muted-foreground">
                Primeiro selecione uma data no calendário.
              </p>
            )}

            {selectedDate && loadingTimes && (
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="h-10 rounded-md bg-gray-200/60 animate-pulse" />
                ))}
              </div>
            )}

            {selectedDate && !loadingTimes && timesError && (
              <p className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                {timesError}
              </p>
            )}

            {selectedDate && !loadingTimes && !timesError && times.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhum horário disponível para esta data.
              </p>
            )}

            {selectedDate && !loadingTimes && !timesError && times.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {times.map((h) => {
                  const active = selectedTime === h
                  return (
                    <button
                      key={h}
                      onClick={() => setSelectedTime(h)}
                      className={cn(
                        "h-10 rounded-md border text-sm transition",
                        active
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      )}
                      aria-pressed={active}
                    >
                      {h}
                    </button>
                  )
                })}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {selectedDate && selectedTime ? (
                  <span>
                    Selecionado:{" "}
                    <strong>
                      {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })} • {selectedTime}
                    </strong>
                  </span>
                ) : (
                  <span>Selecione data e horário</span>
                )}
              </div>
              <Button
                onClick={handleConfirm}
                disabled={!selectedDate || !selectedTime}
                className="h-9"
              >
                Confirmar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
