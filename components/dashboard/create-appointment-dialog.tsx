"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface CreateAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  selectedDate?: Date
}

export function CreateAppointmentDialog({ 
  open, 
  onOpenChange, 
  onSuccess,
  selectedDate 
}: CreateAppointmentDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    data_agendamento: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
    horario: '',
    observacoes: ''
  })

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/agendamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status: 'pendente'
        }),
      })

      if (response.ok) {
        toast.success('Agendamento criado com sucesso!')
        onSuccess()
        onOpenChange(false)
        setFormData({
          nome: '',
          telefone: '',
          email: '',
          data_agendamento: '',
          horario: '',
          observacoes: ''
        })
      } else {
        throw new Error('Erro ao criar agendamento')
      }
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
      toast.error('Erro ao criar agendamento')
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
          <DialogTitle>Novo Agendamento</DialogTitle>
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
              {loading ? 'Criando...' : 'Criar Agendamento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
