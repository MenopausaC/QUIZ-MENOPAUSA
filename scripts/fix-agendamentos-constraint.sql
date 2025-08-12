-- Script para corrigir a constraint valid_tipo_consulta na tabela agendamentos

-- Primeiro, vamos verificar se a constraint existe e removê-la se necessário
DO $$ 
BEGIN
    -- Remove a constraint se ela existir
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'valid_tipo_consulta' 
        AND table_name = 'agendamentos'
    ) THEN
        ALTER TABLE agendamentos DROP CONSTRAINT valid_tipo_consulta;
    END IF;
END $$;

-- Agora vamos criar uma nova constraint que aceite os valores corretos
ALTER TABLE agendamentos 
ADD CONSTRAINT valid_tipo_consulta 
CHECK (tipo_consulta IN (
    'CONSULTA_PUBLICA',
    'CONSULTA_PRIVADA', 
    'RETORNO',
    'PRIMEIRA_CONSULTA',
    'TELECONSULTA'
));

-- Verificar se há dados inválidos e corrigi-los se necessário
UPDATE agendamentos 
SET tipo_consulta = 'CONSULTA_PUBLICA' 
WHERE tipo_consulta IS NULL OR tipo_consulta = '';

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_agendamentos_tipo_consulta 
ON agendamentos(tipo_consulta);

-- Verificar a estrutura final
SELECT 
    constraint_name,
    constraint_type,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name = 'valid_tipo_consulta';
