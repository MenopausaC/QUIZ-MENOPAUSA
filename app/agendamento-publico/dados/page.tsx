"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserIcon, ArrowLeft, AlertCircle } from "lucide-react"
import { format, parse } from "date-fns"
import { ptBR } from "date-fns/locale"

function DadosContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    whatsapp: "",
  })

  const dateParam = searchParams.get("data")
  const horarioParam = searchParams.get("horario")

  useEffect(() => {
    if (!dateParam || !horarioParam) {
      router.push("/agendamento-publico/data")
    }
  }, [dateParam, horarioParam, router])

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    }
    return value
  }

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value)
    setFormData({ ...formData, whatsapp: formatted })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.nome.trim()) {
      setError("Por favor, digite seu nome completo.")
      return
    }

    if (!formData.whatsapp.trim()) {
      setError("Por favor, digite seu WhatsApp.")
      return
    }

    // Validar WhatsApp
    const whatsappNumbers = formData.whatsapp.replace(/\D/g, "")
    if (whatsappNumbers.length < 10 || whatsappNumbers.length > 11) {
      setError("Por favor, digite um número de WhatsApp válido.")
      return
    }

    setLoading(true)

    try {
      // Enviar diretamente via webhook
      const webhookUrl = "https://hook.us1.make.com/ibvli2ncgm8ii128jc5cknc6k8eixb3k"

      const webhookData = {
        tipo_evento: "NOVO_AGENDAMENTO",
        agendamento: {
          nome_paciente: formData.nome,
          telefone_paciente: whatsappNumbers,
          whatsapp: whatsappNumbers,
          data_agendamento: dateParam,
          horario_agendamento: horarioParam,
          status: "AGENDADO",
          tipo_consulta: "CONSULTA_PUBLICA",
          origem: "agendamento_publico",
          created_at: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
        source: "sistema_agendamento",
      }

      console.log("📤 Enviando webhook:", webhookData)

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookData),
      })

      if (response.ok) {
        console.log("✅ Webhook enviado com sucesso!")

        // Redirecionar para o link específico
        window.location.href = "https://hub.la/r/garanta-agora"
      } else {
        throw new Error("Erro ao enviar dados")
      }
    } catch (error) {
      console.error("❌ Erro ao enviar webhook:", error)
      setError("Erro ao confirmar agendamento. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const formatSelectedDateTime = () => {
    if (!dateParam || !horarioParam) return ""
    try {
      const date = parse(dateParam, "yyyy-MM-dd", new Date())
      return `${format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })} às ${horarioParam}`
    } catch {
      return `${dateParam} às ${horarioParam}`
    }
  }

  if (!dateParam || !horarioParam) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="text-center pb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/agendamento-publico/horario?data=${dateParam}`)}
              className="absolute left-4 top-4 h-8 w-8 p-0"
              disabled={loading}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500 rounded-full mb-4">
              <UserIcon className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Seus Dados</CardTitle>
            <p className="text-gray-600">{formatSelectedDateTime()}</p>
          </CardHeader>

          <CardContent className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Digite seu nome completo"
                  required
                  className="mt-1"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={handleWhatsAppChange}
                  placeholder="(11) 99999-9999"
                  required
                  className="mt-1"
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-purple-500 hover:bg-purple-600 text-white font-medium disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Confirmando...
                  </div>
                ) : (
                  "Confirmar Agendamento"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function DadosPage() {
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
      <DadosContent />
    </Suspense>
  )
}
