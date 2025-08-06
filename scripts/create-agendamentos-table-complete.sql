-- Recriar tabela de agendamentos com estrutura corrigida
DROP TABLE IF EXISTS agendamentos CASCADE;

CREATE TABLE agendamentos (
    id BIGSERIAL PRIMARY KEY,
    nome_paciente TEXT NOT NULL,
    telefone_paciente TEXT, -- Permitir NULL
    whatsapp TEXT, -- Permitir NULL
    email_paciente TEXT, -- Permitir NULL
    data_agendamento DATE NOT NULL,
    horario_agendamento TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'AGUARDANDO_PAGAMENTO',
    tipo_consulta TEXT DEFAULT 'PAGO',
    valor_consulta DECIMAL(10,2) DEFAULT 150.00,
    origem TEXT DEFAULT 'site',
    observacoes TEXT,
    pagamento_confirmado BOOLEAN DEFAULT FALSE,
    payment_status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_status CHECK (status IN ('AGENDADO', 'CONFIRMADO', 'CANCELADO', 'AGUARDANDO_PAGAMENTO', 'REALIZADO')),
    CONSTRAINT valid_tipo_consulta CHECK (tipo_consulta IN ('GRATUITO', 'PAGO')),
    CONSTRAINT valid_payment_status CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'CANCELLED')),
    CONSTRAINT unique_appointment UNIQUE (data_agendamento, horario_agendamento),
    -- Garantir que pelo menos um contato esteja preenchido
    CONSTRAINT check_contact_info CHECK (
        (telefone_paciente IS NOT NULL AND telefone_paciente != '') 
        OR 
        (whatsapp IS NOT NULL AND whatsapp != '')
    )
);

-- Índices para performance
CREATE INDEX idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX idx_agendamentos_status ON agendamentos(status);
CREATE INDEX idx_agendamentos_created_at ON agendamentos(created_at);
CREATE INDEX idx_agendamentos_data_horario ON agendamentos(data_agendamento, horario_agendamento);
CREATE INDEX idx_agendamentos_whatsapp ON agendamentos(whatsapp);

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
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (permitir acesso público para a API)
CREATE POLICY "Permitir leitura pública" ON agendamentos FOR SELECT USING (true);
CREATE POLICY "Permitir inserção pública" ON agendamentos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização pública" ON agendamentos FOR UPDATE USING (true);

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
('Maria Silva', '11999999999', '2024-01-20', '09:00', 'AGENDADO', 'PAGO', 'site'),
('Ana Santos', '11888888888', '2024-01-21', '10:30', 'CONFIRMADO', 'PAGO', 'site'),
('Carla Lima', '11777777777', '2024-01-22', '14:00', 'AGUARDANDO_PAGAMENTO', 'PAGO', 'site');

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
