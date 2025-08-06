"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Database, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface TestResult {
  name: string
  status: "success" | "error" | "warning"
  message: string
  data?: any
}

export default function TestDatabasePage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    setResults([])

    const tests: TestResult[] = []

    try {
      // Test 1: Environment Variables
      const envResponse = await fetch("/api/debug-supabase")
      const envData = await envResponse.json()

      tests.push({
        name: "Variáveis de Ambiente",
        status: envData.success ? "success" : "error",
        message: envData.success ? "Variáveis de ambiente configuradas corretamente" : envData.error,
        data: envData,
      })

      // Test 2: Database Connection
      const dbResponse = await fetch("/api/dashboard-data")
      const dbData = await dbResponse.json()

      tests.push({
        name: "Conexão com Banco",
        status: dbResponse.ok ? "success" : "error",
        message: dbResponse.ok
          ? `Conexão estabelecida. ${Array.isArray(dbData) ? dbData.length : 0} registros encontrados`
          : dbData.error || "Erro na conexão",
        data: Array.isArray(dbData) ? dbData.slice(0, 3) : null,
      })

      // Test 3: Metrics API
      const metricsResponse = await fetch("/api/dashboard-metrics")
      const metricsData = await metricsResponse.json()

      tests.push({
        name: "API de Métricas",
        status: metricsResponse.ok ? "success" : "warning",
        message: metricsResponse.ok ? "API de métricas funcionando" : "API de métricas com problemas (opcional)",
        data: metricsData,
      })

      // Test 4: Organic Leads
      const orgResponse = await fetch("/api/dashboard-data?type=ORGANICO")
      const orgData = await orgResponse.json()

      tests.push({
        name: "Leads Orgânicos",
        status: orgResponse.ok ? "success" : "error",
        message: orgResponse.ok
          ? `${Array.isArray(orgData) ? orgData.length : 0} leads orgânicos encontrados`
          : orgData.error || "Erro ao buscar leads orgânicos",
        data: Array.isArray(orgData) ? orgData.slice(0, 2) : null,
      })

      // Test 5: Paid Leads
      const paidResponse = await fetch("/api/dashboard-data?type=PAGO")
      const paidData = await paidResponse.json()

      tests.push({
        name: "Leads Pagos",
        status: paidResponse.ok ? "success" : "error",
        message: paidResponse.ok
          ? `${Array.isArray(paidData) ? paidData.length : 0} leads pagos encontrados`
          : paidData.error || "Erro ao buscar leads pagos",
        data: Array.isArray(paidData) ? paidData.slice(0, 2) : null,
      })
    } catch (error) {
      tests.push({
        name: "Erro Geral",
        status: "error",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      })
    }

    setResults(tests)
    setLoading(false)
  }

  useEffect(() => {
    runTests()
  }, [])

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: TestResult["status"]) => {
    const variants = {
      success: "default" as const,
      error: "destructive" as const,
      warning: "secondary" as const,
    }

    const labels = {
      success: "SUCESSO",
      error: "ERRO",
      warning: "AVISO",
    }

    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Teste de Banco de Dados
          </h1>
          <p className="text-muted-foreground">Verificação completa da conectividade e funcionalidade do banco</p>
        </div>
        <Button onClick={runTests} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Testando..." : "Executar Testes"}
        </Button>
      </div>

      <div className="grid gap-4">
        {results.map((result, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(result.status)}
                  {result.name}
                </CardTitle>
                {getStatusBadge(result.status)}
              </div>
              <CardDescription>{result.message}</CardDescription>
            </CardHeader>
            {result.data && (
              <CardContent>
                <details className="space-y-2">
                  <summary className="cursor-pointer text-sm font-medium">Ver dados retornados</summary>
                  <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo dos Testes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {results.filter((r) => r.status === "success").length}
                </div>
                <div className="text-sm text-muted-foreground">Sucessos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {results.filter((r) => r.status === "warning").length}
                </div>
                <div className="text-sm text-muted-foreground">Avisos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {results.filter((r) => r.status === "error").length}
                </div>
                <div className="text-sm text-muted-foreground">Erros</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
