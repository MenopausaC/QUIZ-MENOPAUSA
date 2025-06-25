import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { mockMenopausaData, mockNovoQuestionarioData, countOccurrences } from "@/lib/mock-data"
import { Users, FileText, BarChart3, PieChartIcon } from "lucide-react"

export default function GeralTabContent() {
  const totalMenopausaRespostas = mockMenopausaData.length
  const totalNovoQuestionarioRespostas = mockNovoQuestionarioData.length
  const totalRespostasGeral = totalMenopausaRespostas + totalNovoQuestionarioRespostas

  const distribuicaoPorQuestionario = [
    { name: "Menopausa Cancelada", value: totalMenopausaRespostas, fill: "#8884d8" },
    { name: "Novo Questionário", value: totalNovoQuestionarioRespostas, fill: "#82ca9d" },
  ]

  // Exemplo de agregação: Urgência em resolver (Menopausa)
  const urgenciaMenopausa = countOccurrences(mockMenopausaData, "urgencia_resolver")
  // Exemplo de agregação: Satisfação (Novo Questionário)
  const satisfacaoNovo = countOccurrences(mockNovoQuestionarioData, "satisfacao_produto")

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
              {totalMenopausaRespostas} de Menopausa, {totalNovoQuestionarioRespostas} do Novo
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
              {totalMenopausaRespostas >= totalNovoQuestionarioRespostas ? "Menopausa Cancelada" : "Novo Questionário"}
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
            {/* Placeholder para Gráfico de Pizza */}
            <div className="text-center text-gray-500">
              <p className="text-lg font-semibold mb-2">Gráfico de Pizza (Simulado)</p>
              <ul className="list-disc list-inside text-left">
                {distribuicaoPorQuestionario.map((item) => (
                  <li key={item.name} style={{ color: item.fill }}>
                    {item.name}: {item.value} ({((item.value / totalRespostasGeral) * 100).toFixed(1)}%)
                  </li>
                ))}
              </ul>
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
            {/* Placeholder para Gráfico de Barras Comparativo */}
            <div className="text-center text-gray-500">
              <p className="text-lg font-semibold mb-2">Gráfico de Barras (Simulado)</p>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <h4 className="font-medium">Urgência (Menopausa):</h4>
                  <ul className="list-disc list-inside text-sm">
                    {Object.entries(urgenciaMenopausa).map(([key, value]) => (
                      <li key={key}>
                        {key}: {value}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium">Satisfação (Novo):</h4>
                  <ul className="list-disc list-inside text-sm">
                    {Object.entries(satisfacaoNovo).map(([key, value]) => (
                      <li key={key}>
                        {key}: {value}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
