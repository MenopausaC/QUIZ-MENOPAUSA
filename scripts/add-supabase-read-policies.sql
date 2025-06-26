-- Adicionar políticas para permitir SELECT para o papel 'anon'
-- Execute este script no SQL Editor do Supabase APÓS o script de criação das tabelas.

-- Política para permitir leitura de leads_menopausa para o papel 'anon'
CREATE POLICY "Allow anon select on leads_menopausa" ON public.leads_menopausa
  FOR SELECT TO anon USING (true);

-- Política para permitir leitura de sintomas_identificados para o papel 'anon'
CREATE POLICY "Allow anon select on sintomas_identificados" ON public.sintomas_identificados
  FOR SELECT TO anon USING (true);

-- Política para permitir leitura de respostas_questionario para o papel 'anon'
CREATE POLICY "Allow anon select on respostas_questionario" ON public.respostas_questionario
  FOR SELECT TO anon USING (true);
