"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, Phone, Mail, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { toast } from 'sonner'

interface TimeSlot {
  time: string
  available: boolean
}

export default function AgendamentoPage() {
  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    observacoes: ''
  })

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ]

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate)
    }
  }, [selectedDate])

  const fetchAvailableSlots = async (date: Date) => {
    try {
      const dateStr = date.toISOString().split('T')[0]
      const response = await fetch(`/api/agendamentos?date=${dateStr}`)
      
      if (response.ok) {
        const appointments = await response.json()
        const bookedTimes = appointments.map((apt: any) => apt.horario)
        
        const slots = timeSlots.map(time => ({
          time,
          available: !bookedTimes.includes(time)
        }))
        
        setAvailableSlots(slots)
      }
    } catch (error) {
      console.error('Erro ao buscar horários:', error)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // Ajustar para começar na segunda-feira
    const mondayStartOffset = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1
    for (let i = 0; i < mondayStartOffset; i++) {
      days.push(null)
    }
    
    // Adicionar todos os dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dayOfWeek = date.getDay()
      // Apenas adicionar dias úteis (Segunda a Sábado)
      if (dayOfWeek >= 1 && dayOfWeek <= 6) {
        days.push(date)
      }
    }
    
    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime('')
    setStep(2)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setStep(3)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    return value
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    handleInputChange('telefone', formatted)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const appointmentData = {
        ...formData,
        data_agendamento: selectedDate?.toISOString().split('T')[0],
        horario: selectedTime,
        status: 'pendente'
      }

      const response = await fetch('/api/agendamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      })

      if (response.ok) {
        toast.success('Agendamento realizado com sucesso!')
        // Redirecionar para página de pagamento
        window.location.href = '/pagamento-confirmado'
      } else {
        throw new Error('Erro ao criar agendamento')
      }
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
      toast.error('Erro ao realizar agendamento')
    } finally {
      setLoading(false)
    }
  }

  const days = getDaysInMonth(currentMonth)
  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Agendar Consulta
          </h1>
          <p className="text-gray-600">
            Escolha a data e horário para sua consulta
          </p>
        </div>

        {/* Indicador de Progresso */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
              {step > 1 ? <Check className="h-4 w-4" /> : '1'}
            </div>
            <div className={`h-1 w-16 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
              {step > 2 ? <Check className="h-4 w-4" /> : '2'}
            </div>
            <div className={`h-1 w-16 ${step >= 3 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
          </div>
        </div>

        {/* Etapa 1: Seleção de Data */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Escolha uma Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <Button variant="outline" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-xl font-semibold">
                  {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </h3>
                <Button variant="outline" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-6 gap-2 mb-4">
                {weekDays.map(day => (
                  <div key={day} className="p-2 text-center font-medium text-gray-600">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-6 gap-2">
                {days.map((day, index) => {
                  if (!day) {
                    return <div key={index} className="p-2 h-12"></div>
                  }

                  const isToday = day.toDateString() === new Date().toDateString()
                  const isPast = day < new Date()

                  return (
                    <Button
                      key={index}
                      variant={isToday ? "default" : "outline"}
                      className={`h-12 ${isPast ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-50'}`}
                      onClick={() => !isPast && handleDateSelect(day)}
                      disabled={isPast}
                    >
                      {day.getDate()}
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Etapa 2: Seleção de Horário */}
        {step === 2 && selectedDate && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Escolha um Horário
              </CardTitle>
              <p className="text-sm text-gray-600">
                Data selecionada: {selectedDate.toLocaleDateString('pt-BR')}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={slot.available ? "outline" : "secondary"}
                    className={`h-12 ${!slot.available ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-50'}`}
                    onClick={() => slot.available && handleTimeSelect(slot.time)}
                    disabled={!slot.available}
                  >
                    {slot.time}
                  </Button>
                ))}
              </div>

              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Voltar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Etapa 3: Dados Pessoais */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Seus Dados
              </CardTitle>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>📅 {selectedDate?.toLocaleDateString('pt-BR')}</span>
                <span>🕐 {selectedTime}</span>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone/WhatsApp *</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={handlePhoneChange}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => handleInputChange('observacoes', e.target.value)}
                    placeholder="Alguma observação importante..."
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setStep(2)}>
                    Voltar
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Agendando...' : 'Confirmar Agendamento'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
