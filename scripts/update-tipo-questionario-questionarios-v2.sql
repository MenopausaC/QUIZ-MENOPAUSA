-- scripts/update-tipo-questionario-questionarios-v2.sql
-- Este script atualiza a coluna 'tipo_questionario' para registros existentes
-- na tabela 'questionarios' com base na coluna 'origem' (se existir) ou outros critérios.
-- Execute este script no SQL Editor do Supabase.

-- Atualiza para 'ORGANICO' se a origem for 'questionario-menopausa-web'
UPDATE public.questionarios
SET tipo_questionario = 'ORGANICO'
WHERE origem = 'questionario-menopausa-web' -- Assumindo que 'origem' é uma coluna na sua tabela 'questionarios'
  AND (tipo_questionario IS NULL OR tipo_questionario = '');

-- Atualiza para 'PAGO' se a origem for 'questionario-lead-pago'
UPDATE public.questionarios
SET tipo_questionario = 'PAGO'
WHERE origem = 'questionario-lead-pago' -- Assumindo que 'origem' é uma coluna na sua tabela 'questionarios'
  AND (tipo_questionario IS NULL OR tipo_questionario = '');

-- Se a coluna 'origem' não existir na tabela 'questionarios', você pode usar outros critérios
-- ou simplesmente remover as condições WHERE origem = '...' e rodar para todos os NULLs/vazios.
-- Exemplo (se 'origem' não estiver na tabela e você precisar inferir):
-- UPDATE public.questionarios
-- SET tipo_questionario = 'ORGANICO'
-- WHERE email_cadastro LIKE '%@organico.com%' AND (tipo_questionario IS NULL OR tipo_questionario = '');

-- Confirmação da atualização (mostra até 10 registros que ainda não foram atualizados)
SELECT id, tipo_questionario
FROM public.questionarios
WHERE tipo_questionario IS NULL OR tipo_questionario = ''
LIMIT 10;
