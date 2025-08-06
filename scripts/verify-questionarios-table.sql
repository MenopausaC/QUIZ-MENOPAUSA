-- scripts/verify-questionarios-table.sql
-- Este script faz uma verificação completa da tabela questionarios

-- 1. Verificar se a tabela existe
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'questionarios';

-- 2. Verificar todas as colunas da tabela
SELECT 
    ordinal_position,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'questionarios' 
ORDER BY ordinal_position;

-- 3. Verificar políticas RLS ativas
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'questionarios'
ORDER BY policyname;

-- 4. Contar registros por tipo de questionário
SELECT 
    tipo_questionario,
    COUNT(*) as total,
    COUNT(CASE WHEN qualificacao_lead = 'ALTA' THEN 1 END) as alta,
    COUNT(CASE WHEN qualificacao_lead = 'MEDIA' THEN 1 END) as media,
    COUNT(CASE WHEN qualificacao_lead = 'BAIXA' THEN 1 END) as baixa
FROM questionarios 
GROUP BY tipo_questionario
ORDER BY tipo_questionario;

-- 5. Verificar últimos registros inseridos
SELECT 
    id,
    nome_completo,
    email_cadastro,
    tipo_questionario,
    qualificacao_lead,
    pontuacao_total,
    created_at
FROM questionarios 
ORDER BY created_at DESC 
LIMIT 10;

-- 6. Verificar se há registros duplicados por email
SELECT 
    email_cadastro,
    COUNT(*) as total_registros
FROM questionarios 
GROUP BY email_cadastro
HAVING COUNT(*) > 1
ORDER BY total_registros DESC;

-- 7. Verificar campos obrigatórios que podem estar nulos
SELECT 
    COUNT(*) as total_registros,
    COUNT(nome_completo) as com_nome,
    COUNT(email_cadastro) as com_email,
    COUNT(whatsapp) as com_whatsapp,
    COUNT(tipo_questionario) as com_tipo,
    COUNT(qualificacao_lead) as com_qualificacao
FROM questionarios;

-- 8. Verificar distribuição de pontuações
SELECT 
    CASE 
        WHEN pontuacao_total >= 30 THEN '30+ (ALTA)'
        WHEN pontuacao_total >= 20 THEN '20-29 (MEDIA)'
        WHEN pontuacao_total >= 10 THEN '10-19 (BAIXA)'
        ELSE '0-9 (MUITO BAIXA)'
    END as faixa_pontuacao,
    COUNT(*) as total
FROM questionarios 
GROUP BY 
    CASE 
        WHEN pontuacao_total >= 30 THEN '30+ (ALTA)'
        WHEN pontuacao_total >= 20 THEN '20-29 (MEDIA)'
        WHEN pontuacao_total >= 10 THEN '10-19 (BAIXA)'
        ELSE '0-9 (MUITO BAIXA)'
    END
ORDER BY MIN(pontuacao_total);
