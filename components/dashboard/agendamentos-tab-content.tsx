"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CalendarDays,
  Clock,
  User,
  Phone,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle,
  XCircle,
  DollarSign,
  X,
} from "lucide-react"
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Agendamento {
  id: number
  nome: string
  telefone: string
  dataAgendamento: string
  horarioAgendamento: string
  status: string
  origem?: string
  valorConsulta?: number
  createdAt: string
}

interface AgendamentosStats {
  total: number
  agendados: number
  confirmados: number
  realizados: number
  cancelados: number
  faturamentoMensal: number
}

export default function AgendamentosTabContent() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [stats, setStats] = useState<AgendamentosStats>({
    total: 0,
    agendados: 0,
    confirmados: 0,
    realizados: 0,
    cancelados: 0,
    faturamentoMensal: 0,
  })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("TODOS")
  const [currentWeek, setCurrentWeek] = useState(new Date())

  const fetchAgendamentos = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/dashboard-data")
      const data = await response.json()

      if (data.leads) {
        const agendamentosData = data.leads.map((lead: any) => ({
          id: lead.id,
          nome: lead.nome,
          telefone: lead.telefone,
          dataAgendamento: lead.dataAgendamento,
          horarioAgendamento: lead.horarioAgendamento,
          status: lead.status,
          origem: lead.origem,
          valorConsulta: lead.valorConsulta,
          createdAt: lead.createdAt,
        }))

        setAgendamentos(agendamentosData)

        const statsData = {
          total: agendamentosData.length,
          agendados: agendamentosData.filter((a: Agendamento) => a.status === "AGENDADO").length,
          confirmados: agendamentosData.filter((a: Agendamento) => ["CONFIRMADO", "PAGO"].includes(a.status)).length,
          realizados: agendamentosData.filter((a: Agendamento) => a.status === "REALIZADO").length,
          cancelados: agendamentosData.filter((a: Agendamento) => a.status === "CANCELADO").length,
          faturamentoMensal: data.estatisticas?.faturamentoMensal || 0,
        }
        setStats(statsData)
      }
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateAgendamentoStatus = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/agendamentos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Atualizar o estado local
        setAgendamentos((prev) =>
          prev.map((agendamento) => (agendamento.id === id ? { ...agendamento, status: newStatus } : agendamento)),
        )

        // Recalcular estatísticas
        const updatedAgendamentos = agendamentos.map((agendamento) =>
          agendamento.id === id ? { ...agendamento, status: newStatus } : agendamento,
        )

        const statsData = {
          total: updatedAgendamentos.length,
          agendados: updatedAgendamentos.filter((a: Agendamento) => a.status === "AGENDADO").length,
          confirmados: updatedAgendamentos.filter((a: Agendamento) => ["CONFIRMADO", "PAGO"].includes(a.status)).length,
          realizados: updatedAgendamentos.filter((a: Agendamento) => a.status === "REALIZADO").length,
          cancelados: updatedAgendamentos.filter((a: Agendamento) => a.status === "CANCELADO").length,
          faturamentoMensal: stats.faturamentoMensal,
        }
        setStats(statsData)
      }
    } catch (error) {
      console.error("Erro ao atualizar agendamento:", error)
    }
  }

  const handleCancelar = (id: number) => {
    updateAgendamentoStatus(id, "CANCELADO")
  }

  const handleMarcarPago = (id: number) => {
    updateAgendamentoStatus(id, "PAGO")
  }

  const handleConfirmar = (id: number) => {
    updateAgendamentoStatus(id, "CONFIRMADO")
  }

  const handleRealizado = (id: number) => {
    updateAgendamentoStatus(id, "REALIZADO")
  }

  useEffect(() => {
    fetchAgendamentos()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "AGENDADO":
        return "bg-blue-100 text-blue-800"
      case "CONFIRMADO":
      case "PAGO":
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
    return agendamento.status?.toUpperCase() === statusFilter
  })

  // Calcular início e fim da semana
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }) // Segunda-feira
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 }) // Domingo

  // Gerar dias da semana (Segunda a Sábado)
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd }).slice(0, 6) // Apenas 6 dias

  // Filtrar agendamentos da semana atual
  const weekAgendamentos = filteredAgendamentos.filter((agendamento) => {
    if (!agendamento.dataAgendamento) return false
    const agendamentoDate = new Date(agendamento.dataAgendamento + "T00:00:00")
    return agendamentoDate >= weekStart && agendamentoDate <= weekEnd
  })

  // Agrupar agendamentos por dia
  const agendamentosPorDia = weekDays.reduce(
    (acc, day) => {
      const dayKey = format(day, "yyyy-MM-dd")
      acc[dayKey] = weekAgendamentos
        .filter((agendamento) => agendamento.dataAgendamento === dayKey)
        .sort((a, b) => (a.horarioAgendamento || "").localeCompare(b.horarioAgendamento || ""))
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
  const weekFaturamento = weekAgendamentos
    .filter((a) => ["PAGO", "REALIZADO"].includes(a.status?.toUpperCase() || ""))
    .reduce((total, a) => total + (Number(a.valorConsulta) || 0), 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
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
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
                <p className="text-sm font-medium text-gray-600">Agendados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.agendados}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
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
              <User className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Realizados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.realizados}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cancelados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.cancelados}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Phone className="h-8 w-8 text-emerald-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Faturamento</p>
                <p className="text-xl font-bold text-gray-900">R$ {stats.faturamentoMensal.toFixed(0)}</p>
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
                  <SelectItem value="PAGO">Pago</SelectItem>
                  <SelectItem value="REALIZADO">Realizado</SelectItem>
                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                </SelectContent>
              </Select>
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
                          className="p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-purple-600">
                              {agendamento.horarioAgendamento || "Sem horário"}
                            </span>
                            <Badge className={`text-xs ${getStatusColor(agendamento.status)}`}>
                              {agendamento.status || "N/A"}
                            </Badge>
                          </div>

                          <div className="text-sm font-medium text-gray-900 truncate mb-1">{agendamento.nome}</div>
                          <div className="text-xs text-gray-500 truncate mb-1">{agendamento.telefone}</div>

                          {agendamento.origem && <div className="text-xs text-gray-400 mb-2">{agendamento.origem}</div>}

                          {agendamento.valorConsulta && (
                            <div className="text-xs text-green-600 font-medium mb-2">
                              R$ {Number(agendamento.valorConsulta).toFixed(2)}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-1 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 text-xs text-red-600 hover:bg-red-50 bg-transparent"
                              onClick={() => handleCancelar(agendamento.id)}
                              disabled={agendamento.status === "CANCELADO"}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Cancelar
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 text-xs text-blue-600 hover:bg-blue-50 bg-transparent"
                              onClick={() => handleConfirmar(agendamento.id)}
                              disabled={agendamento.status !== "AGENDADO"}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Confirmar
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 text-xs text-green-600 hover:bg-green-50 bg-transparent"
                              onClick={() => handleMarcarPago(agendamento.id)}
                              disabled={!["AGENDADO", "CONFIRMADO"].includes(agendamento.status)}
                            >
                              <DollarSign className="h-3 w-3 mr-1" />
                              Pago
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 text-xs text-purple-600 hover:bg-purple-50 bg-transparent"
                              onClick={() => handleRealizado(agendamento.id)}
                              disabled={!["PAGO", "CONFIRMADO"].includes(agendamento.status)}
                            >
                              <User className="h-3 w-3 mr-1" />
                              Realizado
                            </Button>
                          </div>
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
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-sm font-medium text-gray-600">Agendamentos nesta semana:</span>
                  <span className="text-lg font-bold text-purple-600 ml-2">{weekAgendamentosCount}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Faturamento da semana:</span>
                  <span className="text-lg font-bold text-green-600 ml-2">R$ {weekFaturamento.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
