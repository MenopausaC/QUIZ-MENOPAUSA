-- Limpar tabela existente se houver
DROP TABLE IF EXISTS agendamentos CASCADE;

-- Criar tabela de agendamentos
CREATE TABLE agendamentos (
    id BIGSERIAL PRIMARY KEY,
    nome_paciente VARCHAR(255) NOT NULL,
    telefone_paciente VARCHAR(20) NOT NULL,
    whatsapp VARCHAR(20),
    email_paciente VARCHAR(255),
    data_agendamento DATE NOT NULL,
    horario_agendamento TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'AGUARDANDO_PAGAMENTO' CHECK (status IN (
        'AGUARDANDO_PAGAMENTO',
        'CONFIRMADO',
        'CANCELADO',
        'REALIZADO',
        'NAO_COMPARECEU'
    )),
    tipo_consulta VARCHAR(20) DEFAULT 'PAGO' CHECK (tipo_consulta IN ('PAGO', 'GRATUITO')),
    origem VARCHAR(50) DEFAULT 'site',
    valor_consulta DECIMAL(10,2) DEFAULT 150.00,
    observacoes TEXT,
    pagamento_confirmado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para otimização
CREATE INDEX idx_agendamentos_data_horario ON agendamentos(data_agendamento, horario_agendamento);
CREATE INDEX idx_agendamentos_status ON agendamentos(status);
CREATE INDEX idx_agendamentos_telefone ON agendamentos(telefone_paciente);
CREATE INDEX idx_agendamentos_created_at ON agendamentos(created_at DESC);

-- Criar constraint única para evitar conflitos de horário (exceto cancelados)
CREATE UNIQUE INDEX idx_agendamentos_unique_slot 
ON agendamentos(data_agendamento, horario_agendamento) 
WHERE status != 'CANCELADO';

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_agendamentos_updated_at ON agendamentos;
CREATE TRIGGER update_agendamentos_updated_at
    BEFORE UPDATE ON agendamentos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Permitir leitura pública de agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Permitir inserção pública de agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Permitir atualização pública de agendamentos" ON agendamentos;

-- Política para permitir leitura pública
CREATE POLICY "Permitir leitura pública de agendamentos"
ON agendamentos FOR SELECT
USING (true);

-- Política para permitir inserção pública
CREATE POLICY "Permitir inserção pública de agendamentos"
ON agendamentos FOR INSERT
WITH CHECK (true);

-- Política para permitir atualização pública
CREATE POLICY "Permitir atualização pública de agendamentos"
ON agendamentos FOR UPDATE
USING (true);

-- Inserir alguns dados de exemplo para teste
INSERT INTO agendamentos (
    nome_paciente,
    telefone_paciente,
    whatsapp,
    data_agendamento,
    horario_agendamento,
    status,
    tipo_consulta,
    origem,
    valor_consulta,
    observacoes
) VALUES 
(
    'Maria Silva Santos',
    '(11) 99999-1111',
    '(11) 99999-1111',
    CURRENT_DATE + INTERVAL '1 day',
    '09:00',
    'CONFIRMADO',
    'PAGO',
    'site',
    150.00,
    'Primeira consulta - Teste do sistema'
),
(
    'Ana Costa Oliveira',
    '(11) 99999-2222',
    '(11) 99999-2222',
    CURRENT_DATE + INTERVAL '2 days',
    '14:30',
    'AGUARDANDO_PAGAMENTO',
    'PAGO',
    'site',
    150.00,
    'Agendamento via site - Teste'
),
(
    'Joana Pereira Lima',
    '(11) 99999-3333',
    '(11) 99999-3333',
    CURRENT_DATE + INTERVAL '3 days',
    '10:00',
    'CONFIRMADO',
    'PAGO',
    'indicacao',
    150.00,
    'Paciente indicada - Retorno'
)
ON CONFLICT DO NOTHING;

-- Verificar se a tabela foi criada corretamente
SELECT 
    'Tabela agendamentos criada com sucesso!' as status,
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
ORDER BY ordinal_position;

-- Mostrar índices criados
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'agendamentos';

-- Mostrar políticas RLS
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'agendamentos';

COMMIT;
