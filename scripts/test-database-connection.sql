-- Script para testar a conexão e estrutura do banco de dados

-- Verificar se as tabelas existem
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('leads_menopausa', 'sintomas_identificados', 'respostas_questionario');

-- Verificar estrutura da tabela leads_menopausa
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'leads_menopausa'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('leads_menopausa', 'sintomas_identificados', 'respostas_questionario')
ORDER BY tablename, policyname;

-- Contar registros existentes
SELECT 
  'leads_menopausa' as tabela,
  COUNT(*) as total_registros
FROM leads_menopausa
UNION ALL
SELECT 
  'sintomas_identificados' as tabela,
  COUNT(*) as total_registros
FROM sintomas_identificados
UNION ALL
SELECT 
  'respostas_questionario' as tabela,
  COUNT(*) as total_registros
FROM respostas_questionario;

-- Verificar dados de exemplo na tabela leads_menopausa
SELECT 
  id,
  nome,
  email,
  origem,
  qualificacao_lead,
  pontuacao_total,
  created_at
FROM leads_menopausa
ORDER BY created_at DESC
LIMIT 5;
