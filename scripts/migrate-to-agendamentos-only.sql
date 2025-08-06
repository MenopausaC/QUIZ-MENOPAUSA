-- Migrar dados da tabela questionarios para agendamentos e excluir questionarios
-- Este script centraliza tudo na tabela agendamentos

-- 1. Primeiro, vamos migrar os dados importantes da tabela questionarios para agendamentos
INSERT INTO agendamentos (
  nome_paciente,
  email_cadastro,
  whatsapp,
  data_agendamento,
  horario_agendamento,
  status,
  tipo_consulta,
  origem,
  respostas_questionario,
  created_at
)
SELECT 
  nome_completo as nome_paciente,
  email as email_cadastro,
  telefone as whatsapp,
  CASE 
    WHEN data_agendamento IS NOT NULL THEN data_agendamento
    ELSE CURRENT_DATE + INTERVAL '7 days'
  END as data_agendamento,
  CASE 
    WHEN horario_agendamento IS NOT NULL THEN horario_agendamento
    ELSE '09:00'
  END as horario_agendamento,
  CASE 
    WHEN status_pagamento = 'PAGO' THEN 'CONFIRMADO'
    WHEN data_agendamento IS NOT NULL THEN 'AGENDADO'
    ELSE 'LEAD'
  END as status,
  CASE 
    WHEN status_pagamento = 'PAGO' THEN 'PAGO'
    ELSE 'GRATUITO'
  END as tipo_consulta,
  'questionario-migrado' as origem,
  jsonb_build_object(
    'respostas', respostas,
    'qualificacao', qualificacao,
    'tipo_questionario', tipo_questionario
  ) as respostas_questionario,
  created_at
FROM questionarios
WHERE NOT EXISTS (
  SELECT 1 FROM agendamentos a 
  WHERE a.email_cadastro = questionarios.email 
  OR a.whatsapp = questionarios.telefone
);

-- 2. Atualizar a estrutura da tabela agendamentos se necessário
ALTER TABLE agendamentos 
ADD COLUMN IF NOT EXISTS observacoes TEXT,
ADD COLUMN IF NOT EXISTS valor_consulta DECIMAL(10,2) DEFAULT 97.00,
ADD COLUMN IF NOT EXISTS forma_pagamento VARCHAR(50),
ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50);

-- 3. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_agendamentos_email ON agendamentos(email_cadastro);
CREATE INDEX IF NOT EXISTS idx_agendamentos_whatsapp ON agendamentos(whatsapp);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);
CREATE INDEX IF NOT EXISTS idx_agendamentos_created_at ON agendamentos(created_at);

-- 4. Atualizar as políticas RLS para a tabela agendamentos
DROP POLICY IF EXISTS "Enable read access for all users" ON agendamentos;
DROP POLICY IF EXISTS "Enable insert for all users" ON agendamentos;
DROP POLICY IF EXISTS "Enable update for all users" ON agendamentos;

CREATE POLICY "Enable read access for all users" ON agendamentos FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON agendamentos FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON agendamentos FOR UPDATE USING (true);

-- 5. Excluir a tabela questionarios após migração
DROP TABLE IF EXISTS questionarios CASCADE;

-- 6. Criar função para contar registros
CREATE OR REPLACE FUNCTION count_agendamentos_by_status()
RETURNS TABLE(status_name TEXT, count_value BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.status::TEXT as status_name,
    COUNT(*)::BIGINT as count_value
  FROM agendamentos a
  GROUP BY a.status;
END;
$$ LANGUAGE plpgsql;

-- 7. Verificar se a migração foi bem-sucedida
SELECT 
  'Migração concluída!' as message,
  COUNT(*) as total_agendamentos,
  COUNT(CASE WHEN status = 'LEAD' THEN 1 END) as leads,
  COUNT(CASE WHEN status = 'AGENDADO' THEN 1 END) as agendados,
  COUNT(CASE WHEN status = 'CONFIRMADO' THEN 1 END) as confirmados
FROM agendamentos;
