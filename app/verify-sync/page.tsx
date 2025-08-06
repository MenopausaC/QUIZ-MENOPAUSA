"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle, AlertCircle, XCircle, Database, TrendingUp, Users, Activity } from "lucide-react"

interface SyncReport {
  success: boolean
  timestamp: string
  connection: {
    status: string
    total_records: number
  }
  distribution: {
    organico: number
    pago: number
    outros: number
  }
  integrity: {
    score: number
    issues: number
    recent_records: number
  }
  tests: {
    insert_test: boolean
    connection_test: boolean
    data_retrieval: boolean
  }
  health_score: number
  recommendations: string[]
  error?: string
}

export default function VerifySyncPage() {
  const [report, setReport] = useState<SyncReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)

  const fetchSyncReport = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/verify-sync")
      const data = await response.json()
      setReport(data)
      console.log("Relatório de sincronização:", data)
    } catch (error) {
      console.error("Erro ao buscar relatório:", error)
      setReport({
        success: false,
        error: "Erro ao conectar com a API",
        timestamp: new Date().toISOString(),
        health_score: 0,
        connection: { status: "ERROR", total_records: 0 },
        distribution: { organico: 0, pago: 0, outros: 0 },
        integrity: { score: 0, issues: 0, recent_records: 0 },
        tests: { insert_test: false, connection_test: false, data_retrieval: false },
        recommendations: ["Erro de conexão com a API"],
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSyncReport()
  }, [])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchSyncReport, 30000) // 30 segundos
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100"
    if (score >= 60) return "text-yellow-600 bg-yellow-100"
    return "text-red-600 bg-red-100"
  }

  const getHealthScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-6 h-6" />
    if (score >= 60) return <AlertCircle className="w-6 h-6" />
    return <XCircle className="w-6 h-6" />
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Verificação de Sincronização</h1>
          <p className="text-gray-600">Status da sincronização entre aplicação e Supabase</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setAutoRefresh(!autoRefresh)} variant={autoRefresh ? "default" : "outline"} size="sm">
            <Activity className="w-4 h-4 mr-2" />
            Auto-refresh {autoRefresh ? "ON" : "OFF"}
          </Button>
          <Button onClick={fetchSyncReport} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {report && (
        <>
          {/* Score de Saúde */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${getHealthScoreColor(report.health_score)}`}>
                    {getHealthScoreIcon(report.health_score)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Score de Saúde: {report.health_score}%</h2>
                    <p className="text-gray-600">Status: {report.success ? "Sincronizado" : "Com problemas"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Última verificação:</p>
                  <p className="text-sm font-medium">{new Date(report.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas Gerais */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Database className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{report.connection.total_records}</p>
                    <p className="text-sm text-gray-600">Total de Registros</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{report.distribution.organico}</p>
                    <p className="text-sm text-gray-600">Leads Orgânicos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{report.distribution.pago}</p>
                    <p className="text-sm text-gray-600">Leads Pagos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{report.integrity.score}%</p>
                    <p className="text-sm text-gray-600">Integridade</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Testes de Sincronização */}
          <Card>
            <CardHeader>
              <CardTitle>Testes de Sincronização</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3">
                  {report.tests.connection_test ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span>Teste de Conexão</span>
                </div>

                <div className="flex items-center gap-3">
                  {report.tests.data_retrieval ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span>Recuperação de Dados</span>
                </div>

                <div className="flex items-center gap-3">
                  {report.tests.insert_test ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span>Teste de Inserção</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recomendações */}
          {report.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  Recomendações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {report.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">
                        {index + 1}
                      </Badge>
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Erro */}
          {report.error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <div>
                    <h3 className="font-medium text-red-800">Erro de Sincronização</h3>
                    <p className="text-red-700 text-sm mt-1">{report.error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Links Rápidos */}
      <Card>
        <CardHeader>
          <CardTitle>Links Rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button asChild variant="outline">
              <a href="/dashboard">Dashboard</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/quiz/organico">Quiz Orgânico</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/quiz/pago">Quiz Pago</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/test-database">Teste Database</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
