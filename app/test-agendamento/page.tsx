"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface TestResult {
  test: string
  status: "success" | "error" | "warning"
  message: string
  data?: any
}

export default function TestAgendamentoPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    setResults([])

    const tests: TestResult[] = []

    // Teste 1: Verificar API dashboard-data
    try {
      const response = await fetch("/api/dashboard-data")
      if (response.ok) {
        const data = await response.json()
        tests.push({
          test: "API Dashboard Data",
          status: "success",
          message: `API funcionando. Total de agendamentos: ${data.agendamentos?.totalAgendamentos || 0}`,
          data: data.agendamentos,
        })
      } else {
        tests.push({
          test: "API Dashboard Data",
          status: "error",
          message: `Erro HTTP: ${response.status}`,
        })
      }
    } catch (error: any) {
      tests.push({
        test: "API Dashboard Data",
        status: "error",
        message: `Erro: ${error.message}`,
      })
    }

    // Teste 2: Verificar estrutura de dados
    try {
      const response = await fetch("/api/dashboard-data")
      if (response.ok) {
        const data = await response.json()
        const agendamentos = data.agendamentos

        if (agendamentos && typeof agendamentos.totalAgendamentos === "number") {
          tests.push({
            test: "Estrutura de Dados",
            status: "success",
            message: "Estrutura de dados correta",
          })
        } else {
          tests.push({
            test: "Estrutura de Dados",
            status: "warning",
            message: "Estrutura de dados incompleta ou incorreta",
          })
        }
      }
    } catch (error: any) {
      tests.push({
        test: "Estrutura de Dados",
        status: "error",
        message: `Erro: ${error.message}`,
      })
    }

    // Teste 3: Verificar conexão Supabase
    try {
      const response = await fetch("/api/test-supabase-connection")
      if (response.ok) {
        const data = await response.json()
        tests.push({
          test: "Conexão Supabase",
          status: "success",
          message: "Conexão com Supabase funcionando",
        })
      } else {
        tests.push({
          test: "Conexão Supabase",
          status: "error",
          message: "Erro na conexão com Supabase",
        })
      }
    } catch (error: any) {
      tests.push({
        test: "Conexão Supabase",
        status: "warning",
        message: "Endpoint de teste não encontrado (normal se não existir)",
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

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800 border-green-200"
      case "error":
        return "bg-red-100 text-red-800 border-red-200"
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teste de Agendamentos</h1>
          <p className="text-gray-600 mt-2">Verificação do sistema de agendamentos</p>
        </div>
        <Button onClick={runTests} disabled={loading}>
          {loading ? "Testando..." : "Executar Testes"}
        </Button>
      </div>

      <div className="grid gap-4">
        {results.map((result, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {getStatusIcon(result.status)}
                {result.test}
                <Badge className={`border ${getStatusColor(result.status)}`}>{result.status.toUpperCase()}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{result.message}</p>

              {result.data && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Dados retornados:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Total:</span> {result.data.totalAgendamentos || 0}
                    </div>
                    <div>
                      <span className="font-medium">Agendados:</span> {result.data.statusCounts?.agendado || 0}
                    </div>
                    <div>
                      <span className="font-medium">Confirmados:</span> {result.data.statusCounts?.confirmado || 0}
                    </div>
                    <div>
                      <span className="font-medium">Realizados:</span> {result.data.statusCounts?.realizado || 0}
                    </div>
                  </div>

                  {result.data.listaAgendamentos && result.data.listaAgendamentos.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-medium mb-2">Últimos agendamentos:</h5>
                      <div className="space-y-2">
                        {result.data.listaAgendamentos.slice(0, 3).map((agendamento: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-sm bg-white p-2 rounded border">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{agendamento.nome_paciente}</span>
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>{agendamento.data_agendamento}</span>
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>{agendamento.horario_agendamento}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {results.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">Clique em "Executar Testes" para verificar o sistema</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
