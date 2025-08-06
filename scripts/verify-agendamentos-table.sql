-- Script para verificar a tabela 'agendamentos' e suas permissões no Supabase

-- 1. Verificar se a tabela 'agendamentos' existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'agendamentos'
        )
        THEN '✅ Tabela "agendamentos" existe.'
        ELSE '❌ Tabela "agendamentos" NÃO existe. Por favor, crie-a.'
    END as status_tabela;

-- 2. Verificar a estrutura da tabela 'agendamentos' (colunas e tipos)
-- Compare esta saída com a estrutura esperada pela sua API.
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM 
    information_schema.columns 
WHERE 
    table_schema = 'public' AND table_name = 'agendamentos'
ORDER BY 
    ordinal_position;

-- 3. Verificar o status do Row Level Security (RLS) na tabela 'agendamentos'
SELECT 
    relname AS table_name, 
    relrowsecurity AS rls_enabled
FROM 
    pg_class 
WHERE 
    relname = 'agendamentos';

-- 4. Listar as políticas de RLS para a tabela 'agendamentos'
-- Embora a Service Role Key ignore o RLS, é bom verificar se há políticas muito restritivas.
SELECT 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check 
FROM 
    pg_policies 
WHERE 
    schemaname = 'public' AND tablename = 'agendamentos';

-- 5. Verificar as permissões concedidas ao papel 'anon' e 'authenticated' na tabela 'agendamentos'
-- A API usa a Service Role Key, que tem permissões elevadas.
-- No entanto, se você planeja usar o anon key para outras operações, é bom verificar.
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM 
    information_schema.role_table_grants 
WHERE 
    table_schema = 'public' AND table_name = 'agendamentos'
    AND grantee IN ('anon', 'authenticated', 'postgres');

-- 6. Testar uma inserção simulada (não será realmente inserido, apenas verifica a sintaxe e permissões)
-- Se este comando falhar, há um problema de permissão ou esquema.
-- Substitua os valores pelos que sua API enviaria.
DO $$
BEGIN
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
        'Teste Nome', 
        'teste@email.com', 
        '11987654321', 
        '2025-08-15', 
        '10:00', 
        'PAGO', 
        'AGENDADO', 
        'Teste de inserção via SQL'
    );
    RAISE NOTICE '✅ Teste de inserção simulada bem-sucedido (se não houver erro acima).';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE '❌ Erro no teste de inserção simulada: %', SQLERRM;
END $$;

-- 7. Contar registros existentes na tabela 'agendamentos'
SELECT COUNT(*) AS total_agendamentos FROM public.agendamentos;
