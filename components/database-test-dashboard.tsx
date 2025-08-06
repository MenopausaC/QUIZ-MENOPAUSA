"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, Database, Play, RefreshCw, Table, Eye, Edit } from "lucide-react"

interface DatabaseTestResult {
  success: boolean
  timestamp?: string
  tests?: {
    tableAccess: {
      [key: string]: {
        accessible: boolean
        count: number
        error?: string
      }
    }
    dataRetrieval: {
      questionarios: {
        success: boolean
        count: number
        error?: string
        sampleData?: any[]
      }
      dashboard_view: {
        success: boolean
        count: number
        error?: string
      }
      metrics_view: {
        success: boolean
        data?: any
        error?: string
      }
    }
    writePermissions: {
      canInsert: boolean
      error?: string
    }
  }
  error?: string
  details?: any
}

export default function DatabaseTestDashboard() {
  const [testResult, setTestResult] = useState<DatabaseTestResult | null>(null)
  const [loading, setLoading] = useState(false)

  const runDatabaseTest = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-database")
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({
        success: false,
        error: "Failed to run database test",
        details: { message: error instanceof Error ? error.message : "Unknown error" },
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />
  }

  const getStatusBadge = (success: boolean) => {
    return (
      <Badge variant={success ? "default" : "destructive"} className={success ? "bg-green-100 text-green-800" : ""}>
        {success ? "OK" : "ERRO"}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Teste Completo de Banco de Dados
          </CardTitle>
          <CardDescription>
            Verifique se todas as tabelas, views e permissões estão configuradas corretamente no Supabase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runDatabaseTest} disabled={loading} className="mb-4">
            {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            {loading ? "Executando Teste..." : "Executar Teste Completo"}
          </Button>

          {testResult && (
            <div className="space-y-4">
              <Alert variant={testResult.success ? "default" : "destructive"}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Status Geral:</strong>{" "}
                  {testResult.success
                    ? "✅ Sucesso - Banco configurado corretamente!"
                    : "❌ Falha - Problemas encontrados"}
                  {testResult.timestamp && (
                    <span className="block text-sm text-muted-foreground mt-1">
                      Executado em: {new Date(testResult.timestamp).toLocaleString("pt-BR")}
                    </span>
                  )}
                </AlertDescription>
              </Alert>

              {testResult.tests && (
                <div className="grid gap-4">
                  {/* Table Access Tests */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Table className="h-4 w-4" />
                        Acesso às Tabelas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {Object.entries(testResult.tests.tableAccess).map(([tableName, result]) => (
                        <div key={tableName} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(result.accessible)}
                            <span className="text-sm font-mono">{tableName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{result.count} registros</span>
                            {getStatusBadge(result.accessible)}
                          </div>
                          {result.error && <div className="text-xs text-red-600 mt-1">{result.error}</div>}
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Data Retrieval Tests */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Leitura de Dados
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs">Questionários</span>
                            {getStatusBadge(testResult.tests.dataRetrieval.questionarios.success)}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs">Dashboard View</span>
                            {getStatusBadge(testResult.tests.dataRetrieval.dashboard_view.success)}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs">Métricas View</span>
                            {getStatusBadge(testResult.tests.dataRetrieval.metrics_view.success)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Edit className="h-4 w-4" />
                          Permissões de Escrita
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(testResult.tests.writePermissions.canInsert)}
                            <span className="text-sm">Inserção</span>
                          </div>
                          {getStatusBadge(testResult.tests.writePermissions.canInsert)}
                        </div>
                        {testResult.tests.writePermissions.error && (
                          <p className="text-xs text-red-600">{testResult.tests.writePermissions.error}</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Metrics Display */}
                    {testResult.tests.dataRetrieval.metrics_view.success &&
                      testResult.tests.dataRetrieval.metrics_view.data && (
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Métricas Atuais</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-1 text-xs">
                              <div>Total: {testResult.tests.dataRetrieval.metrics_view.data.total_leads}</div>
                              <div>Quentes: {testResult.tests.dataRetrieval.metrics_view.data.leads_quentes}</div>
                              <div>Hoje: {testResult.tests.dataRetrieval.metrics_view.data.leads_hoje}</div>
                              <div>Semana: {testResult.tests.dataRetrieval.metrics_view.data.leads_semana}</div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                  </div>

                  {/* Sample Data Display */}
                  {testResult.tests.dataRetrieval.questionarios.sampleData &&
                    testResult.tests.dataRetrieval.questionarios.sampleData.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Dados de Exemplo</CardTitle>
                          <CardDescription>Últimos registros encontrados na tabela questionarios</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {testResult.tests.dataRetrieval.questionarios.sampleData.map((record, index) => (
                              <div key={index} className="p-3 bg-muted rounded text-sm">
                                <div className="font-medium">{record.nome_completo}</div>
                                <div className="text-muted-foreground text-xs">
                                  {record.email_cadastro} • {record.origem} • {record.qualificacao_lead} •{" "}
                                  {record.pontuacao_total} pts
                                </div>
                                <div className="text-muted-foreground text-xs">
                                  {new Date(record.created_at).toLocaleString("pt-BR")}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                  {/* Instructions for next steps */}
                  {testResult.success && (
                    <Card className="border-green-200 bg-green-50">
                      <CardHeader>
                        <CardTitle className="text-sm text-green-800">✅ Banco Configurado com Sucesso!</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-green-700 space-y-2">
                          <p>Próximos passos:</p>
                          <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>
                              Acesse <code>/dashboard</code> para ver os dados
                            </li>
                            <li>
                              Teste os questionários em <code>/quiz/organico</code> e <code>/quiz/pago</code>
                            </li>
                            <li>Verifique se os webhooks estão funcionando</li>
                            <li>Configure as variáveis de ambiente no Vercel se necessário</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Error Details */}
                  {!testResult.success && (
                    <Card className="border-red-200">
                      <CardHeader>
                        <CardTitle className="text-sm text-red-600">Detalhes dos Erros</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {testResult.error && (
                            <Alert variant="destructive">
                              <AlertDescription>{testResult.error}</AlertDescription>
                            </Alert>
                          )}
                          {testResult.details && (
                            <pre className="text-xs bg-red-50 p-2 rounded overflow-auto">
                              {JSON.stringify(testResult.details, null, 2)}
                            </pre>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
