-- Script simples para remover a constraint problemática
-- Execute este script no SQL Editor do Supabase

-- Primeiro, vamos ver qual constraint existe
SELECT 
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%tipo_consulta%';

-- Remover a constraint problemática
ALTER TABLE agendamentos 
DROP CONSTRAINT IF EXISTS valid_tipo_consulta;

-- Verificar se foi removida
SELECT 
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%tipo_consulta%';

-- Verificar os dados atuais
SELECT DISTINCT tipo_consulta, COUNT(*) 
FROM agendamentos 
GROUP BY tipo_consulta;

COMMIT;
