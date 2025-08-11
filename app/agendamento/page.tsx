"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, Clock, User, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

interface FormData {
  nome: string
  email: string
  whatsapp: string
  observacoes: string
}

export default function AgendamentoPage() {
  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState('')
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingTimes, setLoadingTimes] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    whatsapp: '',
    observacoes: ''
  })

  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const dateToCheck = new Date(date)
    dateToCheck.setHours(0, 0, 0, 0)
    
    // Desabilitar datas passadas
    if (dateToCheck < today) return true
    
    // Desabilitar domingos (0 = domingo)
    if (date.getDay() === 0) return true
    
    return false
  }

  const loadAvailableTimes = async (date: Date) => {
    setLoadingTimes(true)
    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      const response = await fetch(`/api/horarios-disponiveis?data=${dateStr}`)
      const result = await response.json()
      
      if (result.success) {
        setAvailableTimes(result.horarios_disponiveis)
      } else {
        toast.error('Erro ao carregar horários disponíveis')
        setAvailableTimes([])
      }
    } catch (error) {
      console.error('Erro ao carregar horários:', error)
      toast.error('Erro ao carregar horários disponíveis')
      setAvailableTimes([])
    } finally {
      setLoadingTimes(false)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date && !isDateDisabled(date)) {
      setSelectedDate(date)
      setSelectedTime('')
      loadAvailableTimes(date)
    }
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório')
      return false
    }
    if (!formData.email.trim()) {
      toast.error('Email é obrigatório')
      return false
    }
    if (!formData.whatsapp.trim()) {
      toast.error('WhatsApp é obrigatório')
      return false
    }
    if (!selectedDate || !selectedTime) {
      toast.error('Selecione data e horário')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)

    try {
      const agendamentoData = {
        nome_paciente: formData.nome,
        telefone_paciente: formData.whatsapp,
        whatsapp: formData.whatsapp,
        email_paciente: formData.email,
        data_agendamento: format(selectedDate!, 'yyyy-MM-dd'),
        horario_agendamento: selectedTime,
        observacoes: formData.observacoes,
        valor_consulta: 150.00,
        status: 'AGUARDANDO_PAGAMENTO',
        tipo_consulta: 'CONSULTA_PAGA',
        origem: 'agendamento-direto'
      }

      const response = await fetch('/api/agendamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agendamentoData),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Agendamento criado:', result)
        
        toast.success('Agendamento realizado com sucesso!')
        setStep(4)
      } else {
        const errorData = await response.json()
        console.error('Erro ao criar agendamento:', errorData)
        
        if (response.status === 409) {
          toast.error('Este horário já foi ocupado. Por favor, escolha outro horário.')
          if (selectedDate) {
            loadAvailableTimes(selectedDate)
          }
          setStep(2)
        } else {
          toast.error(errorData.error || 'Erro ao agendar consulta')
        }
      }
    } catch (error) {
      console.error('Erro ao agendar consulta:', error)
      toast.error('Erro ao agendar consulta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Agendar Consulta
          </h1>
          <p className="text-gray-600">
            Escolha o melhor dia e horário para sua consulta
          </p>
          <div className="flex justify-center mt-4">
            <Badge className="bg-purple-100 text-purple-800">
              Consulta: R$ 150,00
            </Badge>
          </div>
        </div>

        {/* Indicador de progresso */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <div className={`w-12 h-1 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <div className={`w-12 h-1 ${step >= 3 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
          </div>
        </div>

        {/* Etapa 1: Dados Pessoais */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Seus Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Digite seu nome completo"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
              
              <div>
                <Label htmlFor="whatsapp">WhatsApp *</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div>
                <Label htmlFor="observacoes">Observações (opcional)</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  placeholder="Alguma informação adicional..."
                  rows={3}
                />
              </div>

              <Button 
                onClick={() => {
                  if (formData.nome && formData.email && formData.whatsapp) {
                    setStep(2)
                  } else {
                    toast.error('Preencha todos os campos obrigatórios')
                  }
                }}
                className="w-full"
              >
                Continuar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Etapa 2: Escolha da Data */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Escolha a Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={isDateDisabled}
                  initialFocus
                  className="rounded-md border"
                />
              </div>
              
              {selectedDate && (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      Data selecionada: {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>

                  {loadingTimes ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Carregando horários...</span>
                    </div>
                  ) : (
                    <>
                      <div>
                        <Label className="text-sm font-medium mb-3 block">
                          Horários Disponíveis ({availableTimes.length})
                        </Label>
                        {availableTimes.length > 0 ? (
                          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                            {availableTimes.map((time) => (
                              <Button
                                key={time}
                                variant={selectedTime === time ? "default" : "outline"}
                                onClick={() => handleTimeSelect(time)}
                                className="h-12"
                              >
                                {time}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>Nenhum horário disponível para esta data</p>
                            <p className="text-sm">Escolha outra data</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <Button 
                          variant="outline" 
                          onClick={() => setStep(1)}
                          className="flex-1"
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Voltar
                        </Button>
                        <Button 
                          onClick={() => setStep(3)}
                          disabled={!selectedTime}
                          className="flex-1"
                        >
                          Revisar
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Etapa 3: Confirmação */}
        {step === 3 && selectedDate && selectedTime && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Confirmar Agendamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Resumo do Agendamento:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nome:</span>
                      <span className="font-medium">{formData.nome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{formData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">WhatsApp:</span>
                      <span className="font-medium">{formData.whatsapp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data:</span>
                      <span className="font-medium">
                        {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Horário:</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valor:</span>
                      <span className="font-medium text-green-600">R$ 150,00</span>
                    </div>
                    {formData.observacoes && (
                      <div className="pt-2 border-t">
                        <span className="text-gray-600">Observações:</span>
                        <p className="text-sm mt-1">{formData.observacoes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Importante:</strong> Após confirmar, você receberá as instruções de pagamento 
                    por WhatsApp e email. Sua consulta será reservada por 24 horas.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(2)}
                  disabled={loading}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Confirmando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmar
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Etapa 4: Sucesso */}
        {step === 4 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-700 mb-2">
                  Agendamento Confirmado!
                </h2>
                <p className="text-gray-600">
                  Sua consulta foi agendada com sucesso.
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-green-800">
                  <strong>Próximos passos:</strong><br />
                  • Você receberá um WhatsApp com as instruções de pagamento<br />
                  • Após o pagamento, sua consulta estará confirmada<br />
                  • Lembre-se da data: {selectedDate && format(selectedDate, "dd/MM/yyyy")} às {selectedTime}
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={() => window.location.href = '/'}
                  className="w-full"
                >
                  Voltar ao Início
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setStep(1)
                    setSelectedDate(undefined)
                    setSelectedTime('')
                    setFormData({ nome: '', email: '', whatsapp: '', observacoes: '' })
                  }}
                  className="w-full"
                >
                  Fazer Novo Agendamento
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
