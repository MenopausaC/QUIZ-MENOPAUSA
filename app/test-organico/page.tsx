"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestOrganico() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testarConexao = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-questionario-organico")
      const result = await response.json()
      setTestResult(result)
      console.log("Resultado do teste:", result)
    } catch (error) {
      console.error("Erro no teste:", error)
      setTestResult({
        success: false,
        error: "Erro ao executar teste",
        details: error,
      })
    } finally {
      setLoading(false)
    }
  }

  const testarQuestionarioCompleto = async () => {
    setLoading(true)
    try {
      // Simular dados completos do questionário
      const dadosCompletos = {
        nome: "Teste Questionário Completo",
        email: "teste.completo@email.com",
        telefone: "(11) 98765-4321",
        idade_faixa: "50 a 54",
        estado_residencia: "Sul",
        estado_civil: "Não",
        renda_mensal: "Ganho mais de 3 salários mínimos",
        fase_menopausa: "Climatério - Menstruando as vezes",
        principal_sintoma: "Insônia",
        intensidade_sintoma_principal: "Moderada",
        outros_sintomas_incomodam: "Cansaço constante",
        tempo_sintomas: "Entre 6 meses a 1 ano",
        impacto_sintomas_vida: "Significativamente - interfere bastante no meu dia a dia",
        urgencia_resolver: "Quero resolver em breve",
        fez_reposicao_hormonal: "Chás / manipulados / remédios caseiros",
        motivo_inscricao_evento: "Fiquei curiosa e quero saber mais",
        valor_disposto_pagar: "Posso investir no maximo R$ 1.000 parcelado",
        compra_online_experiencia: "Não",
        ja_conhecia: "Sim, a menos de 1 mês",
        qualificacao_lead: "AA",
        pontuacao_total: 18,
        categoria_sintomas: "Sintomas de média urgência identificados",
        urgencia_caso: "media",
        tipo_questionario: "ORGANICO",
        dispositivo: "desktop",
        origem: "teste-questionario-completo",
        versao_questionario: "3.4",
        tempo_total_questionario_ms: 180000,
        tempo_total_questionario_segundos: 180,
        tempo_total_questionario_minutos: 3,
        tempo_medio_resposta_ms: 9000,
        tempo_medio_resposta_segundos: 9,
        total_perguntas: 19,
        perguntas_respondidas: 19,
        taxa_completude: 100,
        engajamento: "MEDIO",
      }

      const response = await fetch("/api/save-questionario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosCompletos),
      })

      const result = await response.json()
      setTestResult(result)
      console.log("Resultado do teste completo:", result)
    } catch (error) {
      console.error("Erro no teste completo:", error)
      setTestResult({
        success: false,
        error: "Erro ao executar teste completo",
        details: error,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Teste do Questionário Orgânico - Supabase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={testarConexao} disabled={loading}>
                {loading ? "Testando..." : "Testar Conexão Básica"}
              </Button>
              <Button onClick={testarQuestionarioCompleto} disabled={loading} variant="outline">
                {loading ? "Testando..." : "Testar Questionário Completo"}
              </Button>
            </div>

            {testResult && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Resultado do Teste:</h3>
                <div
                  className={`p-4 rounded-lg ${
                    testResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div className="mb-2">
                    <strong>Status:</strong>{" "}
                    <span className={testResult.success ? "text-green-600" : "text-red-600"}>
                      {testResult.success ? "✅ Sucesso" : "❌ Erro"}
                    </span>
                  </div>
                  <div className="mb-2">
                    <strong>Mensagem:</strong> {testResult.message || testResult.error}
                  </div>
                  {testResult.data && (
                    <div className="mt-4">
                      <strong>Dados:</strong>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto max-h-96">
                        {JSON.stringify(testResult.data, null, 2)}
                      </pre>
                    </div>
                  )}
                  {testResult.details && (
                    <div className="mt-4">
                      <strong>Detalhes do Erro:</strong>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto max-h-96">
                        {JSON.stringify(testResult.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Instruções:</h4>
              <ol className="list-decimal list-inside space-y-1 text-blue-700">
                <li>Execute primeiro o script "reset-supabase-complete.sql" no SQL Editor do Supabase</li>
                <li>Depois execute o script "create-supabase-from-scratch.sql"</li>
                <li>Execute o script "verify-supabase-setup.sql" para verificar</li>
                <li>Clique em "Testar Conexão Básica" para verificar se está funcionando</li>
                <li>Clique em "Testar Questionário Completo" para simular um envio real</li>
                <li>Verifique a tabela "questionarios" no Supabase para ver os dados</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
