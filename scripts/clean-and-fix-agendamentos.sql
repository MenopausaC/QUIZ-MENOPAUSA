-- Primeiro, vamos ver o que existe na tabela
SELECT 'Status existentes:' as info;
SELECT DISTINCT status, COUNT(*) as count 
FROM agendamentos 
GROUP BY status;

-- Limpar dados problemáticos
DELETE FROM agendamentos WHERE status IS NULL OR status = '';

-- Atualizar status inválidos para valores válidos
UPDATE agendamentos SET status = 'AGUARDANDO_PAGAMENTO' WHERE status NOT IN ('AGUARDANDO_PAGAMENTO', 'CONFIRMADO', 'AGENDADO', 'REALIZADO', 'CANCELADO');

-- Verificar se ainda há problemas
SELECT 'Status após limpeza:' as info;
SELECT DISTINCT status, COUNT(*) as count 
FROM agendamentos 
GROUP BY status;

-- Adicionar colunas faltantes uma por vez
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS email_paciente TEXT;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS telefone_paciente TEXT;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS data_agendamento DATE;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS horario_agendamento TIME;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS tipo_consulta TEXT DEFAULT 'PAGO';
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS origem TEXT DEFAULT 'site-agendamento';
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS valor_consulta DECIMAL(10,2) DEFAULT 150.00;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS observacoes TEXT;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS pagamento_confirmado BOOLEAN DEFAULT FALSE;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS payment_id TEXT;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS payment_status TEXT;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2);
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE;

-- Atualizar valores NULL para padrões
UPDATE agendamentos SET status = 'AGUARDANDO_PAGAMENTO' WHERE status IS NULL;
UPDATE agendamentos SET tipo_consulta = 'PAGO' WHERE tipo_consulta IS NULL;
UPDATE agendamentos SET origem = 'site-agendamento' WHERE origem IS NULL;
UPDATE agendamentos SET valor_consulta = 150.00 WHERE valor_consulta IS NULL;
UPDATE agendamentos SET pagamento_confirmado = FALSE WHERE pagamento_confirmado IS NULL;

-- Remover constraints existentes se houver
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS valid_status;
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS valid_tipo_consulta;

-- Adicionar constraints apenas após limpar os dados
ALTER TABLE agendamentos ADD CONSTRAINT valid_status CHECK (status IN ('AGUARDANDO_PAGAMENTO', 'CONFIRMADO', 'AGENDADO', 'REALIZADO', 'CANCELADO'));
ALTER TABLE agendamentos ADD CONSTRAINT valid_tipo_consulta CHECK (tipo_consulta IN ('PAGO', 'GRATUITO', 'RETORNO'));

-- Verificar estrutura final
SELECT 'Estrutura final da tabela:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'agendamentos' 
ORDER BY ordinal_position;
