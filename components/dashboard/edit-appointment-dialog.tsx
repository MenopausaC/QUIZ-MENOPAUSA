"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface Appointment {
  id: string
  nome: string
  telefone: string
  email: string
  data_agendamento: string
  horario: string
  status: string
  observacoes?: string
}

interface EditAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: Appointment
  onSuccess: () => void
}

export function EditAppointmentDialog({ 
  open, 
  onOpenChange, 
  appointment,
  onSuccess 
}: EditAppointmentDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    data_agendamento: '',
    horario: '',
    observacoes: ''
  })

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ]

  useEffect(() => {
    if (appointment) {
      setFormData({
        nome: appointment.nome,
        telefone: appointment.telefone,
        email: appointment.email,
        data_agendamento: appointment.data_agendamento,
        horario: appointment.horario,
        observacoes: appointment.observacoes || ''
      })
    }
  }, [appointment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/agendamentos', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: appointment.id,
          ...formData
        }),
      })

      if (response.ok) {
        toast.success('Agendamento atualizado com sucesso!')
        onSuccess()
        onOpenChange(false)
      } else {
        throw new Error('Erro ao atualizar agendamento')
      }
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error)
      toast.error('Erro ao atualizar agendamento')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Agendamento</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone/WhatsApp</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => handleInputChange('telefone', e.target.value)}
              placeholder="(11) 99999-9999"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_agendamento">Data</Label>
            <Input
              id="data_agendamento"
              type="date"
              value={formData.data_agendamento}
              onChange={(e) => handleInputChange('data_agendamento', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="horario">Horário</Label>
            <Select value={formData.horario} onValueChange={(value) => handleInputChange('horario', value)}>
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

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              placeholder="Observações adicionais..."
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
