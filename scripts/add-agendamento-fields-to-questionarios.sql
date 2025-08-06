-- Adicionar campos de agendamento na tabela questionarios
ALTER TABLE public.questionarios 
ADD COLUMN IF NOT EXISTS data_agendamento DATE,
ADD COLUMN IF NOT EXISTS horario_agendamento TIME,
ADD COLUMN IF NOT EXISTS status_agendamento VARCHAR(50) DEFAULT 'agendado',
ADD COLUMN IF NOT EXISTS observacoes_agendamento TEXT;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_questionarios_data_agendamento ON public.questionarios(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_questionarios_status_agendamento ON public.questionarios(status_agendamento);

-- Comentários para documentação
COMMENT ON COLUMN public.questionarios.data_agendamento IS 'Data do agendamento da consulta';
COMMENT ON COLUMN public.questionarios.horario_agendamento IS 'Horário do agendamento da consulta';
COMMENT ON COLUMN public.questionarios.status_agendamento IS 'Status do agendamento: agendado, confirmado, cancelado, realizado';
COMMENT ON COLUMN public.questionarios.observacoes_agendamento IS 'Observações sobre o agendamento';
