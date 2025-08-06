-- Criar tabela de agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
    id BIGSERIAL PRIMARY KEY,
    data_agendamento DATE NOT NULL,
    horario_agendamento TIME NOT NULL,
    tipo_consulta VARCHAR(50) DEFAULT 'PAGO',
    status VARCHAR(50) DEFAULT 'AGENDADO',
    nome_paciente VARCHAR(255),
    email_paciente VARCHAR(255),
    telefone_paciente VARCHAR(50),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    questionario_data jsonb null, -- Coluna para dados do questionário
    constraint unique_agendamento_horario unique (data_agendamento, horario_agendamento)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);
CREATE INDEX IF NOT EXISTS idx_agendamentos_tipo ON agendamentos(tipo_consulta);

-- Habilitar RLS
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura e escrita para usuários anônimos (temporário para desenvolvimento)
CREATE POLICY "Permitir acesso total aos agendamentos" ON agendamentos
    FOR ALL USING (true);

-- Comentários na tabela
COMMENT ON TABLE agendamentos IS 'Tabela para gerenciar agendamentos de consultas';
COMMENT ON COLUMN agendamentos.data_agendamento IS 'Data do agendamento';
COMMENT ON COLUMN agendamentos.horario_agendamento IS 'Horário do agendamento';
COMMENT ON COLUMN agendamentos.tipo_consulta IS 'Tipo da consulta (PAGO, ORGANICO, etc.)';
COMMENT ON COLUMN agendamentos.status IS 'Status do agendamento (AGENDADO, CONFIRMADO, CANCELADO, REALIZADO)';
COMMENT ON COLUMN agendamentos.questionario_data IS 'Dados completos do questionário em formato JSONB';
