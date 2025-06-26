-- scripts/update-tipo-questionario.sql
-- Este script atualiza a coluna 'tipo_questionario' para registros existentes
-- na tabela 'leads_menopausa' com base na coluna 'origem'.

UPDATE public.leads_menopausa
SET tipo_questionario = 'ORGANICO'
WHERE origem = 'questionario-menopausa-web'
  AND (tipo_questionario IS NULL OR tipo_questionario = '');

UPDATE public.leads_menopausa
SET tipo_questionario = 'PAGO'
WHERE origem = 'questionario-lead-pago'
  AND (tipo_questionario IS NULL OR tipo_questionario = '');

-- Opcional: Se houver outras origens que você queira mapear para 'tipo_questionario', adicione mais UPDATEs aqui.
-- Exemplo:
-- UPDATE public.leads_menopausa
-- SET tipo_questionario = 'TESTE'
-- WHERE origem = 'teste-webhook'
--   AND (tipo_questionario IS NULL OR tipo_questionario = '');

-- Confirmação da atualização
SELECT id, origem, tipo_questionario
FROM public.leads_menopausa
WHERE tipo_questionario IS NULL OR tipo_questionario = ''
LIMIT 10; -- Mostra até 10 registros que ainda não foram atualizados (deve ser vazio após a execução)
