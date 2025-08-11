"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Calendar, Clock, User } from "lucide-react"
import { format, parse } from "date-fns"
import { ptBR } from "date-fns/locale"

function SucessoContent() {
  const searchParams = useSearchParams()
  const dateParam = searchParams.get("data")
  const horarioParam = searchParams.get("horario")
  const nomeParam = searchParams.get("nome")

  const formatSelectedDateTime = () => {
    if (!dateParam || !horarioParam) return ""
    try {
      const date = parse(dateParam, "yyyy-MM-dd", new Date())
      return {
        data: format(date, "EEEE, dd 'de' MMMM", { locale: ptBR }),
        horario: horarioParam,
      }
    } catch {
      return {
        data: dateParam,
        horario: horarioParam,
      }
    }
  }

  const dateTime = formatSelectedDateTime()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="text-center pb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Agendamento Confirmado!</CardTitle>
            <p className="text-gray-600">Seu agendamento foi realizado com sucesso</p>
          </CardHeader>

          <CardContent className="p-6">
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Nome</p>
                  <p className="font-medium">{nomeParam || "Não informado"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Data</p>
                  <p className="font-medium capitalize">{dateTime.data}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Horário</p>
                  <p className="font-medium">{dateTime.horario}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Próximos Passos:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Você receberá uma confirmação em breve</li>
                <li>• Mantenha seu WhatsApp disponível</li>
                <li>• Chegue 10 minutos antes do horário</li>
              </ul>
            </div>

            <Button
              onClick={() => (window.location.href = "/")}
              className="w-full h-12 bg-purple-500 hover:bg-purple-600 text-white font-medium"
            >
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SucessoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-md mx-auto px-4">
            <Card className="shadow-lg border-0 bg-white">
              <CardContent className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Carregando...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      }
    >
      <SucessoContent />
    </Suspense>
  )
}
