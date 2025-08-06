-- Recriar tabela de agendamentos completamente sem constraints NOT NULL problemáticas
BEGIN;

-- Fazer backup dos dados existentes se houver
CREATE TABLE IF NOT EXISTS agendamentos_backup AS 
SELECT * FROM agendamentos;

DROP TABLE IF EXISTS agendamentos CASCADE;

CREATE TABLE agendamentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_paciente TEXT NOT NULL,
    telefone_paciente TEXT,
    whatsapp TEXT,
    email_paciente TEXT,
    data_agendamento DATE NOT NULL,
    horario_agendamento TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'AGENDADO',
    tipo_consulta TEXT NOT NULL DEFAULT 'CONSULTA_PAGA',
    observacoes TEXT,
    valor_consulta DECIMAL(10,2) DEFAULT 150.00,
    payment_id TEXT,
    payment_status TEXT DEFAULT 'AGUARDANDO_PAGAMENTO',
    qualificacao_lead TEXT DEFAULT 'qualificado',
    origem TEXT DEFAULT 'site',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint para garantir pelo menos um contato
    CONSTRAINT check_contact_info CHECK (
        telefone_paciente IS NOT NULL OR 
        whatsapp IS NOT NULL OR 
        email_paciente IS NOT NULL
    ),
    
    -- Constraint para status válidos
    CONSTRAINT check_status CHECK (
        status IN ('AGENDADO', 'CONFIRMADO', 'REALIZADO', 'CANCELADO', 'AGUARDANDO_PAGAMENTO')
    ),
    
    -- Constraint para tipo de consulta
    CONSTRAINT check_tipo_consulta CHECK (
        tipo_consulta IN ('CONSULTA_PAGA', 'CONSULTA_GRATUITA', 'RETORNO')
    )
);

-- Índices para performance
CREATE INDEX idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX idx_agendamentos_status ON agendamentos(status);
CREATE INDEX idx_agendamentos_created_at ON agendamentos(created_at);
CREATE INDEX idx_agendamentos_nome ON agendamentos(nome_paciente);
CREATE INDEX idx_agendamentos_tipo ON agendamentos(tipo_consulta);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agendamentos_updated_at 
    BEFORE UPDATE ON agendamentos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (permitir acesso público para a API)
CREATE POLICY "Allow read access for authenticated users" ON agendamentos
    FOR SELECT USING (true);

CREATE POLICY "Allow insert for authenticated users" ON agendamentos
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users" ON agendamentos
    FOR UPDATE USING (true);

-- Inserir dados de exemplo
INSERT INTO agendamentos (
    nome_paciente, 
    whatsapp,
    data_agendamento, 
    horario_agendamento, 
    status,
    tipo_consulta,
    origem
) VALUES 
('Maria Silva', '11999999999', '2024-01-20', '09:00', 'AGENDADO', 'CONSULTA_PAGA', 'site'),
('Ana Santos', '11888888888', '2024-01-21', '10:30', 'CONFIRMADO', 'CONSULTA_PAGA', 'site'),
('Carla Lima', '11777777777', '2024-01-22', '14:00', 'REALIZADO', 'CONSULTA_PAGA', 'site');

-- Verificar se tudo foi criado corretamente
SELECT 
    'Tabela criada com sucesso!' as status,
    COUNT(*) as total_registros
FROM agendamentos;

-- Mostrar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'agendamentos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Mostrar constraints
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'agendamentos'::regclass;

COMMIT;

-- Inserir dados de teste
INSERT INTO agendamentos (
    nome_paciente, 
    whatsapp, 
    data_agendamento, 
    horario_agendamento,
    status,
    tipo_consulta
) VALUES 
('Maria Silva', '11999999999', '2024-01-20', '09:00', 'AGENDADO', 'CONSULTA_PAGA'),
('Ana Santos', '11888888888', '2024-01-21', '10:00', 'CONFIRMADO', 'CONSULTA_PAGA'),
('Carla Lima', '11777777777', '2024-01-22', '14:00', 'REALIZADO', 'CONSULTA_PAGA');

-- Verificar dados inseridos
SELECT COUNT(*) as total_agendamentos FROM agendamentos;
SELECT * FROM agendamentos ORDER BY created_at DESC;
