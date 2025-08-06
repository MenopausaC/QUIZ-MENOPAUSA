-- Corrigir estrutura da tabela agendamentos para permitir NULL em campos opcionais
BEGIN;

-- Remover constraints NOT NULL de campos opcionais
ALTER TABLE agendamentos ALTER COLUMN telefone_paciente DROP NOT NULL;
ALTER TABLE agendamentos ALTER COLUMN email_paciente DROP NOT NULL;
ALTER TABLE agendamentos ALTER COLUMN whatsapp DROP NOT NULL;
ALTER TABLE agendamentos ALTER COLUMN observacoes DROP NOT NULL;
ALTER TABLE agendamentos ALTER COLUMN valor_consulta DROP NOT NULL;
ALTER TABLE agendamentos ALTER COLUMN payment_id DROP NOT NULL;
ALTER TABLE agendamentos ALTER COLUMN payment_status DROP NOT NULL;

-- Adicionar constraint para garantir pelo menos um contato
ALTER TABLE agendamentos 
ADD CONSTRAINT check_contact_info 
CHECK (
  telefone_paciente IS NOT NULL OR 
  whatsapp IS NOT NULL OR 
  email_paciente IS NOT NULL
);

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);
CREATE INDEX IF NOT EXISTS idx_agendamentos_created_at ON agendamentos(created_at);

COMMIT;

-- Verificar estrutura
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'agendamentos' 
ORDER BY ordinal_position;
