"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { format, addDays, getDay, isBefore, startOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, Clock, User, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

// Horários disponíveis
const AVAILABLE_TIMES = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30'
]

interface FormData {
  nome: string
  whatsapp: string
  data: string
  horario: string
}

export default function AgendamentoPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    whatsapp: "",
    data: "",
    horario: ""
  })
  const [loading, setLoading] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const { toast } = useToast()

  // Gerar próximos 30 dias úteis (segunda a sexta)
  const getAvailableDates = () => {
    const dates = []
    let currentDate = new Date()
    let count = 0
    
    while (count < 30) {
      const dayOfWeek = getDay(currentDate)
      // Segunda a sexta (1-5)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        dates.push(new Date(currentDate))
        count++
      }
      currentDate = addDays(currentDate, 1)
    }
    
    return dates
  }

  // Filtrar datas do mês atual
  const getMonthDates = () => {
    const allDates = getAvailableDates()
    return allDates.filter(date => 
      date.getMonth() === currentMonth.getMonth() && 
      date.getFullYear() === currentMonth.getFullYear()
    )
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setFormData(prev => ({
      ...prev,
      data: format(date, "yyyy-MM-dd")
    }))
    // Avançar automaticamente para próxima etapa
    setTimeout(() => setCurrentStep(2), 300)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setFormData(prev => ({
      ...prev,
      horario: time
    }))
    // Avançar automaticamente para próxima etapa
    setTimeout(() => setCurrentStep(3), 300)
  }

  const handleInputChange = (field: string, value: string) => {
    if (field === 'whatsapp') {
      // Aplicar máscara do WhatsApp
      const cleaned = value.replace(/\D/g, '')
      let formatted = cleaned
      
      if (cleaned.length >= 11) {
        formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`
      } else if (cleaned.length >= 7) {
        formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
      } else if (cleaned.length >= 3) {
        formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
      } else if (cleaned.length >= 1) {
        formatted = `(${cleaned}`
      }
      
      setFormData(prev => ({ ...prev, [field]: formatted }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleSubmit = async () => {
    if (!formData.nome || !formData.whatsapp || !formData.data || !formData.horario) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      console.log('📤 Enviando dados do agendamento:', formData)

      // Enviar para webhook
      const webhookResponse = await fetch('/api/save-questionario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo: 'agendamento',
          nome_completo: formData.nome,
          whatsapp: formData.whatsapp,
          data_agendamento: formData.data,
          horario_agendamento: formData.horario,
          status: 'aguardando_pagamento',
          tipo_consulta: 'Consulta online de 30 minutos com especialista em menopausa',
          timestamp: new Date().toISOString()
        })
      })

      if (webhookResponse.ok) {
        console.log('✅ Agendamento enviado com sucesso')
        
        // Redirecionar para pagamento
        window.location.href = 'https://pay.hub.la/29aC1Gnpnjaf1HXV4JPF'
      } else {
        throw new Error('Falha no envio do agendamento')
      }

    } catch (error) {
      console.error('❌ Erro ao enviar agendamento:', error)
      toast({
        title: "Erro",
        description: "Falha ao processar agendamento. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePreviousMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(currentMonth.getMonth() - 1)
    setCurrentMonth(newMonth)
  }

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(currentMonth.getMonth() + 1)
    setCurrentMonth(newMonth)
  }

  const monthDates = getMonthDates()

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Agende sua Consulta</h1>
          <p className="text-gray-600">Consulta online de 30 minutos com especialista em menopausa</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep >= 1 ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              <Calendar className="h-5 w-5" />
            </div>
            <div className={`h-1 w-16 ${currentStep >= 2 ? 'bg-pink-500' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep >= 2 ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              <Clock className="h-5 w-5" />
            </div>
            <div className={`h-1 w-16 ${currentStep >= 3 ? 'bg-pink-500' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep >= 3 ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              <User className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Step 1: Date Selection */}
        {currentStep === 1 && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                <Calendar className="h-6 w-6 text-pink-500" />
                <span>Escolha a Data da Consulta</span>
              </CardTitle>
              <p className="text-gray-600">Selecione o dia que melhor se adequa à sua agenda</p>
            </CardHeader>
            <CardContent>
              {/* Navegação do mês */}
              <div className="flex items-center justify-between mb-6 p-4 bg-gray-100 rounded-lg">
                <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-lg font-semibold">
                  {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                </h3>
                <Button variant="outline" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Grid de datas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {monthDates.map((date) => (
                  <Card
                    key={date.toISOString()}
                    className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-pink-300"
                    onClick={() => handleDateSelect(date)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-gray-800">
                        {format(date, "dd")}
                      </div>
                      <div className="text-sm text-gray-600 capitalize">
                        {format(date, "EEE", { locale: ptBR })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center mt-6 text-sm text-gray-500">
                <Calendar className="h-4 w-4 inline mr-2" />
                Atendemos de segunda a sexta-feira
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Time Selection */}
        {currentStep === 2 && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                <Clock className="h-6 w-6 text-pink-500" />
                <span>Escolha o Horário</span>
              </CardTitle>
              <p className="text-gray-600">
                Selecione o melhor horário para {selectedDate && format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Badge variant="outline" className="text-pink-600 border-pink-200">
                  {selectedDate && format(selectedDate, "dd/MM/yyyy")}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {AVAILABLE_TIMES.map((time) => (
                  <Card
                    key={time}
                    className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-pink-300"
                    onClick={() => handleTimeSelect(time)}
                  >
                    <CardContent className="p-4 text-center">
                      <Clock className="h-5 w-5 mx-auto mb-2 text-pink-500" />
                      <div className="font-semibold text-gray-800">{time}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Personal Information */}
        {currentStep === 3 && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                <User className="h-6 w-6 text-pink-500" />
                <span>Confirme seus Dados</span>
              </CardTitle>
              <p className="text-gray-600">Últimas informações para finalizar seu agendamento</p>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </div>

              {/* Resumo do Agendamento */}
              <Card className="mb-6 bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-pink-500" />
                    <span>Resumo do Agendamento</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <Calendar className="h-8 w-8 text-pink-500 mx-auto mb-2" />
                      <div className="font-semibold">Data</div>
                      <div className="text-gray-600">
                        {selectedDate && format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </div>
                    </div>
                    <div className="text-center">
                      <Clock className="h-8 w-8 text-pink-500 mx-auto mb-2" />
                      <div className="font-semibold">Horário</div>
                      <div className="text-gray-600">{selectedTime}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Formulário */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    placeholder="Seu nome completo"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="whatsapp">WhatsApp *</Label>
                  <Input
                    id="whatsapp"
                    placeholder="(11) 99999-9999"
                    value={formData.whatsapp}
                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    maxLength={15}
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 text-lg"
                >
                  {loading ? "Processando..." : "Finalizar Agendamento"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
