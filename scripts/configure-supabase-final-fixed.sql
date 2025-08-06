-- Script final para configurar o Supabase corretamente
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela questionarios existe, se não, criar
CREATE TABLE IF NOT EXISTS questionarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Adicionar colunas que podem estar faltando (uma por vez para evitar erros)
DO $$ 
BEGIN
    -- Dados pessoais
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionarios' AND column_name = 'nome_completo') THEN
        ALTER TABLE questionarios ADD COLUMN nome_completo VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionarios' AND column_name = 'email_cadastro') THEN
        ALTER TABLE questionarios ADD COLUMN email_cadastro VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionarios' AND column_name = 'whatsapp') THEN
        ALTER TABLE questionarios ADD COLUMN whatsapp VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionarios' AND column_name = 'idade_faixa') THEN
        ALTER TABLE questionarios ADD COLUMN idade_faixa VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionarios' AND column_name = 'estado_residencia') THEN
        ALTER TABLE questionarios ADD COLUMN estado_residencia VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionarios' AND column_name = 'estado_civil') THEN
        ALTER TABLE questionarios ADD COLUMN estado_civil VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionarios' AND column_name = 'renda_mensal') THEN
        ALTER TABLE questionarios ADD COLUMN renda_mensal VARCHAR(100);
    END IF;
    
    -- Respostas do questionário
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionarios' AND column_name = 'fase_menopausa') THEN
        ALTER TABLE questionarios ADD COLUMN fase_menopausa TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionarios' AND column_name = 'principal_sintoma') THEN
        ALTER TABLE questionarios ADD COLUMN principal_sintoma TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionarios' AND column_name = 'intensidade_sintoma_principal') THEN
        ALTER TABLE questionarios ADD COLUMN intensidade_sintoma_principal TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionarios' AND column_name = 'outros_sintomas_incomodam') THEN
        ALTER TABLE questionarios ADD COLUMN outros_sintomas_incomodam TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionarios' AND column_name = 'tempo_sintomas') THEN
        ALTER TABLE questionarios ADD COLUMN tempo_sintomas TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionarios' AND column_name = 'impacto_sintomas_vida') THEN
        ALTER TABLE questionarios ADD COLUMN impacto_sintomas_vida TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionarios' AND column_name = 'impacto_sintomas_relacionamento') THEN
        ALTER TABLE questionarios ADD COLUMN impacto_sintomas_relacionamento TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionarios' AND column_name = 'urgencia_resolver') THEN
        ALTER TABLE questionarios ADD COLUMN urgencia_resolver TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionarios' AND column_name = 'fez_reposicao_hormonal') THEN
        ALTER TABLE questionarios ADD COLUMN fez_reposicao_hormonal TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionarios' AND column_name = 'motivo_inscricao_evento') THEN
        ALTER TABLE questionarios ADD COLUMN motivo_inscricao_evento TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionarios' AND column_name = 'valor_disposto_pagar') THEN
        ALTER TABLE questionarios ADD COLUMN valor_disposto_pagar TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionarios' AND column_name = 'compra_online_experiencia') THEN
        ALTER TABLE questionarios ADD COLUMN compra_online_experiencia TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionarios' AND column_name = 'ja_conhecia') THEN
        ALTER TABLE questionarios ADD COLUMN ja_conhecia TEXT;
    END IF;
    
    -- Análise e qualificação
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionarios' AND column_name = 'pontuacao_total') THEN
        ALTER TABLE questionarios ADD COLUMN pontuacao_total INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionarios' AND column_name = 'qualificacao_lead') THEN
        ALTER TABLE questionarios ADD COLUMN qualificacao_lead VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionarios' AND column_name = 'categoria_sintomas') THEN
        ALTER TABLE questionarios ADD COLUMN categoria_sintomas VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionarios' AND column_name = 'urgencia_caso') THEN
        ALTER TABLE questionarios ADD COLUMN urgencia_caso VARCHAR(20);
    END IF;
    
    -- Metadados
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionarios' AND column_name = 'tipo_questionario') THEN
        ALTER TABLE questionarios ADD COLUMN tipo_questionario VARCHAR(20) DEFAULT 'ORGANICO';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionarios' AND column_name = 'origem') THEN
        ALTER TABLE questionarios ADD COLUMN origem VARCHAR(100) DEFAULT 'web';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionarios' AND column_name = 'tempo_total_questionario_segundos') THEN
        ALTER TABLE questionarios ADD COLUMN tempo_total_questionario_segundos INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionarios' AND column_name = 'tempo_total_questionario_ms') THEN
        ALTER TABLE questionarios ADD COLUMN tempo_total_questionario_ms INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionarios' AND column_name = 'tempo_medio_resposta_ms') THEN
        ALTER TABLE questionarios ADD COLUMN tempo_medio_resposta_ms INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionarios' AND column_name = 'dispositivo') THEN
        ALTER TABLE questionarios ADD COLUMN dispositivo VARCHAR(50);
    END IF;
    
    -- Status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionarios' AND column_name = 'status_contato') THEN
        ALTER TABLE questionarios ADD COLUMN status_contato VARCHAR(50) DEFAULT 'novo';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionarios' AND column_name = 'data_primeiro_contato') THEN
        ALTER TABLE questionarios ADD COLUMN data_primeiro_contato TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questionarios' AND column_name = 'observacoes') THEN
        ALTER TABLE questionarios ADD COLUMN observacoes TEXT;
    END IF;
END $$;

-- 3. Atualizar colunas que devem ser NOT NULL
ALTER TABLE questionarios ALTER COLUMN nome_completo SET NOT NULL;
ALTER TABLE questionarios ALTER COLUMN email_cadastro SET NOT NULL;
ALTER TABLE questionarios ALTER COLUMN whatsapp SET NOT NULL;
ALTER TABLE questionarios ALTER COLUMN pontuacao_total SET NOT NULL;
ALTER TABLE questionarios ALTER COLUMN pontuacao_total SET DEFAULT 0;
ALTER TABLE questionarios ALTER COLUMN qualificacao_lead SET NOT NULL;
ALTER TABLE questionarios ALTER COLUMN tipo_questionario SET NOT NULL;
ALTER TABLE questionarios ALTER COLUMN tipo_questionario SET DEFAULT 'ORGANICO';

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_questionarios_email ON questionarios(email_cadastro);
CREATE INDEX IF NOT EXISTS idx_questionarios_qualificacao ON questionarios(qualificacao_lead);
CREATE INDEX IF NOT EXISTS idx_questionarios_tipo ON questionarios(tipo_questionario);
CREATE INDEX IF NOT EXISTS idx_questionarios_created_at ON questionarios(created_at);
CREATE INDEX IF NOT EXISTS idx_questionarios_status ON questionarios(status_contato);

-- 5. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_questionarios_updated_at ON questionarios;
CREATE TRIGGER update_questionarios_updated_at 
    BEFORE UPDATE ON questionarios 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Habilitar RLS
ALTER TABLE questionarios ENABLE ROW LEVEL SECURITY;

-- 7. Remover todas as políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Allow anon insert on questionarios" ON questionarios;
DROP POLICY IF EXISTS "Allow anon select on questionarios" ON questionarios;
DROP POLICY IF EXISTS "Allow authenticated select on questionarios" ON questionarios;
DROP POLICY IF EXISTS "Allow authenticated insert on questionarios" ON questionarios;
DROP POLICY IF EXISTS "Permitir inserção de questionarios" ON questionarios;
DROP POLICY IF EXISTS "Permitir leitura de questionarios" ON questionarios;
DROP POLICY IF EXISTS "Allow anon full access on questionarios" ON questionarios;
DROP POLICY IF EXISTS "Allow authenticated full access on questionarios" ON questionarios;

-- 8. Criar políticas permissivas para anon e authenticated
CREATE POLICY "Allow anon full access on questionarios" ON questionarios
    FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access on questionarios" ON questionarios
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9. Garantir que o papel anon tem as permissões necessárias
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON TABLE questionarios TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE questionarios TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 10. Criar views úteis para o dashboard
CREATE OR REPLACE VIEW dashboard_questionarios AS
SELECT 
    id,
    created_at,
    nome_completo,
    email_cadastro,
    whatsapp,
    idade_faixa,
    qualificacao_lead,
    pontuacao_total,
    tipo_questionario,
    categoria_sintomas,
    urgencia_caso,
    status_contato,
    principal_sintoma,
    fase_menopausa,
    dispositivo
FROM questionarios
ORDER BY created_at DESC;

CREATE OR REPLACE VIEW dashboard_metrics AS
SELECT 
    COUNT(*) as total_leads,
    COUNT(CASE WHEN qualificacao_lead = 'ALTA' THEN 1 END) as leads_quentes,
    COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as leads_hoje,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as leads_semana,
    COUNT(CASE WHEN tipo_questionario = 'ORGANICO' THEN 1 END) as leads_organicos,
    COUNT(CASE WHEN tipo_questionario = 'PAGO' THEN 1 END) as leads_pagos,
    ROUND(AVG(pontuacao_total), 2) as pontuacao_media
FROM questionarios;

-- 11. Dar permissões nas views
GRANT SELECT ON dashboard_questionarios TO anon, authenticated;
GRANT SELECT ON dashboard_metrics TO anon, authenticated;

-- 12. Verificar se tudo foi criado corretamente
SELECT 
    'Tabela questionarios' as item,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'questionarios') 
         THEN 'OK' ELSE 'ERRO' END as status
UNION ALL
SELECT 
    'View dashboard_questionarios' as item,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'dashboard_questionarios') 
         THEN 'OK' ELSE 'ERRO' END as status
UNION ALL
SELECT 
    'View dashboard_metrics' as item,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'dashboard_metrics') 
         THEN 'OK' ELSE 'ERRO' END as status
UNION ALL
SELECT 
    'Políticas RLS' as item,
    CASE WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'questionarios') 
         THEN 'OK' ELSE 'ERRO' END as status;

-- 13. Mostrar estrutura final da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'questionarios' 
ORDER BY ordinal_position;

-- 14. Mostrar contagem final
SELECT COUNT(*) as total_registros FROM questionarios;
