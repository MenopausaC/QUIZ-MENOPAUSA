"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CreateAppointmentDialog } from "./create-appointment-dialog"
import { EditAppointmentDialog } from "./edit-appointment-dialog"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay, startOfWeek, endOfWeek } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Plus, Copy, Calendar, Clock, User, Phone, Mail, X, CheckCircle, XCircle, RotateCcw, FileCheck } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

interface Appointment {
  id: string
  nome_paciente: string
  email_paciente: string
  telefone_paciente: string
  whatsapp: string
  data_agendamento: string
  horario_agendamento: string
  status: string
  tipo_consulta: string
  observacoes?: string
  valor_consulta?: number
  payment_status?: string
  created_at: string
}

// Horários disponíveis por dia
const AVAILABLE_TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30'
]

export default function AgendamentosTabContent() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [dayPopupOpen, setDayPopupOpen] = useState(false)
  const [popupDate, setPopupDate] = useState<Date | null>(null)
  const { toast } = useToast()

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      console.log('🔄 Buscando agendamentos...')
      
      const response = await fetch('/api/appointments', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('📊 Resposta da API:', result)

      if (result.success) {
        const appointmentsData = result.data || result.appointments || []
        console.log(`✅ ${appointmentsData.length} agendamentos carregados`)
        setAppointments(appointmentsData)
      } else {
        console.error('❌ Erro na resposta da API:', result.error)
        toast({
          title: "Erro",
          description: result.error || "Falha ao carregar agendamentos",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ Erro ao buscar agendamentos:", error)
      toast({
        title: "Erro",
        description: "Falha ao carregar agendamentos. Verifique a conexão.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  useEffect(() => {
    // Recarregar quando o mês mudar
    fetchAppointments()
  }, [currentDate])

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const handleDateClick = (date: Date) => {
    setPopupDate(date)
    setDayPopupOpen(true)
  }

  const handleCreateAppointment = (date?: Date) => {
    setSelectedDate(date || null)
    setCreateDialogOpen(true)
    setDayPopupOpen(false)
  }

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setEditDialogOpen(true)
    setDayPopupOpen(false)
  }

  const handleAppointmentCreated = () => {
    fetchAppointments()
    toast({
      title: "Sucesso",
      description: "Agendamento criado com sucesso!",
    })
  }

  const handleAppointmentUpdated = () => {
    fetchAppointments()
    toast({
      title: "Sucesso",
      description: "Agendamento atualizado com sucesso!",
    })
  }

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: appointmentId,
          status: newStatus
        })
      })

      if (response.ok) {
        await fetchAppointments()
        toast({
          title: "Status atualizado",
          description: `Agendamento marcado como ${getStatusLabel(newStatus)}`,
        })
      } else {
        throw new Error('Falha ao atualizar status')
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast({
        title: "Erro",
        description: "Falha ao atualizar status do agendamento",
        variant: "destructive",
      })
    }
  }

  const copySchedulingLink = async () => {
    const link = `${window.location.origin}/agendamento`
    
    try {
      // Primeiro, tenta focar no documento
      if (document.hasFocus && !document.hasFocus()) {
        window.focus()
      }
      
      // Tenta usar a API moderna do clipboard
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(link)
        toast({
          title: "Link copiado!",
          description: "Link de agendamento copiado para a área de transferência",
        })
      } else {
        // Fallback para navegadores mais antigos ou contextos não seguros
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
            toast({
              title: "Link copiado!",
              description: "Link de agendamento copiado para a área de transferência",
            })
          } else {
            throw new Error('Comando copy falhou')
          }
        } catch (err) {
          console.error('Fallback copy failed:', err)
          // Como último recurso, mostra o link para o usuário copiar manualmente
          toast({
            title: "Link de agendamento",
            description: link,
            duration: 10000,
          })
        } finally {
          document.body.removeChild(textArea)
        }
      }
    } catch (error) {
      console.error('Erro ao copiar link:', error)
      // Mostra o link para o usuário copiar manualmente
      toast({
        title: "Link de agendamento",
        description: link,
        duration: 10000,
      })
    }
  }

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    return appointments.filter((apt) => apt.data_agendamento === dateStr)
  }

  const getTodayAppointments = () => {
    const today = new Date()
    return getAppointmentsForDate(today)
  }

  const getAvailableSlotsForDate = (date: Date) => {
    const dayOfWeek = date.getDay()
    
    // Finais de semana não têm horários disponíveis
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return []
    }
    
    const dayAppointments = getAppointmentsForDate(date)
    const bookedSlots = dayAppointments.map(apt => apt.horario_agendamento)
    return AVAILABLE_TIME_SLOTS.filter(slot => !bookedSlots.includes(slot))
  }

  const isDateFullyBooked = (date: Date) => {
    const availableSlots = getAvailableSlotsForDate(date)
    const dayOfWeek = date.getDay()
    
    // Finais de semana são considerados indisponíveis, mas não "lotados"
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return false
    }
    
    return availableSlots.length === 0
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "aguardando_pagamento":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "agendado":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "confirmado":
        return "bg-green-100 text-green-800 border-green-200"
      case "realizado":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "cancelado":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case "aguardando_pagamento":
        return "Aguardando Pagamento"
      case "agendado":
        return "Agendado"
      case "confirmado":
        return "Confirmado"
      case "realizado":
        return "Realizado"
      case "cancelado":
        return "Cancelado"
      default:
        return status || "Indefinido"
    }
  }

  // Gerar apenas dias úteis (segunda a sábado) - removendo domingo
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }) // Segunda-feira
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  
  // Filtrar apenas segunda a sábado (1-6)
  const calendarDays = allDays.filter(day => {
    const dayOfWeek = day.getDay()
    return dayOfWeek >= 1 && dayOfWeek <= 6
  })

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
      <Tabs defaultValue="calendario" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendario">Calendário</TabsTrigger>
          <TabsTrigger value="hoje">Agendamentos de Hoje</TabsTrigger>
        </TabsList>

        <TabsContent value="calendario" className="space-y-6">
          {/* Estatísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">{appointments.length}</div>
                <div className="text-sm text-gray-600">Total de Agendamentos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {appointments.filter(a => a.status?.toLowerCase() === 'confirmado').length}
                </div>
                <div className="text-sm text-gray-600">Confirmados</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {appointments.filter(a => a.status?.toLowerCase() === 'aguardando_pagamento').length}
                </div>
                <div className="text-sm text-gray-600">Aguardando Pagamento</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {getTodayAppointments().length}
                </div>
                <div className="text-sm text-gray-600">Hoje</div>
              </CardContent>
            </Card>
          </div>

          {/* Header com controles */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-2xl font-bold">{format(currentDate, "MMMM yyyy", { locale: ptBR })}</h2>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex space-x-2">
              <Button onClick={() => handleCreateAppointment()} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Novo Agendamento
              </Button>
              <Button variant="outline" onClick={copySchedulingLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar Link
              </Button>
            </div>
          </div>

          {/* Legenda */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 rounded border border-green-200"></div>
              <span className="text-sm">Horários Disponíveis</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-100 rounded border border-yellow-200"></div>
              <span className="text-sm">Com Agendamentos</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-white rounded border-2 border-red-500"></div>
              <span className="text-sm">Agenda Lotada</span>
            </div>
          </div>

          {/* Calendário Grande - 6 colunas (Seg a Sáb) */}
          <Card>
            <CardContent className="p-6">
              {/* Cabeçalho dos dias da semana */}
              <div className="grid grid-cols-6 gap-2 mb-4">
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                  <div key={day} className="text-center font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Dias do calendário */}
              <div className="grid grid-cols-6 gap-2">
                {calendarDays.map((day) => {
                  const dayAppointments = getAppointmentsForDate(day)
                  const hasAppointments = dayAppointments.length > 0
                  const isToday = isSameDay(day, new Date())
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                  const availableSlots = getAvailableSlotsForDate(day)
                  const isFullyBooked = isDateFullyBooked(day)
                  const isWeekend = day.getDay() === 6 // Apenas sábado agora

                  return (
                    <div
                      key={day.toISOString()}
                      className={`
                      relative h-20 border rounded-lg cursor-pointer transition-all hover:shadow-md bg-white
                      ${isToday ? "border-blue-300 bg-blue-50" : "border-gray-200"}
                      ${!isCurrentMonth ? "text-gray-300" : ""}
                      ${hasAppointments && isCurrentMonth ? "bg-yellow-50" : ""}
                      ${isFullyBooked && isCurrentMonth ? "border-2 border-red-500" : ""}
                    `}
                      onClick={() => handleDateClick(day)}
                    >
                      {/* Número do dia */}
                      <div className="absolute top-1 right-2 text-sm font-medium">
                        {format(day, "d")}
                      </div>

                      {/* Indicador de disponibilidade */}
                      {isCurrentMonth && (
                        <div className="absolute top-1 left-2">
                          <div className={`w-2 h-2 rounded-full ${
                            isFullyBooked 
                              ? 'bg-red-500' 
                              : hasAppointments 
                                ? 'bg-yellow-500' 
                                : 'bg-green-500'
                          }`}></div>
                        </div>
                      )}

                      {/* Conteúdo do dia */}
                      {isCurrentMonth && (
                        <div className="mt-6 px-1 space-y-1">
                          {hasAppointments ? (
                            <>
                              {dayAppointments.slice(0, 1).map((appointment) => (
                                <div
                                  key={appointment.id}
                                  className="text-xs p-1 rounded border truncate bg-white border-gray-200"
                                >
                                  <div className="font-medium truncate">{appointment.horario_agendamento}</div>
                                  <div className="truncate text-gray-600">{appointment.nome_paciente}</div>
                                </div>
                              ))}
                              {dayAppointments.length > 1 && (
                                <div className="text-xs text-gray-500 text-center">+{dayAppointments.length - 1} mais</div>
                              )}
                            </>
                          ) : (
                            !isWeekend && (
                              <div className="text-xs text-green-600 text-center">
                                {availableSlots.length} horários
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hoje" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Agendamentos de Hoje - {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getTodayAppointments().length > 0 ? (
                <div className="space-y-4">
                  {getTodayAppointments()
                    .sort((a, b) => a.horario_agendamento.localeCompare(b.horario_agendamento))
                    .map((appointment) => (
                      <div
                        key={appointment.id}
                        className="p-6 border rounded-lg bg-white shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <Clock className="h-5 w-5 text-purple-600" />
                              <span className="font-semibold text-xl">{appointment.horario_agendamento}</span>
                              <Badge className={getStatusColor(appointment.status)}>
                                {getStatusLabel(appointment.status)}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="font-medium text-lg">{appointment.nome_paciente}</span>
                            </div>
                            
                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4" />
                                <span>{appointment.whatsapp || appointment.telefone_paciente}</span>
                              </div>
                              {appointment.email_paciente && (
                                <div className="flex items-center space-x-2">
                                  <Mail className="h-4 w-4" />
                                  <span>{appointment.email_paciente}</span>
                                </div>
                              )}
                            </div>

                            <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
                              {appointment.tipo_consulta}
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
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => handleStatusUpdate(appointment.id, 'confirmado')}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirmar Pagamento
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleStatusUpdate(appointment.id, 'cancelado')}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancelar
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => handleEditAppointment(appointment)}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reagendar
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-purple-600 border-purple-200 hover:bg-purple-50"
                            onClick={() => handleStatusUpdate(appointment.id, 'realizado')}
                          >
                            <FileCheck className="h-4 w-4 mr-2" />
                            Consulta Realizada
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Nenhum agendamento para hoje</p>
                  <Button 
                    onClick={() => handleCreateAppointment(new Date())}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Agendamento
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogos */}
      <CreateAppointmentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onAppointmentCreated={handleAppointmentCreated}
        initialDate={selectedDate || undefined}
      />

      {selectedAppointment && (
        <EditAppointmentDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          appointment={selectedAppointment}
          onAppointmentUpdated={handleAppointmentUpdated}
        />
      )}

      {/* Popup do Dia */}
      <Dialog open={dayPopupOpen} onOpenChange={setDayPopupOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>
                {popupDate && format(popupDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                {popupDate && ` - ${format(popupDate, "EEEE", { locale: ptBR })}`}
              </span>
            </DialogTitle>
          </DialogHeader>
          
          {popupDate && (
            <div className="space-y-4">
              {/* Estatísticas do dia */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {getAvailableSlotsForDate(popupDate).length}
                  </div>
                  <div className="text-sm text-gray-600">Horários Livres</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {getAppointmentsForDate(popupDate).length}
                  </div>
                  <div className="text-sm text-gray-600">Agendamentos</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {AVAILABLE_TIME_SLOTS.length}
                  </div>
                  <div className="text-sm text-gray-600">Total de Slots</div>
                </div>
              </div>

              {/* Agendamentos do dia */}
              {getAppointmentsForDate(popupDate).length > 0 ? (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Agendamentos do Dia</h3>
                  {getAppointmentsForDate(popupDate)
                    .sort((a, b) => a.horario_agendamento.localeCompare(b.horario_agendamento))
                    .map((appointment) => (
                      <div
                        key={appointment.id}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleEditAppointment(appointment)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span className="font-medium text-lg">{appointment.horario_agendamento}</span>
                              <Badge className={getStatusColor(appointment.status)}>
                                {getStatusLabel(appointment.status)}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{appointment.nome_paciente}</span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              {appointment.email_paciente && (
                                <div className="flex items-center space-x-1">
                                  <Mail className="h-3 w-3" />
                                  <span>{appointment.email_paciente}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3" />
                                <span>{appointment.whatsapp || appointment.telefone_paciente}</span>
                              </div>
                            </div>
                            {appointment.observacoes && (
                              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                {appointment.observacoes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Nenhum agendamento para este dia</p>
                </div>
              )}

              {/* Botão para criar agendamento */}
              {popupDate.getDay() !== 0 && popupDate.getDay() !== 6 && (
                <div className="flex justify-center pt-4 border-t">
                  <Button 
                    onClick={() => handleCreateAppointment(popupDate)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Agendamento
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
