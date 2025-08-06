-- scripts/reset-supabase-complete.sql
-- Este script remove TUDO do Supabase e recria do zero
-- ATENÇÃO: Isso vai apagar todos os dados existentes!

-- 1. Remover todas as políticas RLS
DROP POLICY IF EXISTS "Allow anon insert on questionarios" ON public.questionarios;
DROP POLICY IF EXISTS "Allow anon select on questionarios" ON public.questionarios;
DROP POLICY IF EXISTS "Allow authenticated users to insert questionarios" ON public.questionarios;
DROP POLICY IF EXISTS "Allow authenticated users to select questionarios" ON public.questionarios;
DROP POLICY IF EXISTS "Permitir tudo para anônimos" ON public.questionarios;
DROP POLICY IF EXISTS "Permitir tudo para autenticados" ON public.questionarios;

-- 2. Remover todas as funções de trigger
DROP FUNCTION IF EXISTS update_updated_at_column_questionarios_trigger() CASCADE;
DROP FUNCTION IF EXISTS trigger_set_timestamp();

-- 3. Remover todas as tabelas
DROP TABLE IF EXISTS public.questionarios CASCADE;
DROP TABLE IF EXISTS public.dashboard_leads CASCADE;
DROP TABLE IF EXISTS public.dashboard_metrics CASCADE;
DROP TABLE IF EXISTS public.dashboard_questionarios CASCADE;
DROP TABLE IF EXISTS public.leads_menopausa CASCADE;
DROP TABLE IF EXISTS public.metricas_dashboard CASCADE;
DROP TABLE IF EXISTS public.relatorio_conversao CASCADE;
DROP TABLE IF EXISTS public.respostas_questionario CASCADE;
DROP TABLE IF EXISTS public.sintomas_identificados CASCADE;

-- 4. Remover índices órfãos (se existirem)
DROP INDEX IF EXISTS idx_questionarios_email;
DROP INDEX IF EXISTS idx_questionarios_tipo;
DROP INDEX IF EXISTS idx_questionarios_created_at;
DROP INDEX IF EXISTS idx_questionarios_qualificacao;
DROP INDEX IF EXISTS idx_questionarios_dispositivo;
DROP INDEX IF EXISTS idx_questionarios_data_envio;

-- Limpar dados de teste (se existirem)
DELETE FROM auth.users WHERE email LIKE '%teste%';

-- Confirmar limpeza
SELECT 'Supabase limpo com sucesso!' as status;

COMMIT;
