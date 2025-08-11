"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  UserCheck,
  ExternalLink,
  CalendarDays,
  Activity,
} from "lucide-react"

interface DashboardStats {
  totalLeads: number
  leadsPagos: number
  agendamentosHoje: number
  faturamentoMes: number
}

interface RecentActivity {
  id: string
  type: "lead" | "agendamento" | "pagamento"
  description: string
  time: string
}

const safeToFixed = (value: number | undefined | null, decimals = 2): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return "0.00"
  }
  return Number(value).toFixed(decimals)
}

export default function GeralTabContent() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    leadsPagos: 0,
    agendamentosHoje: 0,
    faturamentoMes: 0,
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/dashboard-data")
        if (response.ok) {
          const data = await response.json()
          setStats({
            totalLeads: data.totalLeads || 0,
            leadsPagos: data.leadsPagos || 0,
            agendamentosHoje: data.agendamentosHoje || 0,
            faturamentoMes: data.faturamentoMes || 0,
          })
          setRecentActivities(data.recentActivities || [])
        }
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleOpenAgendamento = () => {
    window.open("/agendamento-publico", "_blank")
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Página de Agendamento</h3>
              <p className="text-purple-100 mb-4">Abra a página pública de agendamento para seus pacientes</p>
              <Button
                onClick={handleOpenAgendamento}
                className="bg-white text-purple-600 hover:bg-purple-50 font-semibold"
              >
                <CalendarDays className="h-4 w-4 mr-2" />
                Abrir Agendamento
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
            <div className="hidden md:block">
              <Calendar className="h-16 w-16 text-purple-200" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Leads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Este mês
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Leads Pagos</p>
                <p className="text-2xl font-bold text-green-600">{stats.leadsPagos}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="text-xs">
                <DollarSign className="h-3 w-3 mr-1" />
                Convertidos
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Agendamentos Hoje</p>
                <p className="text-2xl font-bold text-purple-600">{stats.agendamentosHoje}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Hoje
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Faturamento</p>
                <p className="text-2xl font-bold text-orange-600">R$ {safeToFixed(stats.faturamentoMes)}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Este mês
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div
                      className={`h-2 w-2 rounded-full mt-2 ${
                        activity.type === "lead"
                          ? "bg-blue-500"
                          : activity.type === "agendamento"
                            ? "bg-purple-500"
                            : "bg-green-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Nenhuma atividade recente</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Resumo do Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Agendamentos hoje:</span>
                <Badge variant="outline">{stats.agendamentosHoje}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Novos leads:</span>
                <Badge variant="outline">{Math.max(0, stats.totalLeads - stats.leadsPagos)}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Taxa de conversão:</span>
                <Badge variant="outline">
                  {stats.totalLeads > 0 ? `${((stats.leadsPagos / stats.totalLeads) * 100).toFixed(1)}%` : "0%"}
                </Badge>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">Status geral:</span>
                  <Badge className="bg-green-100 text-green-800">
                    {stats.agendamentosHoje > 0 ? "Ativo" : "Aguardando"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
