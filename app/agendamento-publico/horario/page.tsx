"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, ArrowLeft } from "lucide-react"
import { format, parse } from "date-fns"
import { ptBR } from "date-fns/locale"

function HorarioContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [availableHours, setAvailableHours] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const dateParam = searchParams.get("data")

  useEffect(() => {
    if (!dateParam) {
      router.push("/agendamento-publico/data")
      return
    }
    fetchAvailableHours()
  }, [dateParam, router])

  const fetchAvailableHours = async () => {
    try {
      setLoading(true)

      const response = await fetch(`/api/horarios-disponiveis?data=${dateParam}`)

      if (response.ok) {
        const data = await response.json()
        setAvailableHours(data.horarios || [])
      } else {
        console.error("Erro ao buscar horários")
        // Fallback: horários padrão
        setAvailableHours([
          "09:00",
          "09:30",
          "10:00",
          "10:30",
          "11:00",
          "11:30",
          "14:00",
          "14:30",
          "15:00",
          "15:30",
          "16:00",
          "16:30",
        ])
      }
    } catch (error) {
      console.error("Erro ao buscar horários:", error)
      // Fallback em caso de erro
      setAvailableHours([
        "09:00",
        "09:30",
        "10:00",
        "10:30",
        "11:00",
        "11:30",
        "14:00",
        "14:30",
        "15:00",
        "15:30",
        "16:00",
        "16:30",
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    // Navegar automaticamente para dados
    setTimeout(() => {
      router.push(`/agendamento-publico/dados?data=${dateParam}&horario=${time}`)
    }, 300)
  }

  const handleBack = () => {
    router.push("/agendamento-publico/data")
  }

  const formatSelectedDate = () => {
    if (!dateParam) return ""
    try {
      const date = parse(dateParam, "yyyy-MM-dd", new Date())
      return format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })
    } catch {
      return dateParam
    }
  }

  if (!dateParam) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-md mx-auto px-4">
          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="p-8 text-center">
              <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Carregando horários...</p>
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
            {/* Botão Voltar */}
            <div className="flex justify-start mb-6">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </div>

            {/* Ícone e Título */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500 rounded-full mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Escolha o Horário</h1>
              <p className="text-gray-600">{formatSelectedDate()}</p>
            </div>

            {/* Grid de Horários */}
            {availableHours.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {availableHours.map((time) => (
                  <Button
                    key={time}
                    onClick={() => handleTimeSelect(time)}
                    variant="outline"
                    className={`
                      h-14 text-base font-medium transition-all duration-200
                      ${
                        selectedTime === time
                          ? "bg-purple-500 text-white border-purple-500 transform scale-105"
                          : "hover:bg-purple-50 hover:border-purple-300 hover:scale-105"
                      }
                    `}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Nenhum horário disponível para esta data</p>
                <Button onClick={handleBack} variant="outline">
                  Escolher outra data
                </Button>
              </div>
            )}

            {/* Contador */}
            {availableHours.length > 0 && (
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">{availableHours.length} horários disponíveis</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function HorarioPage() {
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
      <HorarioContent />
    </Suspense>
  )
}
