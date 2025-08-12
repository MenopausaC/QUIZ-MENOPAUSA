-- Primeiro, vamos ver quais dados estão causando problema
SELECT id, nome_paciente, tipo_consulta, status 
FROM agendamentos 
WHERE tipo_consulta IS NULL 
   OR tipo_consulta NOT IN ('CONSULTA_PUBLICA', 'CONSULTA_PRIVADA', 'RETORNO', 'PRIMEIRA_CONSULTA', 'TELECONSULTA');

-- Corrigir dados problemáticos
UPDATE agendamentos 
SET tipo_consulta = 'CONSULTA_PUBLICA' 
WHERE tipo_consulta IS NULL;

-- Corrigir valores inválidos específicos
UPDATE agendamentos 
SET tipo_consulta = 'CONSULTA_PUBLICA' 
WHERE tipo_consulta NOT IN ('CONSULTA_PUBLICA', 'CONSULTA_PRIVADA', 'RETORNO', 'PRIMEIRA_CONSULTA', 'TELECONSULTA');

-- Remover constraint existente se ela existir
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS valid_tipo_consulta;

-- Criar nova constraint mais permissiva
ALTER TABLE agendamentos 
ADD CONSTRAINT valid_tipo_consulta 
CHECK (tipo_consulta IN (
    'CONSULTA_PUBLICA',
    'CONSULTA_PRIVADA', 
    'RETORNO',
    'PRIMEIRA_CONSULTA',
    'TELECONSULTA'
));

-- Verificar se tudo está funcionando
SELECT DISTINCT tipo_consulta, COUNT(*) 
FROM agendamentos 
GROUP BY tipo_consulta;

COMMIT;
