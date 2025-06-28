"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, AlertTriangle, Play, RefreshCw } from "lucide-react"

interface TestResult {
  sucesso: boolean
  status?: number | string
  url?: string
  erro?: string
  resposta?: any
  tempo_resposta?: number
  dados_enviados?: any
  mensagem?: string
}

interface TestResults {
  timestamp: string
  testes: {
    make_organico: TestResult
    make_pago: TestResult
    active_campaign: TestResult
    webhook_interno: TestResult
  }
  resumo: {
    total_testes: number
    sucessos: number
    falhas: number
  }
  dados_teste: any
}

export default function WebhookTestDashboard() {
  const [testResults, setTestResults] = useState<TestResults | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runWebhookTests = async () => {
    setIsLoading(true)
    setError(null)
    setTestResults(null)

    try {
      console.log("🚀 Iniciando testes de webhook...")

      const response = await fetch("/api/test-webhook-validation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setTestResults(data.resultados)
        console.log("✅ Testes concluídos com sucesso:", data.resultados)
      } else {
        throw new Error(data.message || "Erro desconhecido")
      }
    } catch (err) {
      console.error("❌ Erro nos testes:", err)
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (sucesso: boolean, status?: number | string) => {
    if (sucesso) {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    } else if (status === "não_configurado") {
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />
    } else {
      return <XCircle className="w-5 h-5 text-red-500" />
    }
  }

  const getStatusBadge = (sucesso: boolean, status?: number | string) => {
    if (sucesso) {
      return (
        <Badge variant="default" className="bg-green-500">
          Sucesso
        </Badge>
      )
    } else if (status === "não_configurado") {
      return <Badge variant="secondary">Não Configurado</Badge>
    } else {
      return <Badge variant="destructive">Falha</Badge>
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("pt-BR")
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-6 h-6" />
            Dashboard de Testes de Webhook
          </CardTitle>
          <p className="text-sm text-gray-600">Teste e valide se todos os webhooks estão funcionando corretamente</p>
        </CardHeader>
        <CardContent>
          <Button onClick={runWebhookTests} disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Executando Testes...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Executar Testes de Webhook
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              <span className="font-medium">Erro nos Testes</span>
            </div>
            <p className="text-sm text-red-600 mt-2">{error}</p>
          </CardContent>
        </Card>
      )}

      {testResults && (
        <div className="space-y-6">
          {/* Resumo */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo dos Testes</CardTitle>
              <p className="text-sm text-gray-600">Executado em: {formatTimestamp(testResults.timestamp)}</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{testResults.resumo.total_testes}</div>
                  <div className="text-sm text-gray-600">Total de Testes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{testResults.resumo.sucessos}</div>
                  <div className="text-sm text-gray-600">Sucessos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{testResults.resumo.falhas}</div>
                  <div className="text-sm text-gray-600">Falhas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resultados Detalhados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Make.com Orgânico */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Make.com (Orgânico)</span>
                  {getStatusIcon(testResults.testes.make_organico.sucesso, testResults.testes.make_organico.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status:</span>
                  {getStatusBadge(testResults.testes.make_organico.sucesso, testResults.testes.make_organico.status)}
                </div>
                {testResults.testes.make_organico.status && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Código:</span>
                    <span className="text-sm">{testResults.testes.make_organico.status}</span>
                  </div>
                )}
                {testResults.testes.make_organico.url && (
                  <div className="text-xs text-gray-500 break-all">URL: {testResults.testes.make_organico.url}</div>
                )}
                {testResults.testes.make_organico.erro && (
                  <div className="text-xs text-red-600 break-words">Erro: {testResults.testes.make_organico.erro}</div>
                )}
              </CardContent>
            </Card>

            {/* Make.com Pago */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Make.com (Pago)</span>
                  {getStatusIcon(testResults.testes.make_pago.sucesso, testResults.testes.make_pago.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status:</span>
                  {getStatusBadge(testResults.testes.make_pago.sucesso, testResults.testes.make_pago.status)}
                </div>
                {testResults.testes.make_pago.status && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Código:</span>
                    <span className="text-sm">{testResults.testes.make_pago.status}</span>
                  </div>
                )}
                {testResults.testes.make_pago.url && (
                  <div className="text-xs text-gray-500 break-all">URL: {testResults.testes.make_pago.url}</div>
                )}
                {testResults.testes.make_pago.erro && (
                  <div className="text-xs text-red-600 break-words">Erro: {testResults.testes.make_pago.erro}</div>
                )}
              </CardContent>
            </Card>

            {/* Active Campaign */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Active Campaign</span>
                  {getStatusIcon(testResults.testes.active_campaign.sucesso, testResults.testes.active_campaign.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status:</span>
                  {getStatusBadge(
                    testResults.testes.active_campaign.sucesso,
                    testResults.testes.active_campaign.status,
                  )}
                </div>
                {testResults.testes.active_campaign.status && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Código:</span>
                    <span className="text-sm">{testResults.testes.active_campaign.status}</span>
                  </div>
                )}
                {testResults.testes.active_campaign.mensagem && (
                  <div className="text-xs text-gray-600">{testResults.testes.active_campaign.mensagem}</div>
                )}
                {testResults.testes.active_campaign.erro && (
                  <div className="text-xs text-red-600 break-words">
                    Erro: {testResults.testes.active_campaign.erro}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Webhook Interno */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Webhook Interno</span>
                  {getStatusIcon(testResults.testes.webhook_interno.sucesso, testResults.testes.webhook_interno.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status:</span>
                  {getStatusBadge(
                    testResults.testes.webhook_interno.sucesso,
                    testResults.testes.webhook_interno.status,
                  )}
                </div>
                {testResults.testes.webhook_interno.status && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Código:</span>
                    <span className="text-sm">{testResults.testes.webhook_interno.status}</span>
                  </div>
                )}
                {testResults.testes.webhook_interno.erro && (
                  <div className="text-xs text-red-600 break-words">
                    Erro: {testResults.testes.webhook_interno.erro}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Dados de Teste */}
          <Card>
            <CardHeader>
              <CardTitle>Dados de Teste Utilizados</CardTitle>
              <p className="text-sm text-gray-600">Dados simulados enviados para todos os webhooks</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Nome:</strong> {testResults.dados_teste.nome}
                </div>
                <div>
                  <strong>Email:</strong> {testResults.dados_teste.email}
                </div>
                <div>
                  <strong>Qualificação:</strong> {testResults.dados_teste.qualificacao_lead}
                </div>
                <div>
                  <strong>Valor Disposto:</strong> {testResults.dados_teste.valor_disposto_pagar}
                </div>
                <div>
                  <strong>Tipo:</strong> {testResults.dados_teste.tipo_questionario}
                </div>
                <div>
                  <strong>Pontuação:</strong> {testResults.dados_teste.pontuacao_total}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
