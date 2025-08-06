"use client"

import { useState, useEffect } from 'react'
import { Calendar, Clock, User, Phone, Mail, ChevronLeft, ChevronRight, Plus, CheckCircle, XCircle, RotateCcw, FileCheck, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface Appointment {
  id: string
  nome: string
  telefone: string
  email: string
  data_agendamento: string
  horario: string
  status: 'pendente' | 'confirmado' | 'cancelado' | 'realizado'
  observacoes?: string
  valor?: number
  created_at: string
}

export default function AgendamentosTabContent() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [loading, setLoading] = useState(true)
  const [showDateDetails, setShowDateDetails] = useState(false)
  const [selectedDateForDetails, setSelectedDateForDetails] = useState<Date | null>(null)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/agendamentos')
      if (response.ok) {
        const data = await response.json()
        setAppointments(data)
      }
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateAppointmentStatus = async (id: string, status: string) => {
    try {
      const response = await fetch('/api/agendamentos', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      })

      if (response.ok) {
        await fetchAppointments()
        toast.success(`Status atualizado para: ${getStatusText(status)}`)
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast.error('Erro ao atualizar status')
    }
  }

  const copySchedulingLink = async () => {
    const link = `${window.location.origin}/agendamento`
    
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(link)
        toast.success('Link de agendamento copiado!')
      } else {
        // Fallback para navegadores mais antigos
        const textArea = document.createElement('textarea')
        textArea.value = link
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        try {
          const successful = document.execCommand('copy')
          if (successful) {
            toast.success('Link de agendamento copiado!')
          } else {
            throw new Error('Comando copy falhou')
          }
        } catch (err) {
          console.error('Fallback copy failed:', err)
          toast.error('Erro ao copiar link')
        } finally {
          document.body.removeChild(textArea)
        }
      }
    } catch (error) {
      console.error('Erro ao copiar link:', error)
      toast.error('Erro ao copiar link')
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
    
    // Ajustar para começar na segunda-feira (0 = Sunday, 1 = Monday, etc.)
    const mondayStartOffset = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1
    for (let i = 0; i < mondayStartOffset; i++) {
      days.push(null)
    }
    
    // Adicionar todos os dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getAppointmentsForDate = (date: Date | null) => {
    if (!date) return []
    const dateStr = date.toISOString().split('T')[0]
    return appointments.filter(apt => apt.data_agendamento === dateStr)
  }

  const getTodayAppointments = () => {
    const today = new Date().toISOString().split('T')[0]
    return appointments.filter(apt => apt.data_agendamento === today)
      .sort((a, b) => a.horario.localeCompare(b.horario))
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelado': return 'bg-red-100 text-red-800 border-red-200'
      case 'realizado': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmado': return 'Confirmado'
      case 'cancelado': return 'Cancelado'
      case 'realizado': return 'Realizado'
      default: return 'Pendente'
    }
  }

  const handleDateClick = (date: Date) => {
    setSelectedDateForDetails(date)
    setShowDateDetails(true)
  }

  const days = getDaysInMonth(currentMonth)
  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2">Carregando agendamentos...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="today">Agendamentos de Hoje</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Calendário de Agendamentos</h2>
            <div className="flex gap-2">
              <Button onClick={copySchedulingLink} variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Copiar Link
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Agendamento
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Cabeçalho dos dias da semana - 6 colunas (Seg a Sáb) */}
              <div className="grid grid-cols-6 gap-1 mb-4">
                {weekDays.map(day => (
                  <div key={day} className="p-2 text-center font-medium text-sm text-gray-600">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Grid do calendário - 6 colunas (sem domingo) */}
              <div className="grid grid-cols-6 gap-1">
                {days.map((day, index) => {
                  if (!day) {
                    return <div key={index} className="p-2 h-20"></div>
                  }
                  
                  const dayAppointments = getAppointmentsForDate(day)
                  const isToday = day.toDateString() === new Date().toDateString()
                  const hasAppointments = dayAppointments.length > 0
                  const isFull = dayAppointments.length >= 8 // Assumindo 8 slots por dia
                  
                  return (
                    <div
                      key={index}
                      className={`
                        p-2 h-20 bg-white border cursor-pointer transition-colors hover:bg-gray-50
                        ${isToday ? 'border-blue-500 border-2' : 'border-gray-200'}
                        ${isFull ? 'border-red-500 border-2' : ''}
                      `}
                      onClick={() => handleDateClick(day)}
                    >
                      <div className="text-sm font-medium">{day.getDate()}</div>
                      {hasAppointments && (
                        <div className="mt-1">
                          <div className="text-xs text-blue-600">
                            {dayAppointments.length} agendamento{dayAppointments.length > 1 ? 's' : ''}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Agendamentos de Hoje</h2>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {getTodayAppointments().length} agendamentos
            </Badge>
          </div>

          <div className="grid gap-4">
            {getTodayAppointments().length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum agendamento para hoje</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              getTodayAppointments().map((appointment) => (
                <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-purple-600" />
                            <span className="font-semibold text-xl">{appointment.horario}</span>
                          </div>
                          <Badge className={getStatusColor(appointment.status)}>
                            {getStatusText(appointment.status)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-lg">{appointment.nome}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            <span>{appointment.telefone}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            <span>{appointment.email}</span>
                          </div>
                        </div>
                        
                        {appointment.observacoes && (
                          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded border-l-4 border-blue-200">
                            <strong>Observações:</strong> {appointment.observacoes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                      {appointment.status === 'pendente' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => updateAppointmentStatus(appointment.id, 'confirmado')}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Confirmar Pagamento
                        </Button>
                      )}
                      
                      {(appointment.status === 'pendente' || appointment.status === 'confirmado') && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => updateAppointmentStatus(appointment.id, 'cancelado')}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reagendar
                      </Button>
                      
                      {appointment.status === 'confirmado' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-purple-600 border-purple-200 hover:bg-purple-50"
                          onClick={() => updateAppointmentStatus(appointment.id, 'realizado')}
                        >
                          <FileCheck className="h-4 w-4 mr-2" />
                          Consulta Realizada
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog de detalhes do dia */}
      <Dialog open={showDateDetails} onOpenChange={setShowDateDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Agendamentos - {selectedDateForDetails?.toLocaleDateString('pt-BR')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDateForDetails && getAppointmentsForDate(selectedDateForDetails).length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Nenhum agendamento para esta data</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Agendamento
                </Button>
              </div>
            ) : (
              selectedDateForDetails && getAppointmentsForDate(selectedDateForDetails).map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{appointment.nome}</span>
                          <Badge className={getStatusColor(appointment.status)}>
                            {getStatusText(appointment.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{appointment.horario}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{appointment.telefone}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{appointment.email}</span>
                          </div>
                        </div>
                        {appointment.observacoes && (
                          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {appointment.observacoes}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
