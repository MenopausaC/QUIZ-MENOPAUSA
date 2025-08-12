-- Script para corrigir a constraint valid_tipo_consulta na tabela agendamentos
-- Versão 2: Corrige dados existentes primeiro

BEGIN;

-- Primeiro, vamos verificar quais valores existem atualmente
SELECT DISTINCT tipo_consulta, COUNT(*) 
FROM agendamentos 
GROUP BY tipo_consulta;

-- Corrigir dados existentes que podem estar causando o problema
-- Atualizar valores inválidos para valores válidos
UPDATE agendamentos 
SET tipo_consulta = 'CONSULTA_PUBLICA' 
WHERE tipo_consulta IS NULL OR tipo_consulta = '';

-- Normalizar outros valores se necessário
UPDATE agendamentos 
SET tipo_consulta = 'CONSULTA_PUBLICA' 
WHERE tipo_consulta NOT IN (
    'CONSULTA_PUBLICA', 
    'CONSULTA_PRIVADA', 
    'RETORNO', 
    'PRIMEIRA_CONSULTA', 
    'TELECONSULTA'
);

-- Agora remover a constraint existente
ALTER TABLE agendamentos 
DROP CONSTRAINT IF EXISTS valid_tipo_consulta;

-- Criar a nova constraint com os valores corretos
ALTER TABLE agendamentos 
ADD CONSTRAINT valid_tipo_consulta 
CHECK (tipo_consulta IN (
    'CONSULTA_PUBLICA',
    'CONSULTA_PRIVADA', 
    'RETORNO',
    'PRIMEIRA_CONSULTA',
    'TELECONSULTA'
));

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_agendamentos_tipo_consulta 
ON agendamentos(tipo_consulta);

-- Verificar se tudo está funcionando
SELECT 
    constraint_name,
    constraint_type,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name = 'valid_tipo_consulta';

-- Verificar os dados finais
SELECT DISTINCT tipo_consulta, COUNT(*) 
FROM agendamentos 
GROUP BY tipo_consulta;

COMMIT;
