"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { countOccurrences, type LeadMenopausaData } from "@/lib/mock-data" // Atualizado o import
import { Users, FileText, BarChart3, PieChartIcon, Loader2 } from "lucide-react"

export default function GeralTabContent() {
  const [allLeads, setAllLeads] = useState<LeadMenopausaData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/dashboard-data")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: LeadMenopausaData[] = await response.json()
        setAllLeads(data)
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    }
    fetchLeads()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <p className="ml-2 text-purple-500">Carregando dados...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>Erro ao carregar dados: {error}</p>
        <p>Por favor, verifique sua conexão com o Supabase e as políticas de RLS.</p>
      </div>
    )
  }

  const totalRespostasGeral = allLeads.length
  const menopausaLeads = allLeads.filter((lead) => lead.tipo_questionario === "ORGANICO")
  const novoQuestionarioLeads = allLeads.filter((lead) => lead.tipo_questionario === "PAGO")

  const totalMenopausaRespostas = menopausaLeads.length
  const totalNovoQuestionarioRespostas = novoQuestionarioLeads.length

  const distribuicaoPorQuestionario = [
    { name: "Menopausa Cancelada (Orgânico)", value: totalMenopausaRespostas, fill: "#7B2CBF" },
    { name: "Lead Pago", value: totalNovoQuestionarioRespostas, fill: "#B682E0" },
  ]

  // Exemplo de agregação: Urgência em resolver (Menopausa)
  const urgenciaMenopausa = countOccurrences(menopausaLeads, "urgencia_resolver")
  // Exemplo de agregação: Satisfação (Novo Questionário - usando um campo fictício para demonstração)
  // Você precisaria de um campo real para "satisfacao_produto" na sua tabela leads_menopausa
  const satisfacaoNovo = countOccurrences(novoQuestionarioLeads, "satisfacao_produto") // Assumindo que 'satisfacao_produto' existe na tabela para leads pagos

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Respostas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRespostasGeral}</div>
            <p className="text-xs text-muted-foreground">
              {totalMenopausaRespostas} de Orgânico, {totalNovoQuestionarioRespostas} de Pago
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questionário Mais Preenchido</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalMenopausaRespostas >= totalNovoQuestionarioRespostas ? "Orgânico" : "Pago"}
            </div>
            <p className="text-xs text-muted-foreground">
              Com {Math.max(totalMenopausaRespostas, totalNovoQuestionarioRespostas)} respostas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              Distribuição de Respostas por Questionário
            </CardTitle>
            <CardDescription>Visualização da proporção de respostas entre os questionários.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col justify-center items-center">
            <div className="text-center text-gray-500">
              <p className="text-lg font-semibold mb-2">Gráfico de Pizza (Simulado)</p>
              {totalRespostasGeral > 0 ? (
                <ul className="list-disc list-inside text-left">
                  {distribuicaoPorQuestionario.map((item) => (
                    <li key={item.name} style={{ color: item.fill }}>
                      {item.name}: {item.value} ({((item.value / totalRespostasGeral) * 100).toFixed(1)}%)
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nenhum dado disponível para exibir.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Comparativo de Engajamento (Exemplo)
            </CardTitle>
            <CardDescription>Comparativo de uma métrica chave, como "Urgência" vs "Satisfação".</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col justify-center items-center">
            <div className="text-center text-gray-500">
              <p className="text-lg font-semibold mb-2">Gráfico de Barras (Simulado)</p>
              {totalRespostasGeral > 0 ? (
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <h4 className="font-medium">Urgência (Orgânico):</h4>
                    <ul className="list-disc list-inside text-sm">
                      {Object.entries(urgenciaMenopausa).map(([key, value]) => (
                        <li key={key}>
                          {key}: {value}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium">Satisfação (Pago):</h4>
                    <ul className="list-disc list-inside text-sm">
                      {Object.entries(satisfacaoNovo).map(([key, value]) => (
                        <li key={key}>
                          {key}: {value}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p>Nenhum dado disponível para exibir.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
