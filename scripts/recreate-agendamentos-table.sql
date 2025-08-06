-- Remover tabela existente se houver
DROP TABLE IF EXISTS agendamentos CASCADE;

-- Criar tabela agendamentos com estrutura completa
CREATE TABLE agendamentos (
    id SERIAL PRIMARY KEY,
    nome_paciente VARCHAR(255) NOT NULL,
    email_paciente VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(20) NOT NULL,
    telefone_paciente VARCHAR(20),
    data_agendamento DATE NOT NULL,
    horario_agendamento TIME NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'AGUARDANDO_PAGAMENTO',
    tipo_consulta VARCHAR(50) NOT NULL DEFAULT 'PAGO',
    origem VARCHAR(100) DEFAULT 'site-agendamento',
    valor_consulta DECIMAL(10,2) DEFAULT 150.00,
    observacoes TEXT,
    pagamento_confirmado BOOLEAN DEFAULT FALSE,
    payment_id VARCHAR(255),
    payment_status VARCHAR(50),
    payment_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_status CHECK (status IN (
        'AGUARDANDO_PAGAMENTO', 
        'CONFIRMADO', 
        'CANCELADO', 
        'REALIZADO', 
        'NAO_COMPARECEU'
    )),
    CONSTRAINT valid_tipo_consulta CHECK (tipo_consulta IN (
        'PAGO', 
        'GRATUITO', 
        'RETORNO'
    )),
    CONSTRAINT unique_appointment UNIQUE (data_agendamento, horario_agendamento)
);

-- Criar índices para melhor performance
CREATE INDEX idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX idx_agendamentos_status ON agendamentos(status);
CREATE INDEX idx_agendamentos_email ON agendamentos(email_paciente);
CREATE INDEX idx_agendamentos_whatsapp ON agendamentos(whatsapp);
CREATE INDEX idx_agendamentos_created_at ON agendamentos(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública (para o dashboard)
CREATE POLICY "Allow public read access" ON agendamentos
    FOR SELECT USING (true);

-- Política para permitir inserção pública (para agendamentos)
CREATE POLICY "Allow public insert access" ON agendamentos
    FOR INSERT WITH CHECK (true);

-- Política para permitir atualização pública (para webhooks de pagamento)
CREATE POLICY "Allow public update access" ON agendamentos
    FOR UPDATE USING (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_agendamentos_updated_at 
    BEFORE UPDATE ON agendamentos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir alguns dados de teste
INSERT INTO agendamentos (
    nome_paciente, 
    email_paciente, 
    whatsapp, 
    data_agendamento, 
    horario_agendamento, 
    status,
    tipo_consulta,
    valor_consulta
) VALUES 
(
    'Maria Silva', 
    'maria@email.com', 
    '11999999999', 
    CURRENT_DATE + INTERVAL '1 day', 
    '10:00:00', 
    'CONFIRMADO',
    'PAGO',
    150.00
),
(
    'Ana Santos', 
    'ana@email.com', 
    '11888888888', 
    CURRENT_DATE + INTERVAL '2 days', 
    '14:30:00', 
    'AGUARDANDO_PAGAMENTO',
    'PAGO',
    150.00
);

-- Verificar se a tabela foi criada corretamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'agendamentos' 
ORDER BY ordinal_position;

-- Verificar dados inseridos
SELECT * FROM agendamentos ORDER BY created_at DESC;
