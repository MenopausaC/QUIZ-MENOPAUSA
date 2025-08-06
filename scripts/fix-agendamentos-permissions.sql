-- Script para corrigir permissões da tabela agendamentos

-- Verificar se a tabela existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'agendamentos') THEN
        RAISE EXCEPTION 'Tabela agendamentos não existe. Execute primeiro o script create-agendamentos-table-complete.sql';
    END IF;
END $$;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Permitir leitura pública" ON agendamentos;
DROP POLICY IF EXISTS "Permitir inserção pública" ON agendamentos;
DROP POLICY IF EXISTS "Permitir atualização pública" ON agendamentos;
DROP POLICY IF EXISTS "Permitir exclusão pública" ON agendamentos;

-- Recriar políticas mais permissivas
CREATE POLICY "Acesso total público" ON agendamentos FOR ALL USING (true) WITH CHECK (true);

-- Garantir que RLS está habilitado
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- Conceder permissões para usuário anônimo
GRANT ALL ON agendamentos TO anon;
GRANT ALL ON agendamentos TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE agendamentos_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE agendamentos_id_seq TO authenticated;

-- Testar inserção como usuário anônimo
SET ROLE anon;
INSERT INTO agendamentos (
    nome_paciente, 
    telefone_paciente, 
    whatsapp,
    data_agendamento, 
    horario_agendamento, 
    status,
    origem
) VALUES (
    'Teste Anônimo', 
    '11999999999', 
    '11999999999',
    CURRENT_DATE + INTERVAL '1 day', 
    '15:00', 
    'AGENDADO',
    'teste'
);

-- Voltar para usuário padrão
RESET ROLE;

-- Verificar se a inserção funcionou
SELECT 
    'Permissões configuradas com sucesso!' as status,
    COUNT(*) as total_registros,
    COUNT(*) FILTER (WHERE origem = 'teste') as registros_teste
FROM agendamentos;

-- Limpar registro de teste
DELETE FROM agendamentos WHERE origem = 'teste';

SELECT 'Teste de permissões concluído com sucesso!' as resultado;
