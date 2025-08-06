-- Script para verificar se a configuração da tabela agendamentos está correta

-- 1. Verificar se a tabela existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agendamentos')
        THEN '✅ Tabela agendamentos existe'
        ELSE '❌ Tabela agendamentos NÃO existe'
    END as status_tabela;

-- 2. Verificar estrutura da tabela
SELECT 
    '📋 Estrutura da tabela:' as titulo;

SELECT 
    column_name as campo,
    data_type as tipo,
    is_nullable as permite_null,
    column_default as valor_padrao
FROM information_schema.columns 
WHERE table_name = 'agendamentos' 
ORDER BY ordinal_position;

-- 3. Verificar índices
SELECT 
    '🔍 Índices criados:' as titulo;

SELECT 
    indexname as nome_indice,
    indexdef as definicao
FROM pg_indexes 
WHERE tablename = 'agendamentos';

-- 4. Verificar constraints
SELECT 
    '🔒 Constraints:' as titulo;

SELECT 
    constraint_name as nome_constraint,
    constraint_type as tipo
FROM information_schema.table_constraints 
WHERE table_name = 'agendamentos';

-- 5. Verificar políticas RLS
SELECT 
    '🛡️ Políticas RLS:' as titulo;

SELECT 
    policyname as nome_politica,
    cmd as comando,
    permissive as permissiva
FROM pg_policies 
WHERE tablename = 'agendamentos';

-- 6. Verificar se RLS está habilitado
SELECT 
    CASE 
        WHEN relrowsecurity = true 
        THEN '✅ RLS habilitado'
        ELSE '❌ RLS NÃO habilitado'
    END as status_rls
FROM pg_class 
WHERE relname = 'agendamentos';

-- 7. Contar registros por status
SELECT 
    '📊 Registros por status:' as titulo;

SELECT 
    status,
    COUNT(*) as quantidade
FROM agendamentos 
GROUP BY status
ORDER BY quantidade DESC;

-- 8. Mostrar próximos agendamentos
SELECT 
    '📅 Próximos agendamentos:' as titulo;

SELECT 
    nome_paciente,
    data_agendamento,
    horario_agendamento,
    status,
    valor_consulta
FROM agendamentos 
WHERE data_agendamento >= CURRENT_DATE
ORDER BY data_agendamento, horario_agendamento
LIMIT 10;

-- 9. Teste de inserção (será removido automaticamente)
INSERT INTO agendamentos (
    nome_paciente,
    telefone_paciente,
    data_agendamento,
    horario_agendamento,
    origem
) VALUES (
    'Teste Sistema',
    '(11) 00000-0000',
    CURRENT_DATE + INTERVAL '30 days',
    '15:00',
    'teste_verificacao'
) RETURNING id, nome_paciente, created_at;

-- 10. Remover o teste
DELETE FROM agendamentos 
WHERE origem = 'teste_verificacao';

-- 11. Verificar se a inserção e remoção funcionaram
SELECT 
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM agendamentos WHERE origem = 'teste_verificacao')
        THEN '✅ Teste de inserção/remoção OK'
        ELSE '❌ Problema no teste de inserção/remoção'
    END as status_teste;

-- 12. Resumo final
SELECT 
    '🎯 RESUMO FINAL:' as titulo;

SELECT 
    COUNT(*) as total_agendamentos,
    COUNT(CASE WHEN status = 'CONFIRMADO' THEN 1 END) as confirmados,
    COUNT(CASE WHEN status = 'AGUARDANDO_PAGAMENTO' THEN 1 END) as aguardando_pagamento,
    COUNT(CASE WHEN data_agendamento >= CURRENT_DATE THEN 1 END) as futuros
FROM agendamentos;

SELECT '✅ Verificação completa da tabela agendamentos finalizada!' as resultado;
