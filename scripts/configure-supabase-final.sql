-- Script final para configurar o Supabase corretamente
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela questionarios existe, se não, criar
CREATE TABLE IF NOT EXISTS questionarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Dados pessoais
    nome_completo VARCHAR(255) NOT NULL,
    email_cadastro VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(50) NOT NULL,
    idade_faixa VARCHAR(50),
    estado_residencia VARCHAR(100),
    estado_civil VARCHAR(50),
    renda_mensal VARCHAR(100),
    
    -- Respostas do questionário
    fase_menopausa TEXT,
    principal_sintoma TEXT,
    intensidade_sintoma_principal TEXT,
    outros_sintomas_incomodam TEXT,
    tempo_sintomas TEXT,
    impacto_sintomas_vida TEXT,
    impacto_sintomas_relacionamento TEXT,
    urgencia_resolver TEXT,
    fez_reposicao_hormonal TEXT,
    motivo_inscricao_evento TEXT,
    valor_disposto_pagar TEXT,
    compra_online_experiencia TEXT,
    ja_conhecia TEXT,
    
    -- Análise e qualificação
    pontuacao_total INTEGER NOT NULL DEFAULT 0,
    qualificacao_lead VARCHAR(20) NOT NULL,
    categoria_sintomas VARCHAR(50),
    urgencia_caso VARCHAR(20),
    
    -- Metadados
    tipo_questionario VARCHAR(20) NOT NULL DEFAULT 'ORGANICO',
    origem VARCHAR(100) DEFAULT 'web',
    tempo_total_questionario_segundos INTEGER,
    tempo_total_questionario_ms INTEGER,
    tempo_medio_resposta_ms INTEGER,
    dispositivo VARCHAR(50),
    
    -- Status
    status_contato VARCHAR(50) DEFAULT 'novo',
    data_primeiro_contato TIMESTAMP WITH TIME ZONE,
    observacoes TEXT
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_questionarios_email ON questionarios(email_cadastro);
CREATE INDEX IF NOT EXISTS idx_questionarios_qualificacao ON questionarios(qualificacao_lead);
CREATE INDEX IF NOT EXISTS idx_questionarios_tipo ON questionarios(tipo_questionario);
CREATE INDEX IF NOT EXISTS idx_questionarios_created_at ON questionarios(created_at);
CREATE INDEX IF NOT EXISTS idx_questionarios_status ON questionarios(status_contato);

-- 3. Trigger para atualizar updated_at
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

-- 4. Habilitar RLS
ALTER TABLE questionarios ENABLE ROW LEVEL SECURITY;

-- 5. Remover todas as políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Allow anon insert on questionarios" ON questionarios;
DROP POLICY IF EXISTS "Allow anon select on questionarios" ON questionarios;
DROP POLICY IF EXISTS "Allow authenticated select on questionarios" ON questionarios;
DROP POLICY IF EXISTS "Allow authenticated insert on questionarios" ON questionarios;
DROP POLICY IF EXISTS "Permitir inserção de questionarios" ON questionarios;
DROP POLICY IF EXISTS "Permitir leitura de questionarios" ON questionarios;

-- 6. Criar políticas permissivas para anon e authenticated
CREATE POLICY "Allow anon full access on questionarios" ON questionarios
    FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access on questionarios" ON questionarios
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. Garantir que o papel anon tem as permissões necessárias
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON TABLE questionarios TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE questionarios TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 8. Criar views úteis para o dashboard
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

-- 9. Dar permissões nas views
GRANT SELECT ON dashboard_questionarios TO anon, authenticated;
GRANT SELECT ON dashboard_metrics TO anon, authenticated;

-- 10. Inserir um registro de teste para verificar se tudo funciona
INSERT INTO questionarios (
    nome_completo,
    email_cadastro,
    whatsapp,
    idade_faixa,
    qualificacao_lead,
    pontuacao_total,
    tipo_questionario,
    categoria_sintomas,
    urgencia_caso
) VALUES (
    'Teste Configuração',
    'teste.config@exemplo.com',
    '11999999999',
    '45 anos',
    'TESTE',
    0,
    'TESTE',
    'TESTE',
    'TESTE'
) ON CONFLICT DO NOTHING;

-- 11. Verificar se tudo foi criado corretamente
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

-- Mostrar contagem final
SELECT COUNT(*) as total_registros FROM questionarios;
