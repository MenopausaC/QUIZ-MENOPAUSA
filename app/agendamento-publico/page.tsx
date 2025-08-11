"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function AgendamentoPublicoPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar automaticamente para a primeira etapa
    router.replace("/agendamento-publico/data")
  }, [router])

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [showForm, setShowForm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    whatsapp: "",
  })

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      setShowForm(true)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDate || !formData.nome.trim() || !formData.whatsapp.trim()) {
      alert("Por favor, preencha todos os campos obrigatórios")
      return
    }

    setLoading(true)

    try {
      const agendamentoData = {
        nome_paciente: formData.nome.trim(),
        telefone_paciente: formData.whatsapp.trim(),
        email_paciente: `${formData.nome.toLowerCase().replace(/\s+/g, "")}@temp.com`,
        data_agendamento: format(selectedDate, "yyyy-MM-dd"),
        horario_agendamento: "09:00",
        tipo_consulta: "Consulta Ginecológica",
        status: "AGENDADO",
        valor_consulta: 150.0,
        observacoes: "Agendamento via página pública",
      }

      const response = await fetch("/api/agendamentos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(agendamentoData),
      })

      if (response.ok) {
        setShowSuccess(true)
        setShowForm(false)
      } else {
        const errorData = await response.json()
        alert(`Erro ao agendar consulta: ${errorData.error || "Erro desconhecido"}`)
      }
    } catch (error) {
      console.error("Erro ao agendar consulta:", error)
      alert("Erro ao agendar consulta. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSelectedDate(undefined)
    setShowForm(false)
    setShowSuccess(false)
    setFormData({ nome: "", whatsapp: "" })
  }

  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return date < today || date.getDay() === 0
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="p-6 sm:p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Agendamento Confirmado!</h2>
              <p className="text-gray-600 text-sm sm:text-base">Sua consulta foi agendada com sucesso</p>
            </div>

            <div className="space-y-3 mb-6 text-left bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Paciente:</span>
                <span className="text-right">{formData.nome}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">WhatsApp:</span>
                <span className="text-right">{formData.whatsapp}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Data:</span>
                <span className="text-right">
                  {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : ""}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Horário:</span>
                <span className="text-right">09:00</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-gray-600">Você receberá uma confirmação via WhatsApp em breve.</p>
              <Button onClick={handleReset} className="w-full">
                Fazer Novo Agendamento
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecionando para agendamento...</p>
      </div>
    </div>
  )
}
