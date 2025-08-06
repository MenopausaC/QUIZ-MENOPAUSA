"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TestResult {
  test: string
  status: string
  details: string
}

interface TestResults {
  config: {
    url: string
    key: string
  }
  tests: TestResult[]
}

export default function TestFinalPage() {
  const [results, setResults] = useState<TestResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [webhookResult, setWebhookResult] = useState<any>(null)
  const [webhookLoading, setWebhookLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-supabase-final")
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Erro ao executar testes:", error)
    } finally {
      setLoading(false)
    }
  }

  const testWebhook = async () => {
    setWebhookLoading(true)
    try {
      const response = await fetch("/api/test-supabase-final", {
        method: "POST",
      })
      const data = await response.json()
      setWebhookResult(data)
    } catch (error) {
      console.error("Erro ao testar webhook:", error)
    } finally {
      setWebhookLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Teste Final - Configuração Supabase</h1>
        <p className="text-muted-foreground">
          Teste completo da configuração do Supabase para receber dados dos questionários
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Teste de Configuração</CardTitle>
            <CardDescription>Verifica se o Supabase está configurado corretamente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runTests} disabled={loading} className="w-full">
              {loading ? "Executando..." : "Executar Teste Completo"}
            </Button>

            {results && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Configuração:</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>URL Supabase:</span>
                      <Badge variant={results.config.url === "OK" ? "default" : "destructive"}>
                        {results.config.url}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Chave Anon:</span>
                      <Badge variant={results.config.key === "OK" ? "default" : "destructive"}>
                        {results.config.key}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Testes:</h3>
                  <div className="space-y-2">
                    {results.tests.map((test, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium">{test.test}</span>
                          <Badge variant={test.status === "OK" ? "default" : "destructive"}>{test.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{test.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teste de Webhook</CardTitle>
            <CardDescription>Simula o envio de dados de um questionário</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testWebhook} disabled={webhookLoading} className="w-full bg-transparent" variant="outline">
              {webhookLoading ? "Enviando..." : "Testar Webhook"}
            </Button>

            {webhookResult && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Status:</span>
                  <Badge variant={webhookResult.success ? "default" : "destructive"}>
                    {webhookResult.success ? "SUCESSO" : "ERRO"}
                  </Badge>
                </div>

                <div className="p-3 border rounded-lg">
                  <p className="text-sm">{webhookResult.message}</p>
                  {webhookResult.data && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <p>ID: {webhookResult.data.id}</p>
                      <p>Email: {webhookResult.data.email_cadastro}</p>
                      <p>Qualificação: {webhookResult.data.qualificacao_lead}</p>
                    </div>
                  )}
                  {webhookResult.details && <p className="mt-2 text-xs text-red-600">{webhookResult.details}</p>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximos Passos</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              Execute o script SQL <code>configure-supabase-final-fixed.sql</code> no Supabase
            </li>
            <li>Clique em "Executar Teste Completo" para verificar a configuração</li>
            <li>Use "Testar Webhook" para simular o envio de dados</li>
            <li>
              Se todos os testes passarem, teste o questionário real em <code>/quiz/pago</code>
            </li>
            <li>
              Verifique se os dados aparecem no dashboard em <code>/dashboard/lead-pago</code>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
