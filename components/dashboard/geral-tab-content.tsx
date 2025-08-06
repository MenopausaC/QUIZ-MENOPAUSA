"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, Users, TrendingUp, Clock, Phone, Mail, User, Calendar, CheckCircle } from 'lucide-react'
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Agendamento {
  id: string | number
  nome_paciente: string
  email_paciente: string
  telefone_paciente: string
  data_agendamento: string
  horario_agendamento: string
  status: string
  tipo_consulta: string
}

interface Lead {
  id: string
  nome: string
  email: string
  telefone: string
  tipo: string
  qualificacao: string
  created_at: string
  agendamento?: Agendamento
}

interface DashboardData {
  totalQuestionarios: number
  totalAgendamentos: number
  agendamentosHoje: number
  proximosAgendamentos: Agendamento[]
  ultimosLeads: Lead[]
  taxaConversao: {
    qualificacao: number
    agendamento: number
    realizacao: number
  }
}

export default function GeralTabContent() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/dashboard-data")
      if (!response.ok) {
        throw new Error("Falha ao buscar dados do dashboard")
      }
      const dashboardData = await response.json()
      setData(dashboardData)
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "AGENDADO":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "CONFIRMADO":
        return "bg-green-100 text-green-800 border-green-200"
      case "REALIZADO":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "CANCELADO":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getQualificacaoColor = (qualificacao: string) => {
    switch (qualificacao?.toLowerCase()) {
      case "qualificado":
        return "bg-green-100 text-green-800 border-green-200"
      case "nao_qualificado":
        return "bg-red-100 text-red-800 border-red-200"
      case "pendente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2">Carregando dados...</span>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Erro ao carregar dados do dashboard</p>
        <Button onClick={fetchDashboardData} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Questionários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalQuestionarios}</div>
            <p className="text-xs text-muted-foreground">Leads capturados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Agendamentos</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalAgendamentos}</div>
            <p className="text-xs text-muted-foreground">Consultas agendadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.agendamentosHoje}</div>
            <p className="text-xs text-muted-foreground">Consultas para hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Agendamento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.taxaConversao.agendamento.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Qualificados → Agendados</p>
          </CardContent>
        </Card>
      </div>

      {/* Próximos Agendamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Próximos Agendamentos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.proximosAgendamentos.length > 0 ? (
            <div className="space-y-4">
              {data.proximosAgendamentos.map((agendamento) => (
                <div key={agendamento.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{agendamento.nome_paciente}</span>
                      <Badge className={getStatusColor(agendamento.status)}>
                        {agendamento.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(agendamento.data_agendamento), "dd/MM/yyyy", { locale: ptBR })}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{agendamento.horario_agendamento}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3" />
                        <span>{agendamento.telefone_paciente}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">{agendamento.tipo_consulta}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Nenhum agendamento próximo</p>
          )}
        </CardContent>
      </Card>

      {/* Últimos Leads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Últimos Leads</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.ultimosLeads.length > 0 ? (
            <div className="space-y-4">
              {data.ultimosLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{lead.nome}</span>
                      <Badge variant="outline" className="text-xs">
                        {lead.tipo === "ORGANICO" ? "Orgânico" : "Pago"}
                      </Badge>
                      <Badge className={getQualificacaoColor(lead.qualificacao)}>
                        {lead.qualificacao === "qualificado" ? "Qualificado" : 
                         lead.qualificacao === "nao_qualificado" ? "Não Qualificado" : "Pendente"}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span>{lead.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3" />
                        <span>{lead.telefone}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(lead.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                      </div>
                    </div>
                    {lead.agendamento && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-3 w-3 text-green-600" />
                        <span className="text-green-600">
                          Agendado para {format(new Date(lead.agendamento.data_agendamento), "dd/MM/yyyy", { locale: ptBR })} às {lead.agendamento.horario_agendamento}
                        </span>
                        <Badge className={getStatusColor(lead.agendamento.status)}>
                          {lead.agendamento.status}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Nenhum lead encontrado</p>
          )}
        </CardContent>
      </Card>

      {/* Métricas de Conversão */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Taxa de Qualificação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.taxaConversao.qualificacao.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Leads qualificados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Taxa de Agendamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{data.taxaConversao.agendamento.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Qualificados → Agendados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Taxa de Realização</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{data.taxaConversao.realizacao.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Agendados → Realizados</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
