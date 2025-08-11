"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays, Clock, User, Phone, ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from "date-fns"
import { ptBR } from "date-fns/locale"
import CreateAppointmentDialog from "./create-appointment-dialog"

interface Agendamento {
  id: number
  nome_paciente: string
  telefone_paciente: string
  data_agendamento: string
  horario_agendamento: string
  status: "AGENDADO" | "CONFIRMADO" | "REALIZADO" | "CANCELADO"
  tipo_consulta: string
  observacoes?: string
}

interface AgendamentosStats {
  total: number
  agendados: number
  confirmados: number
  realizados: number
  cancelados: number
}

interface EditDialogProps {
  appointment: Agendamento | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAppointmentUpdated?: () => void
}

export default function AgendamentosTabContent() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [stats, setStats] = useState<AgendamentosStats>({
    total: 0,
    agendados: 0,
    confirmados: 0,
    realizados: 0,
    cancelados: 0,
  })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("TODOS")
  const [currentWeek, setCurrentWeek] = useState(new Date())

  const fetchAgendamentos = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/dashboard-data")
      const data = await response.json()

      if (data.success) {
        const agendamentosData = data.data?.estatisticas || data.estatisticas || []
        const statsData = {
          total: agendamentosData.totalAgendamentos || 0,
          agendados: agendamentosData.agendamentosConfirmados || 0,
          confirmados: agendamentosData.agendamentosConfirmados || 0,
          realizados: agendamentosData.agendamentosRealizados || 0,
          cancelados: 0,
        }

        setAgendamentos(data.data?.agendamentosRecentes || data.agendamentosRecentes || [])
        setStats(statsData)
      }
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAgendamentos()
  }, [])

  const handleAppointmentCreated = () => {
    fetchAgendamentos()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AGENDADO":
        return "bg-blue-100 text-blue-800"
      case "CONFIRMADO":
        return "bg-green-100 text-green-800"
      case "REALIZADO":
        return "bg-purple-100 text-purple-800"
      case "CANCELADO":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredAgendamentos = agendamentos.filter((agendamento) => {
    if (statusFilter === "TODOS") return true
    return agendamento.status === statusFilter
  })

  // Calcular início e fim da semana
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }) // Segunda-feira
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 }) // Domingo

  // Gerar dias da semana (Segunda a Sábado)
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd }).slice(0, 6) // Apenas 6 dias

  // Filtrar agendamentos da semana atual
  const weekAgendamentos = filteredAgendamentos.filter((agendamento) => {
    const agendamentoDate = new Date(agendamento.data_agendamento + "T00:00:00")
    return agendamentoDate >= weekStart && agendamentoDate <= weekEnd
  })

  // Agrupar agendamentos por dia
  const agendamentosPorDia = weekDays.reduce(
    (acc, day) => {
      const dayKey = format(day, "yyyy-MM-dd")
      acc[dayKey] = weekAgendamentos
        .filter((agendamento) => agendamento.data_agendamento === dayKey)
        .sort((a, b) => a.horario_agendamento.localeCompare(b.horario_agendamento))
      return acc
    },
    {} as Record<string, Agendamento[]>,
  )

  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1))
  }

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1))
  }

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date())
  }

  const weekAgendamentosCount = weekAgendamentos.length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CalendarDays className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Geral</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Esta Semana</p>
                <p className="text-2xl font-bold text-gray-900">{weekAgendamentosCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.confirmados}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Phone className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Realizados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.realizados}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendário Semanal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">Calendário Semanal</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  <SelectItem value="AGENDADO">Agendado</SelectItem>
                  <SelectItem value="CONFIRMADO">Confirmado</SelectItem>
                  <SelectItem value="REALIZADO">Realizado</SelectItem>
                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <CreateAppointmentDialog onAppointmentCreated={handleAppointmentCreated} />
            </div>
          </div>

          {/* Navegação da Semana */}
          <div className="flex items-center justify-between mt-4">
            <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">
                {format(weekStart, "dd/MM", { locale: ptBR })} - {format(weekEnd, "dd/MM/yyyy", { locale: ptBR })}
              </span>
              <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
                Hoje
              </Button>
            </div>

            <Button variant="outline" size="sm" onClick={goToNextWeek}>
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Grid do Calendário */}
          <div className="grid grid-cols-6 gap-4">
            {weekDays.map((day) => {
              const dayKey = format(day, "yyyy-MM-dd")
              const dayAgendamentos = agendamentosPorDia[dayKey] || []
              const isCurrentDay = isToday(day)

              return (
                <div key={dayKey} className="min-h-[200px]">
                  {/* Header do Dia */}
                  <div
                    className={`p-3 rounded-t-lg border-b ${
                      isCurrentDay ? "bg-purple-100 border-purple-200" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-600">{format(day, "EEE", { locale: ptBR })}</div>
                      <div className={`text-lg font-bold ${isCurrentDay ? "text-purple-600" : "text-gray-900"}`}>
                        {format(day, "dd", { locale: ptBR })}
                      </div>
                      <div className="text-xs text-gray-500">{format(day, "MMM", { locale: ptBR })}</div>
                    </div>
                  </div>

                  {/* Agendamentos do Dia */}
                  <div className="p-2 space-y-2 bg-white border-l border-r border-b rounded-b-lg min-h-[160px]">
                    {dayAgendamentos.length === 0 ? (
                      <div className="text-center text-gray-400 text-sm mt-8">Nenhum agendamento</div>
                    ) : (
                      dayAgendamentos.map((agendamento) => (
                        <div
                          key={agendamento.id}
                          className="p-2 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-purple-600">
                              {agendamento.horario_agendamento}
                            </span>
                            <Badge className={`text-xs ${getStatusColor(agendamento.status)}`}>
                              {agendamento.status}
                            </Badge>
                          </div>
                          <div className="text-sm font-medium text-gray-900 truncate">{agendamento.nome_paciente}</div>
                          <div className="text-xs text-gray-500 truncate">{agendamento.telefone_paciente}</div>
                          <div className="text-xs text-gray-400 mt-1">{agendamento.tipo_consulta}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Resumo da Semana */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Total de agendamentos nesta semana:</span>
              <span className="text-lg font-bold text-purple-600">{weekAgendamentosCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
