"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, TrendingUp, Calendar, User, Phone, Mail, Search, Filter, CheckCircle, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Lead {
  id: string | number
  nome: string
  email: string
  telefone: string
  whatsapp: string
  origem: string
  status: string
  dataAgendamento: string
  horarioAgendamento: string
  valorConsulta: number
  createdAt: string
  updatedAt: string
}

interface DashboardData {
  leads: Lead[]
  totalLeads: number
  leadsPagos: number
  faturamentoMes: number
  taxaConversao: number
  taxaQualificacao: number
  taxaAgendamento: number
  estatisticas: {
    totalAgendamentos: number
    agendamentosPagos: number
    ticketMedio: number
  }
}

const safeToFixed = (value: number | undefined | null, decimals = 2): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return "0.00"
  }
  return Number(value).toFixed(decimals)
}

export default function LeadPagoTabContent() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [origemFilter, setOrigemFilter] = useState("todos")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/dashboard-data")
      if (!response.ok) {
        throw new Error("Falha ao buscar dados")
      }
      const dashboardData = await response.json()
      setData(dashboardData)
    } catch (error) {
      console.error("Erro ao buscar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "AGENDADO":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "CONFIRMADO":
      case "PAGO":
        return "bg-green-100 text-green-800 border-green-200"
      case "REALIZADO":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "CANCELADO":
        return "bg-red-100 text-red-800 border-red-200"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getOrigemColor = (origem: string) => {
    switch (origem?.toLowerCase()) {
      case "site":
        return "bg-blue-100 text-blue-800"
      case "instagram":
        return "bg-pink-100 text-pink-800"
      case "facebook":
        return "bg-blue-100 text-blue-800"
      case "google":
        return "bg-green-100 text-green-800"
      case "agendamento_publico":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredLeads =
    data?.leads && Array.isArray(data.leads)
      ? data.leads.filter((lead) => {
          const searchContent = `${lead.nome || ""} ${lead.email || ""} ${lead.telefone || ""}`.toLowerCase()
          const matchesSearch = searchContent.includes(searchTerm.toLowerCase())

          const matchesStatus = statusFilter === "todos" || lead.status?.toUpperCase() === statusFilter
          const matchesOrigem = origemFilter === "todos" || lead.origem?.toLowerCase() === origemFilter

          return matchesSearch && matchesStatus && matchesOrigem
        })
      : []

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
        <p className="text-gray-500">Erro ao carregar dados</p>
        <Button onClick={fetchDashboardData} className="mt-4">
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
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalLeads || 0}</div>
            <p className="text-xs text-muted-foreground">Agendamentos totais</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Pagos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.leadsPagos || 0}</div>
            <p className="text-xs text-muted-foreground">Taxa: {safeToFixed(data.taxaConversao || 0, 1)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {safeToFixed(data.faturamentoMes || 0)}</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {safeToFixed(data.estatisticas?.ticketMedio || 0)}</div>
            <p className="text-xs text-muted-foreground">Por consulta</p>
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={origemFilter} onValueChange={setOrigemFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas Origens</SelectItem>
                <SelectItem value="site">Site</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="agendamento_publico">Agendamento Público</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Status</SelectItem>
                <SelectItem value="AGENDADO">Agendado</SelectItem>
                <SelectItem value="CONFIRMADO">Confirmado</SelectItem>
                <SelectItem value="PAGO">Pago</SelectItem>
                <SelectItem value="REALIZADO">Realizado</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
                <SelectItem value="PENDING">Pendente</SelectItem>
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
              <span>Agendamentos ({filteredLeads.length})</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLeads.length > 0 ? (
            <div className="space-y-4">
              {filteredLeads.map((lead) => (
                <div key={lead.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{lead.nome || "Nome não informado"}</span>
                        <Badge className={getStatusColor(lead.status)}>{lead.status || "N/A"}</Badge>
                        <Badge className={getOrigemColor(lead.origem)} variant="outline">
                          {lead.origem || "N/A"}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(lead.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span>{lead.email || "E-mail não informado"}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3" />
                        <span>{lead.telefone || lead.whatsapp || "Telefone não informado"}</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <h4 className="font-medium text-sm mb-2 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                        Detalhes do Agendamento
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">Data:</span>
                          <span className="ml-2 font-medium">
                            {lead.dataAgendamento
                              ? format(new Date(lead.dataAgendamento), "dd/MM/yyyy", { locale: ptBR })
                              : "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Horário:</span>
                          <span className="ml-2 font-medium">{lead.horarioAgendamento || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Valor:</span>
                          <span className="ml-2 font-medium text-green-600">R$ {safeToFixed(lead.valorConsulta)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">WhatsApp:</span>
                          <span className="ml-2 font-medium">{lead.whatsapp || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum agendamento encontrado com os filtros aplicados</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
