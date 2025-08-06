"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, Loader2, Database, Trash2 } from 'lucide-react'

export default function TestAgendamentosPage() {
  const [loading, setLoading] = useState(false)
  const [cleaning, setCleaning] = useState(false)
  const [results, setResults] = useState<any>(null)

  const runTests = async () => {
    setLoading(true)
    setResults(null)

    try {
      const response = await fetch("/api/test-agendamentos")
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Erro ao executar testes:", error)
      setResults({
        success: false,
        error: "Erro ao executar testes",
        details: error
      })
    } finally {
      setLoading(false)
    }
  }

  const cleanTestData = async () => {
    setCleaning(true)

    try {
      const response = await fetch("/api/test-agendamentos", {
        method: "POST"
      })
      const data = await response.json()
      
      if (data.success) {
        alert("Dados de teste limpos com sucesso!")
        setResults(null)
      } else {
        alert("Erro ao limpar dados: " + data.error)
      }
    } catch (error) {
      console.error("Erro ao limpar dados:", error)
      alert("Erro ao limpar dados de teste")
    } finally {
      setCleaning(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teste da Tabela Agendamentos</h1>
          <p className="text-gray-600 mt-2">
            Verificar se o cadastramento na tabela agendamentos do Supabase está funcionando
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={runTests}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Executar Testes
              </>
            )}
          </Button>

          {results && (
            <Button
              onClick={cleanTestData}
              disabled={cleaning}
              variant="outline"
            >
              {cleaning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Limpando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Dados de Teste
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {results && (
        <div className="space-y-6">
          {/* Status Geral */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {results.success ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                <span>Status Geral</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge 
                  variant={results.success ? "default" : "destructive"}
                  className="text-sm"
                >
                  {results.success ? "✅ TODOS OS TESTES PASSARAM" : "❌ FALHA NOS TESTES"}
                </Badge>
                <p className="text-gray-600">{results.message}</p>
                
                {results.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                    <h4 className="font-semibold text-red-800">Erro:</h4>
                    <p className="text-red-700">{results.error}</p>
                    {results.details && (
                      <pre className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded overflow-auto">
                        {JSON.stringify(results.details, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resultados dos Testes */}
          {results.tests && (
            <Card>
              <CardHeader>
                <CardTitle>Resultados dos Testes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(results.tests).map(([test, status]) => (
                    <div key={test} className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-sm">
                        {status as string}
                      </Badge>
                      <span className="capitalize">{test.replace(/([A-Z])/g, ' $1')}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dados de Teste */}
          {results.data && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Registro Inserido */}
              {results.data.insertedRecord && (
                <Card>
                  <CardHeader>
                    <CardTitle>Registro Inserido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div><strong>ID:</strong> {results.data.insertedRecord.id}</div>
                      <div><strong>Nome:</strong> {results.data.insertedRecord.nome_paciente}</div>
                      <div><strong>Email:</strong> {results.data.insertedRecord.email_paciente}</div>
                      <div><strong>Telefone:</strong> {results.data.insertedRecord.telefone_paciente}</div>
                      <div><strong>Data:</strong> {results.data.insertedRecord.data_agendamento}</div>
                      <div><strong>Horário:</strong> {results.data.insertedRecord.horario_agendamento}</div>
                      <div><strong>Status:</strong> 
                        <Badge className="ml-2">{results.data.insertedRecord.status}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Registro Atualizado */}
              {results.data.updatedRecord && (
                <Card>
                  <CardHeader>
                    <CardTitle>Registro Atualizado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div><strong>ID:</strong> {results.data.updatedRecord.id}</div>
                      <div><strong>Status:</strong> 
                        <Badge className="ml-2">{results.data.updatedRecord.status}</Badge>
                      </div>
                      <div><strong>Observações:</strong></div>
                      <div className="bg-gray-50 p-2 rounded text-xs">
                        {results.data.updatedRecord.observacoes}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Estatísticas */}
          {results.data?.statistics && (
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas da Tabela</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Por Status</h4>
                    <div className="space-y-2">
                      {Object.entries(results.data.statistics.byStatus).map(([status, count]) => (
                        <div key={status} className="flex justify-between items-center">
                          <Badge variant="outline">{status}</Badge>
                          <span className="font-mono">{count as number}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Por Tipo</h4>
                    <div className="space-y-2">
                      {Object.entries(results.data.statistics.byType).map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center">
                          <Badge variant="outline">{type}</Badge>
                          <span className="font-mono">{count as number}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!results && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Pronto para Testar
            </h3>
            <p className="text-gray-500 mb-4">
              Clique em "Executar Testes" para verificar se a tabela agendamentos está funcionando corretamente
            </p>
            <Button onClick={runTests} className="bg-blue-600 hover:bg-blue-700">
              <Database className="h-4 w-4 mr-2" />
              Executar Testes
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
