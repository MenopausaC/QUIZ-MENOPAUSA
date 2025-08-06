-- Primeiro, vamos ver quais status existem atualmente
SELECT DISTINCT status, COUNT(*) as count 
FROM agendamentos 
GROUP BY status;

-- Atualizar status inválidos para valores válidos
UPDATE agendamentos 
SET status = 'AGUARDANDO_PAGAMENTO' 
WHERE status IS NULL OR status = '';

UPDATE agendamentos 
SET status = 'CONFIRMADO' 
WHERE status = 'PAGO' OR status = 'PAID';

UPDATE agendamentos 
SET status = 'AGENDADO' 
WHERE status = 'SCHEDULED';

UPDATE agendamentos 
SET status = 'REALIZADO' 
WHERE status = 'COMPLETED' OR status = 'DONE';

UPDATE agendamentos 
SET status = 'CANCELADO' 
WHERE status = 'CANCELLED' OR status = 'CANCELED';

-- Verificar se ainda há status inválidos
SELECT DISTINCT status, COUNT(*) as count 
FROM agendamentos 
WHERE status NOT IN ('AGUARDANDO_PAGAMENTO', 'CONFIRMADO', 'AGENDADO', 'REALIZADO', 'CANCELADO')
GROUP BY status;

-- Adicionar colunas que podem estar faltando (sem erro se já existirem)
DO $$ 
BEGIN
    -- Adicionar coluna whatsapp
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agendamentos' AND column_name = 'whatsapp') THEN
        ALTER TABLE agendamentos ADD COLUMN whatsapp TEXT;
    END IF;
    
    -- Adicionar coluna email_paciente
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agendamentos' AND column_name = 'email_paciente') THEN
        ALTER TABLE agendamentos ADD COLUMN email_paciente TEXT;
    END IF;
    
    -- Adicionar coluna telefone_paciente
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agendamentos' AND column_name = 'telefone_paciente') THEN
        ALTER TABLE agendamentos ADD COLUMN telefone_paciente TEXT;
    END IF;
    
    -- Adicionar coluna data_agendamento
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agendamentos' AND column_name = 'data_agendamento') THEN
        ALTER TABLE agendamentos ADD COLUMN data_agendamento DATE;
    END IF;
    
    -- Adicionar coluna horario_agendamento
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agendamentos' AND column_name = 'horario_agendamento') THEN
        ALTER TABLE agendamentos ADD COLUMN horario_agendamento TIME;
    END IF;
    
    -- Adicionar coluna tipo_consulta
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agendamentos' AND column_name = 'tipo_consulta') THEN
        ALTER TABLE agendamentos ADD COLUMN tipo_consulta TEXT DEFAULT 'PAGO';
    END IF;
    
    -- Adicionar coluna origem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agendamentos' AND column_name = 'origem') THEN
        ALTER TABLE agendamentos ADD COLUMN origem TEXT DEFAULT 'site-agendamento';
    END IF;
    
    -- Adicionar coluna valor_consulta
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agendamentos' AND column_name = 'valor_consulta') THEN
        ALTER TABLE agendamentos ADD COLUMN valor_consulta DECIMAL(10,2) DEFAULT 150.00;
    END IF;
    
    -- Adicionar coluna observacoes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agendamentos' AND column_name = 'observacoes') THEN
        ALTER TABLE agendamentos ADD COLUMN observacoes TEXT;
    END IF;
    
    -- Adicionar coluna pagamento_confirmado
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agendamentos' AND column_name = 'pagamento_confirmado') THEN
        ALTER TABLE agendamentos ADD COLUMN pagamento_confirmado BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Adicionar coluna payment_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agendamentos' AND column_name = 'payment_id') THEN
        ALTER TABLE agendamentos ADD COLUMN payment_id TEXT;
    END IF;
    
    -- Adicionar coluna payment_status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agendamentos' AND column_name = 'payment_status') THEN
        ALTER TABLE agendamentos ADD COLUMN payment_status TEXT;
    END IF;
    
    -- Adicionar coluna payment_amount
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agendamentos' AND column_name = 'payment_amount') THEN
        ALTER TABLE agendamentos ADD COLUMN payment_amount DECIMAL(10,2);
    END IF;
    
    -- Adicionar coluna payment_date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agendamentos' AND column_name = 'payment_date') THEN
        ALTER TABLE agendamentos ADD COLUMN payment_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Atualizar valores padrão para colunas que podem estar NULL
UPDATE agendamentos SET status = 'AGUARDANDO_PAGAMENTO' WHERE status IS NULL;
UPDATE agendamentos SET tipo_consulta = 'PAGO' WHERE tipo_consulta IS NULL;
UPDATE agendamentos SET origem = 'site-agendamento' WHERE origem IS NULL;
UPDATE agendamentos SET valor_consulta = 150.00 WHERE valor_consulta IS NULL;
UPDATE agendamentos SET pagamento_confirmado = FALSE WHERE pagamento_confirmado IS NULL;

-- Agora adicionar os constraints (removendo primeiro se existirem)
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS valid_status;
ALTER TABLE agendamentos ADD CONSTRAINT valid_status CHECK (status IN ('AGUARDANDO_PAGAMENTO', 'CONFIRMADO', 'AGENDADO', 'REALIZADO', 'CANCELADO'));

ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS valid_tipo_consulta;
ALTER TABLE agendamentos ADD CONSTRAINT valid_tipo_consulta CHECK (tipo_consulta IN ('PAGO', 'GRATUITO', 'RETORNO'));

-- Verificar estrutura final
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'agendamentos' 
ORDER BY ordinal_position;
