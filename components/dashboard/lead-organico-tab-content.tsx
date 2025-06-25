"use client"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { mockMenopausaData, countOccurrences } from "@/lib/mock-data"
import { BarChart3, PieChartIcon, Users, ExternalLink, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function LeadOrganicoTabContent() {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const totalRespostas = mockMenopausaData.length
  const faseMenopausaCounts = countOccurrences(mockMenopausaData, "fase_menopausa")
  const principalSintomaCounts = countOccurrences(mockMenopausaData, "principal_sintoma")
  const idadeFaixaCounts = countOccurrences(mockMenopausaData, "idade_faixa")

  const pieDataFaseMenopausa = Object.entries(faseMenopausaCounts).map(([name, value], index) => ({
    name,
    value,
    fill: ["#7B2CBF", "#B682E0", "#EEDCFF", "#442066"][index % 4], // Purple palette
  }))

  const barDataPrincipalSintoma = Object.entries(principalSintomaCounts).map(([name, value]) => ({
    name,
    count: value,
  }))

  const questionarioUrl = typeof window !== "undefined" ? `${window.location.origin}/quiz/organico` : "/quiz/organico"

  const copyLink = () => {
    navigator.clipboard
      .writeText(questionarioUrl)
      .then(() => {
        setCopied(true)
        toast({
          title: "Link Copiado!",
          description: "O link do questionário de Lead Orgânico foi copiado para sua área de transferência.",
        })
        setTimeout(() => setCopied(false), 2000)
      })
      .catch((err) => {
        console.error("Falha ao copiar o link: ", err)
        toast({
          title: "Erro ao Copiar",
          description: "Não foi possível copiar o link.",
          variant: "destructive",
        })
      })
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Questionário: Lead Orgânico</h2>
          <p className="text-slate-500 dark:text-slate-400">Análise de dados do questionário de menopausa.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={copyLink} variant="outline" className="bg-white dark:bg-slate-700">
            {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
            Copiar Link
          </Button>
          <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
            <Link href="/quiz/organico" target="_blank" rel="noopener noreferrer">
              Acessar Questionário <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg border-l-4 border-purple-500 dark:bg-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">Total de Respostas</CardTitle>
            <Users className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800 dark:text-white">{totalRespostas}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Participantes únicos</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-l-4 border-purple-500 dark:bg-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Sintoma Principal Mais Comum
            </CardTitle>
            <BarChart3 className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800 dark:text-white">
              {Object.keys(principalSintomaCounts).length > 0
                ? Object.entries(principalSintomaCounts).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
                : "N/A"}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Sintoma mais relatado</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-l-4 border-purple-500 dark:bg-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Faixa Etária Predominante
            </CardTitle>
            <Users className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800 dark:text-white">
              {Object.keys(idadeFaixaCounts).length > 0
                ? Object.entries(idadeFaixaCounts).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
                : "N/A"}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Maior grupo de respondentes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-slate-700 dark:text-slate-200">
              <PieChartIcon className="h-6 w-6 text-purple-600" />
              Fase da Menopausa
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Distribuição das respondentes por fase da menopausa.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex flex-col justify-center items-center p-6">
            <div className="text-center text-slate-500 dark:text-slate-400 w-full">
              <p className="text-lg font-semibold mb-4">Gráfico de Pizza (Simulado)</p>
              <ul className="list-disc list-inside text-left space-y-1">
                {pieDataFaseMenopausa.map((item) => (
                  <li key={item.name} className="flex items-center">
                    <span
                      className="inline-block w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.fill }}
                    ></span>
                    {item.name}: {item.value} ({((item.value / totalRespostas) * 100).toFixed(1)}%)
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-slate-700 dark:text-slate-200">
              <BarChart3 className="h-6 w-6 text-purple-600" />
              Principais Sintomas Relatados
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Frequência de cada sintoma principal informado.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex flex-col justify-center items-center p-6">
            <div className="text-center text-slate-500 dark:text-slate-400 w-full">
              <p className="text-lg font-semibold mb-4">Gráfico de Barras (Simulado)</p>
              <ul className="list-none text-left space-y-2 w-full">
                {barDataPrincipalSintoma.map((item) => (
                  <li key={item.name} className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-slate-600 dark:text-slate-300">{item.name}</span>
                      <span className="text-slate-500 dark:text-slate-400">{item.count}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                      <div
                        className="bg-purple-500 h-3 rounded-full"
                        style={{
                          width: `${(item.count / Math.max(1, ...barDataPrincipalSintoma.map((i) => i.count))) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
