ALTER TABLE agendamentos
ADD COLUMN IF NOT EXISTS questionario_data JSONB;

COMMENT ON COLUMN agendamentos.questionario_data IS 'Dados completos do questionário respondido pelo lead, em formato JSON.';

-- Opcional: Se você quiser que esta coluna seja visível para a API PostgREST
-- ALTER TABLE agendamentos REPLICA IDENTITY FULL;
-- NOTIFY pgrst, 'reload schema';
