-- Verificar se a tabela questionarios existe e tem as colunas necessárias
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'questionarios' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se existem dados na tabela
SELECT 
    COUNT(*) as total_questionarios,
    COUNT(data_agendamento) as com_agendamento,
    COUNT(CASE WHEN data_agendamento IS NOT NULL THEN 1 END) as agendamentos_validos
FROM questionarios;

-- Verificar agendamentos por status
SELECT 
    status_agendamento,
    COUNT(*) as quantidade
FROM questionarios 
WHERE data_agendamento IS NOT NULL
GROUP BY status_agendamento;

-- Verificar agendamentos por data
SELECT 
    data_agendamento,
    COUNT(*) as quantidade,
    STRING_AGG(nome_completo, ', ') as nomes
FROM questionarios 
WHERE data_agendamento IS NOT NULL
GROUP BY data_agendamento
ORDER BY data_agendamento;

-- Verificar se as políticas RLS estão ativas
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'questionarios';

-- Verificar políticas RLS existentes
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'questionarios';
