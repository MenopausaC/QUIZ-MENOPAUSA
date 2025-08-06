-- scripts/fix-questionarios-permissions.sql
-- Este script corrige todas as permissões e políticas da tabela questionarios

-- Primeiro, remover todas as políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Allow authenticated insert on questionarios" ON public.questionarios;
DROP POLICY IF EXISTS "Allow authenticated select on questionarios" ON public.questionarios;
DROP POLICY IF EXISTS "Allow public insert on questionarios" ON public.questionarios;
DROP POLICY IF EXISTS "Allow public select on questionarios" ON public.questionarios;
DROP POLICY IF EXISTS "Permitir inserção para todos" ON public.questionarios;
DROP POLICY IF EXISTS "Permitir leitura para todos" ON public.questionarios;

-- Garantir que RLS está habilitado
ALTER TABLE public.questionarios ENABLE ROW LEVEL SECURITY;

-- Criar políticas permissivas para anon (usuários não autenticados)
CREATE POLICY "Enable insert for anon users" ON public.questionarios
    FOR INSERT TO anon
    WITH CHECK (true);

CREATE POLICY "Enable select for anon users" ON public.questionarios
    FOR SELECT TO anon
    USING (true);

-- Criar políticas para usuários autenticados
CREATE POLICY "Enable insert for authenticated users" ON public.questionarios
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable select for authenticated users" ON public.questionarios
    FOR SELECT TO authenticated
    USING (true);

-- Conceder permissões necessárias
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.questionarios TO anon, authenticated;

-- Se houver sequências, conceder permissões também
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name LIKE '%questionarios%') THEN
        GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
    END IF;
END $$;

-- Verificar se as políticas foram criadas corretamente
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

-- Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'questionarios';

-- Mostrar estrutura da tabela para confirmar campos
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'questionarios' 
ORDER BY ordinal_position;
