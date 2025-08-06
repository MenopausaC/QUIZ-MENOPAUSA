"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, TrendingUp, DollarSign, Calendar, Clock, User, Phone, Mail, Search, Filter, CheckCircle } from 'lucide-react'
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Agendamento {
  id: string | number
  data_agendamento: string
  horario_agendamento: string
  status: string
  tipo_consulta: string
  observacoes?: string
}

interface LeadPago {
  id: string
  nome: string
  email: string
  telefone: string
  qualificacao: string
  created_at: string
  agendamento?: Agendamento
}

interface LeadPagoData {
  totalLeads: number
  leadsQualificados: number
  leadsComAgendamento: number
  agendamentosRealizados: number
  taxaQualificacao: number
  taxaAgendamento: number
  leads: LeadPago[]
}

export default function LeadPagoTabContent() {
  const [data, setData] = useState<LeadPagoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [qualificacaoFilter, setQualificacaoFilter] = useState("todos")

  useEffect(() => {
    fetchLeadPagoData()
  }, [])

  const fetchLeadPagoData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/dashboard-data?tipo=pago")
      if (!response.ok) {
        throw new Error("Falha ao buscar dados de leads pagos")
      }
      const leadData = await response.json()
      setData(leadData)
    } catch (error) {
      console.error("Erro ao buscar dados de leads pagos:", error)
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

  const getAgendamentoStatus = (lead: LeadPago) => {
    if (!lead.agendamento) return "sem_agendamento"
    return lead.agendamento.status.toUpperCase()
  }

  const filteredLeads =
    data?.leads.filter(lead => {
      const searchContent = `${lead.nome} ${lead.email} ${lead.telefone}`.toLowerCase()
      const matchesSearch = searchContent.includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "todos" || getAgendamentoStatus(lead) === statusFilter
      const matchesQualificacao =
        qualificacaoFilter === "todos" || lead.qualificacao?.toLowerCase() === qualificacaoFilter

      return matchesSearch && matchesStatus && matchesQualificacao
    }) || []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2">Carregando dados de leads pagos...</span>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Erro ao carregar dados de leads pagos</p>
        <Button onClick={fetchLeadPagoData} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads Pagos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalLeads}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Qualificados</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.leadsQualificados}</div>
            <p className="text-xs text-muted-foreground">Taxa: {data.taxaQualificacao.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total com Agendamento</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.leadsComAgendamento}</div>
            <p className="text-xs text-muted-foreground">Taxa: {data.taxaAgendamento.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos Realizados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.agendamentosRealizados}</div>
            <p className="text-xs text-muted-foreground">Consultas concluídas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou telefone..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={qualificacaoFilter} onValueChange={setQualificacaoFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Qualificação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas Qualificações</SelectItem>
                <SelectItem value="qualificado">Qualificado</SelectItem>
                <SelectItem value="nao_qualificado">Não Qualificado</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status Agendamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Status</SelectItem>
                <SelectItem value="sem_agendamento">Sem Agendamento</SelectItem>
                <SelectItem value="AGENDADO">Agendado</SelectItem>
                <SelectItem value="CONFIRMADO">Confirmado</SelectItem>
                <SelectItem value="REALIZADO">Realizado</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Leads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Leads Pagos ({filteredLeads.length})</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLeads.length > 0 ? (
            <div className="space-y-4">
              {filteredLeads.map(lead => (
                <div key={lead.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{lead.nome || "Nome não informado"}</span>
                        <Badge className={getQualificacaoColor(lead.qualificacao)}>
                          {lead.qualificacao?.replace("_", " ") || "Pendente"}
                        </Badge>
                        {lead.agendamento ? (
                          <Badge className={getStatusColor(lead.agendamento.status)}>
                            {lead.agendamento.status}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600">
                            Sem Agendamento
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(lead.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span>{lead.email || "E-mail não informado"}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3" />
                        <span>{lead.telefone || "Telefone não informado"}</span>
                      </div>
                    </div>
                    {lead.agendamento && (
                      <div className="bg-gray-50 p-3 rounded-lg border">
                        <h4 className="font-medium text-sm mb-2 flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                          Detalhes do Agendamento
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          <div>
                            <span className="text-gray-500">Data:</span>
                            <span className="ml-2 font-medium">
                              {format(new Date(lead.agendamento.data_agendamento), "dd/MM/yyyy", {
                                locale: ptBR,
                              })}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Horário:</span>
                            <span className="ml-2 font-medium">{lead.agendamento.horario_agendamento}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Tipo:</span>
                            <span className="ml-2 font-medium capitalize">
                              {lead.agendamento.tipo_consulta?.toLowerCase() || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Status:</span>
                            <Badge className={`ml-2 ${getStatusColor(lead.agendamento.status)}`} size="sm">
                              {lead.agendamento.status}
                            </Badge>
                          </div>
                        </div>
                        {lead.agendamento.observacoes && (
                          <div className="mt-2 text-sm">
                            <span className="text-gray-500">Observações:</span>
                            <p className="mt-1 text-gray-700 bg-white p-2 rounded border">
                              {lead.agendamento.observacoes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum lead encontrado com os filtros aplicados</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
