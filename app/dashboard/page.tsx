"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Calendar, DollarSign, TrendingUp, Clock, ExternalLink, LinkIcon } from "lucide-react"
import GeralTabContent from "@/components/dashboard/geral-tab-content"
import LeadPagoTabContent from "@/components/dashboard/lead-pago-tab-content"
import AgendamentosTabContent from "@/components/dashboard/agendamentos-tab-content"
import Link from "next/link"

interface DashboardMetrics {
  total_questionarios: number
  total_agendamentos: number
  total_pagos: number
  receita_total: number
  agendamentos_hoje: number
  agendamentos_semana: number
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    total_questionarios: 0,
    total_agendamentos: 0,
    total_pagos: 0,
    receita_total: 0,
    agendamentos_hoje: 0,
    agendamentos_semana: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await fetch("/api/dashboard-data")
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error("Erro ao carregar métricas:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Visão geral dos agendamentos e leads</p>
        </div>

        <div className="flex gap-3">
          <Link href="/dashboard/links-agendamento">
            <Button variant="outline">
              <LinkIcon className="h-4 w-4 mr-2" />
              Links de Agendamento
            </Button>
          </Link>
          <Link href="/agendamento-publico" target="_blank">
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Página Pública
            </Button>
          </Link>
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questionários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : metrics.total_questionarios}</div>
            <p className="text-xs text-muted-foreground">Leads captados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : metrics.total_agendamentos}</div>
            <p className="text-xs text-muted-foreground">Total de consultas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Pagas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : metrics.total_pagos}</div>
            <p className="text-xs text-muted-foreground">Pagamentos confirmados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : `R$ ${metrics.receita_total.toFixed(2)}`}</div>
            <p className="text-xs text-muted-foreground">Valor arrecadado</p>
          </CardContent>
        </Card>
      </div>

      {/* Cards de agendamentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : metrics.agendamentos_hoje}</div>
            <p className="text-xs text-muted-foreground">Consultas para hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos Esta Semana</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : metrics.agendamentos_semana}</div>
            <p className="text-xs text-muted-foreground">Consultas nos próximos 7 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principais */}
      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="agendamentos">Agendamentos</TabsTrigger>
          <TabsTrigger value="lead-pago">Lead Pago</TabsTrigger>
        </TabsList>

        <TabsContent value="geral">
          <GeralTabContent />
        </TabsContent>

        <TabsContent value="agendamentos">
          <AgendamentosTabContent />
        </TabsContent>

        <TabsContent value="lead-pago">
          <LeadPagoTabContent />
        </TabsContent>
      </Tabs>
    </div>
  )
}
