"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from 'lucide-react'
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface CreateAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAppointmentCreated: () => void
  initialDate?: Date
}

export function CreateAppointmentDialog({
  open,
  onOpenChange,
  onAppointmentCreated,
  initialDate
}: CreateAppointmentDialogProps) {
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate)
  const [formData, setFormData] = useState({
    nome_paciente: "",
    telefone_paciente: "",
    whatsapp: "",
    email_paciente: "",
    horario_agendamento: "",
    status: "AGENDADO",
    tipo_consulta: "CONSULTA_PAGA",
    observacoes: "",
    valor_consulta: "150.00"
  })

  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedDate) {
      toast({
        title: "Erro",
        description: "Selecione uma data para o agendamento",
        variant: "destructive",
      })
      return
    }

    if (!formData.nome_paciente || !formData.horario_agendamento) {
      toast({
        title: "Erro",
        description: "Nome e horário são obrigatórios",
        variant: "destructive",
      })
      return
    }

    if (!formData.telefone_paciente && !formData.whatsapp && !formData.email_paciente) {
      toast({
        title: "Erro",
        description: "Pelo menos uma forma de contato é obrigatória",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const appointmentData = {
        ...formData,
        data_agendamento: format(selectedDate, "yyyy-MM-dd"),
        valor_consulta: parseFloat(formData.valor_consulta) || 150.00,
        whatsapp: formData.whatsapp || formData.telefone_paciente
      }

      console.log('📝 Enviando dados do agendamento:', appointmentData)

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Agendamento criado com sucesso!",
        })
        onAppointmentCreated()
        onOpenChange(false)
        // Reset form
        setFormData({
          nome_paciente: "",
          telefone_paciente: "",
          whatsapp: "",
          email_paciente: "",
          horario_agendamento: "",
          status: "AGENDADO",
          tipo_consulta: "CONSULTA_PAGA",
          observacoes: "",
          valor_consulta: "150.00"
        })
        setSelectedDate(undefined)
      } else {
        throw new Error(result.error || 'Erro ao criar agendamento')
      }
    } catch (error) {
      console.error('❌ Erro ao criar agendamento:', error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar agendamento",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00"
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Agendamento</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar um novo agendamento.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Data */}
          <div className="space-y-2">
            <Label htmlFor="data">Data do Agendamento *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Horário */}
          <div className="space-y-2">
            <Label htmlFor="horario">Horário *</Label>
            <Select
              value={formData.horario_agendamento}
              onValueChange={(value) => setFormData(prev => ({ ...prev, horario_agendamento: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um horário" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Paciente *</Label>
            <Input
              id="nome"
              value={formData.nome_paciente}
              onChange={(e) => setFormData(prev => ({ ...prev, nome_paciente: e.target.value }))}
              placeholder="Nome completo"
              required
            />
          </div>

          {/* Contatos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone_paciente}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone_paciente: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email_paciente}
              onChange={(e) => setFormData(prev => ({ ...prev, email_paciente: e.target.value }))}
              placeholder="email@exemplo.com"
            />
          </div>

          {/* Status e Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AGENDADO">Agendado</SelectItem>
                  <SelectItem value="CONFIRMADO">Confirmado</SelectItem>
                  <SelectItem value="AGUARDANDO_PAGAMENTO">Aguardando Pagamento</SelectItem>
                  <SelectItem value="REALIZADO">Realizado</SelectItem>
                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Consulta</Label>
              <Select
                value={formData.tipo_consulta}
                onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_consulta: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONSULTA_PAGA">Consulta Paga</SelectItem>
                  <SelectItem value="CONSULTA_GRATUITA">Consulta Gratuita</SelectItem>
                  <SelectItem value="RETORNO">Retorno</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="valor">Valor da Consulta (R$)</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              value={formData.valor_consulta}
              onChange={(e) => setFormData(prev => ({ ...prev, valor_consulta: e.target.value }))}
              placeholder="150.00"
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
              {loading ? "Criando..." : "Criar Agendamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
