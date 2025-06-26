-- scripts/add-rls-questionarios-v2.sql
-- Este script habilita RLS e adiciona políticas de leitura e inserção para a tabela 'questionarios'.
-- Execute este script no SQL Editor do Supabase.

-- Habilitar RLS na tabela (se ainda não estiver habilitada)
ALTER TABLE public.questionarios ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes para evitar conflitos (opcional, mas recomendado para garantir a aplicação da nova)
DROP POLICY IF EXISTS "Allow anon insert on questionarios" ON public.questionarios;
DROP POLICY IF EXISTS "Allow anon select on questionarios" ON public.questionarios;

-- Criar política para permitir inserção pelo papel 'anon'
CREATE POLICY "Allow anon insert on questionarios" ON public.questionarios
  FOR INSERT TO anon WITH CHECK (true);

-- Criar política para permitir leitura pelo papel 'anon'
CREATE POLICY "Allow anon select on questionarios" ON public.questionarios
  FOR SELECT TO anon USING (true);
