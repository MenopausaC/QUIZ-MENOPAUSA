-- Verificar se a tabela existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'agendamentos'
) as table_exists;

-- Verificar estrutura da tabela
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'agendamentos' 
ORDER BY ordinal_position;

-- Verificar constraints
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'agendamentos';

-- Verificar índices
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'agendamentos';

-- Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'agendamentos';

-- Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'agendamentos';

-- Contar registros existentes
SELECT 
    COUNT(*) as total_agendamentos,
    COUNT(CASE WHEN status = 'CONFIRMADO' THEN 1 END) as confirmados,
    COUNT(CASE WHEN status = 'AGUARDANDO_PAGAMENTO' THEN 1 END) as aguardando_pagamento,
    COUNT(CASE WHEN status = 'CANCELADO' THEN 1 END) as cancelados
FROM agendamentos;

-- Mostrar alguns registros de exemplo
SELECT 
    id,
    nome_paciente,
    email_paciente,
    data_agendamento,
    horario_agendamento,
    status,
    valor_consulta,
    created_at
FROM agendamentos 
ORDER BY created_at DESC 
LIMIT 5;

-- Testar inserção de um registro
INSERT INTO agendamentos (
    nome_paciente,
    email_paciente,
    whatsapp,
    data_agendamento,
    horario_agendamento,
    status,
    tipo_consulta,
    valor_consulta
) VALUES (
    'Teste Verificação',
    'teste@email.com',
    '11999999999',
    CURRENT_DATE + INTERVAL '7 days',
    '15:00:00',
    'AGUARDANDO_PAGAMENTO',
    'PAGO',
    150.00
) RETURNING id, nome_paciente, created_at;

-- Verificar se o registro foi inserido
SELECT COUNT(*) as registros_teste 
FROM agendamentos 
WHERE nome_paciente = 'Teste Verificação';

-- Limpar registro de teste
DELETE FROM agendamentos 
WHERE nome_paciente = 'Teste Verificação';

-- Status final
SELECT 'Tabela agendamentos está funcionando corretamente!' as status;
