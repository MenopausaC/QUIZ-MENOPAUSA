-- Script para testar se a tabela agendamentos está funcionando corretamente

-- 1. Verificar se a tabela existe
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'agendamentos' 
ORDER BY ordinal_position;

-- 2. Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'agendamentos';

-- 3. Verificar permissões
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'agendamentos';

-- 4. Testar inserção de dados
INSERT INTO public.agendamentos (
    nome_paciente,
    email_paciente,
    telefone_paciente,
    data_agendamento,
    horario_agendamento,
    tipo_consulta,
    status,
    observacoes
) VALUES (
    'Teste Usuario',
    'teste@email.com',
    '(11) 99999-9999',
    CURRENT_DATE + INTERVAL '1 day',
    '10:00:00',
    'consulta_inicial',
    'agendado',
    'Teste de inserção via SQL'
) ON CONFLICT DO NOTHING;

-- 5. Verificar se os dados foram inseridos
SELECT * FROM public.agendamentos 
WHERE nome_paciente = 'Teste Usuario'
ORDER BY created_at DESC
LIMIT 5;

-- 6. Contar total de agendamentos
SELECT COUNT(*) as total_agendamentos FROM public.agendamentos;

-- 7. Verificar agendamentos por status
SELECT status, COUNT(*) as quantidade
FROM public.agendamentos
GROUP BY status
ORDER BY quantidade DESC;

-- 8. Verificar agendamentos por tipo
SELECT tipo_consulta, COUNT(*) as quantidade
FROM public.agendamentos
GROUP BY tipo_consulta
ORDER BY quantidade DESC;
