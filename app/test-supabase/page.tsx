"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, AlertTriangle, Info } from "lucide-react"

interface TestResult {
  success: boolean
  message?: string
  error?: string
  details?: any
  tests?: {
    tableAccess?: string
    structureCheck?: string
    dataInsertion?: string
    dataCleanup?: string
  }
}

export default function TestSupabasePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)
  const [testType, setTestType] = useState<"connection" | "webhook" | null>(null)

  const testConnection = async () => {
    setIsLoading(true)
    setResult(null)
    setTestType("connection")

    try {
      const response = await fetch("/api/test-supabase-connection")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: "Erro ao executar teste de conexão",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testWebhook = async () => {
    setIsLoading(true)
    setResult(null)
    setTestType("webhook")

    try {
      const testData = {
        nome: "Teste Webhook Completo",
        email: `teste.webhook.${Date.now()}@exemplo.com`,
        telefone: "11987654321",
        idade: "45",
        pergunta1: "mais_12_meses",
        pergunta2: "diariamente",
        pergunta3: "todas_noites",
        pergunta4: "muito_irritada",
        pergunta5: "frequentemente",
        pergunta6: "muito_diminuida",
        pergunta7: "frequentemente",
        pergunta8: "muito_prejudicada",
        pergunta9: "4_7kg",
        pergunta10: "frequentemente",
        pergunta11: "baixa",
        pergunta12: "mae",
        pergunta13: "nao",
        pergunta14: "todas_acima",
        pontuacao_total: 35,
        qualificacao_lead: "ALTA",
        tipo_questionario: "TESTE",
        data_submissao: new Date().toISOString(),
        timestamp: Date.now(),
      }

      const response = await fetch("/api/webhook-supabase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: "Erro ao testar webhook",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const checkWebhookStatus = async () => {
    setIsLoading(true)
    setResult(null)
    setTestType("connection")

    try {
      const response = await fetch("/api/webhook-supabase")
      const data = await response.json()
      setResult({
        success: true,
        message: "Webhook está funcionando",
        details: data,
      })
    } catch (error) {
      setResult({
        success: false,
        error: "Webhook não está respondendo",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Diagnóstico Completo - Supabase</h1>
          <p className="text-gray-600">Teste todas as funcionalidades da integração com Supabase</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Teste de Conexão</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Verifica se consegue conectar e acessar a tabela</p>
              <Button onClick={testConnection} disabled={isLoading} className="w-full">
                {isLoading && testType === "connection" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testando...
                  </>
                ) : (
                  "Testar Conexão"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Teste de Webhook</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Simula o envio completo de um questionário</p>
              <Button onClick={testWebhook} disabled={isLoading} variant="outline" className="w-full bg-transparent">
                {isLoading && testType === "webhook" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testando...
                  </>
                ) : (
                  "Testar Webhook"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status do Webhook</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Verifica se o endpoint está respondendo</p>
              <Button onClick={checkWebhookStatus} disabled={isLoading} variant="secondary" className="w-full">
                {isLoading && testType === "connection" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Verificar Status"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {result && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Resultado do Teste
                <Badge variant={result.success ? "default" : "destructive"}>
                  {result.success ? "✅ Sucesso" : "❌ Erro"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.success ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <p className="text-green-600 font-medium">{result.message}</p>
                  </div>

                  {result.tests && (
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Testes Executados:
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Object.entries(result.tests).map(([test, status]) => (
                          <div key={test} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="capitalize text-sm">
                              {test.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                            </span>
                            <Badge variant={status === "OK" ? "default" : "destructive"} className="text-xs">
                              {status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.details && (
                    <details className="mt-4">
                      <summary className="cursor-pointer font-medium text-sm">Ver Detalhes Técnicos</summary>
                      <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs overflow-auto max-h-64">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <p className="text-red-600 font-medium">{result.error}</p>
                  </div>

                  {result.details && (
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Detalhes do Erro:
                      </h4>
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <pre className="text-sm text-red-800 overflow-auto">
                          {typeof result.details === "string"
                            ? result.details
                            : JSON.stringify(result.details, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Guia de Solução de Problemas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  Problemas Comuns
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Variáveis de ambiente não configuradas</li>
                  <li>• Políticas RLS muito restritivas</li>
                  <li>• Estrutura da tabela incompatível</li>
                  <li>• Permissões insuficientes</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Soluções
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Execute o script fix-questionarios-permissions.sql</li>
                  <li>• Verifique as variáveis NEXT_PUBLIC_SUPABASE_*</li>
                  <li>• Confirme a estrutura da tabela questionarios</li>
                  <li>• Teste cada funcionalidade separadamente</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Próximos Passos</h4>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>1. Execute todos os testes acima</li>
                <li>2. Se houver erros, execute o script SQL de correção</li>
                <li>3. Teste o questionário em /quiz/pago</li>
                <li>4. Verifique os dados no dashboard /dashboard/lead-pago</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
