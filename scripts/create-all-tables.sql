-- Script completo para criar todas as tabelas necessárias no Supabase
-- Execute este script no SQL Editor do Supabase

-- =====================================================
-- 1. TABELA QUESTIONARIOS (estrutura original)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.questionarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Dados pessoais
    whatsapp VARCHAR(50),
    dispositivo VARCHAR(50),
    idade_faixa VARCHAR(50),
    ja_conhecia TEXT,
    estado_civil VARCHAR(50),
    renda_mensal VARCHAR(100),
    nome_completo VARCHAR(255),
    email_cadastro VARCHAR(255),
    estado_residencia VARCHAR(100),

    -- Dados sobre menopausa e sintomas
    fase_menopausa VARCHAR(100),
    tempo_sintomas VARCHAR(100),
    principal_sintoma TEXT,
    categoria_sintomas TEXT,
    sintomas_identificados TEXT,
    intensidade_sintoma_principal VARCHAR(50),
    outros_sintomas_incomodam TEXT,
    impacto_sintomas_vida TEXT,
    impacto_sintomas_vida_outro TEXT,
    impacto_sintomas_relacionamento TEXT,
    impacto_sintomas_relacionamento_outro TEXT,
    fez_reposicao_hormonal TEXT,

    -- Qualificação e urgência
    urgencia_caso VARCHAR(50),
    urgencia_resolver VARCHAR(100),
    qualificacao_lead VARCHAR(50),
    pontuacao_total INTEGER,

    -- Dados comerciais
    valor_disposto_pagar TEXT,
    compra_online_experiencia VARCHAR(50),
    motivo_inscricao_evento TEXT,

    -- Metadados e origem
    tipo_questionario VARCHAR(50),
    origem VARCHAR(100) DEFAULT 'web',

    -- Métricas de tempo
    tempo_medio_resposta_ms INTEGER,
    tempo_total_questionario_ms INTEGER,
    tempo_medio_resposta_segundos INTEGER,
    tempo_total_questionario_minutos INTEGER,
    tempo_total_questionario_segundos INTEGER,
    pergunta_mais_lenta_texto TEXT,
    pergunta_mais_lenta_tempo_segundos INTEGER
);

-- =====================================================
-- 2. ESTRUTURA NORMALIZADA (leads, sintomas, respostas)
-- =====================================================

-- Tabela principal de leads
CREATE TABLE IF NOT EXISTS public.leads_menopausa (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Dados de contato
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(50) NOT NULL,
    idade INTEGER,
    
    -- Análise dos sintomas
    categoria_sintomas VARCHAR(100),
    pontuacao_total INTEGER,
    urgencia VARCHAR(20) CHECK (urgencia IN ('baixa', 'media', 'alta')),
    expectativa_melhora TEXT,
    
    -- Qualificação do lead
    score_qualificacao INTEGER,
    categoria_lead VARCHAR(20) CHECK (categoria_lead IN ('FRIO', 'MORNO', 'QUENTE', 'MUITO_QUENTE')),
    prioridade INTEGER CHECK (prioridade BETWEEN 1 AND 5),
    motivos_qualificacao TEXT,
    
    -- Métricas de comportamento
    tempo_total_questionario INTEGER, -- em milissegundos
    tempo_medio_resposta INTEGER, -- em milissegundos
    voltas_perguntas INTEGER DEFAULT 0,
    engajamento VARCHAR(10) CHECK (engajamento IN ('BAIXO', 'MEDIO', 'ALTO')),
    hesitacao_perguntas TEXT,
    
    -- Metadados
    user_agent TEXT,
    origem VARCHAR(100) DEFAULT 'questionario-menopausa-web',
    versao_questionario VARCHAR(10) DEFAULT '1.0',
    
    -- Status do lead
    status_contato VARCHAR(50) DEFAULT 'novo' CHECK (status_contato IN ('novo', 'contatado', 'agendado', 'convertido', 'perdido')),
    data_primeiro_contato TIMESTAMP WITH TIME ZONE,
    observacoes TEXT
);

-- Tabela de sintomas identificados
CREATE TABLE IF NOT EXISTS public.sintomas_identificados (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES leads_menopausa(id) ON DELETE CASCADE,
    nome_sintoma VARCHAR(255) NOT NULL,
    urgencia VARCHAR(20) CHECK (urgencia IN ('baixa', 'media', 'alta')),
    explicacao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de respostas detalhadas
CREATE TABLE IF NOT EXISTS public.respostas_questionario (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES leads_menopausa(id) ON DELETE CASCADE,
    pergunta_id VARCHAR(100) NOT NULL,
    resposta_texto TEXT NOT NULL,
    pontos INTEGER NOT NULL,
    tempo_resposta_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para tabela questionarios
CREATE INDEX IF NOT EXISTS idx_questionarios_email ON public.questionarios(email_cadastro);
CREATE INDEX IF NOT EXISTS idx_questionarios_tipo ON public.questionarios(tipo_questionario);
CREATE INDEX IF NOT EXISTS idx_questionarios_origem ON public.questionarios(origem);
CREATE INDEX IF NOT EXISTS idx_questionarios_qualificacao ON public.questionarios(qualificacao_lead);
CREATE INDEX IF NOT EXISTS idx_questionarios_created_at ON public.questionarios(created_at);

-- Índices para estrutura normalizada
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads_menopausa(email);
CREATE INDEX IF NOT EXISTS idx_leads_categoria ON leads_menopausa(categoria_lead);
CREATE INDEX IF NOT EXISTS idx_leads_prioridade ON leads_menopausa(prioridade);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads_menopausa(status_contato);
CREATE INDEX IF NOT EXISTS idx_leads_origem ON leads_menopausa(origem);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads_menopausa(created_at);
CREATE INDEX IF NOT EXISTS idx_sintomas_lead_id ON sintomas_identificados(lead_id);
CREATE INDEX IF NOT EXISTS idx_respostas_lead_id ON respostas_questionario(lead_id);

-- =====================================================
-- 4. TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para questionarios
DROP TRIGGER IF EXISTS update_questionarios_updated_at ON public.questionarios;
CREATE TRIGGER update_questionarios_updated_at
    BEFORE UPDATE ON public.questionarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para leads_menopausa
DROP TRIGGER IF EXISTS update_leads_menopausa_updated_at ON leads_menopausa;
CREATE TRIGGER update_leads_menopausa_updated_at 
    BEFORE UPDATE ON leads_menopausa 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.questionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads_menopausa ENABLE ROW LEVEL SECURITY;
ALTER TABLE sintomas_identificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE respostas_questionario ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir operações básicas
-- QUESTIONARIOS
CREATE POLICY "Permitir inserção questionarios" ON public.questionarios
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir leitura questionarios" ON public.questionarios
    FOR SELECT USING (true);

CREATE POLICY "Permitir atualização questionarios" ON public.questionarios
    FOR UPDATE USING (true);

-- LEADS_MENOPAUSA
CREATE POLICY "Permitir inserção leads" ON leads_menopausa
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir leitura leads" ON leads_menopausa
    FOR SELECT USING (true);

CREATE POLICY "Permitir atualização leads" ON leads_menopausa
    FOR UPDATE USING (true);

-- SINTOMAS_IDENTIFICADOS
CREATE POLICY "Permitir inserção sintomas" ON sintomas_identificados
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir leitura sintomas" ON sintomas_identificados
    FOR SELECT USING (true);

-- RESPOSTAS_QUESTIONARIO
CREATE POLICY "Permitir inserção respostas" ON respostas_questionario
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir leitura respostas" ON respostas_questionario
    FOR SELECT USING (true);

-- =====================================================
-- 6. VIEWS PARA DASHBOARD E RELATÓRIOS
-- =====================================================

-- View unificada para dashboard (compatibilidade com código existente)
CREATE OR REPLACE VIEW dashboard_leads AS
SELECT 
    -- Dados da tabela questionarios
    q.id,
    q.created_at,
    q.nome_completo as nome,
    q.email_cadastro as email,
    q.whatsapp as telefone,
    q.qualificacao_lead,
    q.pontuacao_total,
    q.origem,
    q.tipo_questionario,
    q.categoria_sintomas,
    q.urgencia_caso as urgencia,
    q.principal_sintoma,
    q.tempo_total_questionario_segundos,
    'questionarios' as fonte_dados
FROM public.questionarios q

UNION ALL

SELECT 
    -- Dados da tabela leads_menopausa
    l.id,
    l.created_at,
    l.nome,
    l.email,
    l.telefone,
    l.categoria_lead as qualificacao_lead,
    l.pontuacao_total,
    l.origem,
    'normalizado' as tipo_questionario,
    l.categoria_sintomas,
    l.urgencia,
    '' as principal_sintoma,
    (l.tempo_total_questionario / 1000) as tempo_total_questionario_segundos,
    'leads_menopausa' as fonte_dados
FROM leads_menopausa l;

-- View para relatórios de conversão
CREATE OR REPLACE VIEW relatorio_conversao AS
SELECT 
    DATE(created_at) as data,
    qualificacao_lead,
    COUNT(*) as total_leads,
    AVG(pontuacao_total) as pontuacao_media,
    origem,
    tipo_questionario
FROM dashboard_leads
GROUP BY DATE(created_at), qualificacao_lead, origem, tipo_questionario
ORDER BY data DESC;

-- View para métricas do dashboard
CREATE OR REPLACE VIEW metricas_dashboard AS
SELECT 
    COUNT(*) as total_leads,
    COUNT(CASE WHEN qualificacao_lead IN ('QUENTE', 'MUITO_QUENTE', 'quente', 'muito_quente') THEN 1 END) as leads_quentes,
    COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as leads_hoje,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as leads_semana,
    AVG(pontuacao_total) as pontuacao_media,
    COUNT(CASE WHEN origem = 'organico' THEN 1 END) as leads_organicos,
    COUNT(CASE WHEN origem = 'pago' THEN 1 END) as leads_pagos
FROM dashboard_leads;

-- =====================================================
-- 7. DADOS DE TESTE (OPCIONAL)
-- =====================================================

-- Inserir alguns dados de teste para verificar se tudo funciona
INSERT INTO public.questionarios (
    nome_completo, 
    email_cadastro, 
    whatsapp, 
    qualificacao_lead, 
    pontuacao_total, 
    origem, 
    tipo_questionario,
    categoria_sintomas,
    urgencia_caso
) VALUES 
(
    'Maria Silva (Teste)', 
    'maria.teste@example.com', 
    '11999999999', 
    'QUENTE', 
    85, 
    'organico', 
    'organico',
    'Sintomas Intensos',
    'alta'
),
(
    'Ana Santos (Teste)', 
    'ana.teste@example.com', 
    '11888888888', 
    'MORNO', 
    65, 
    'pago', 
    'pago',
    'Sintomas Moderados',
    'media'
),
(
    'Carla Oliveira (Teste)', 
    'carla.teste@example.com', 
    '11777777777', 
    'FRIO', 
    35, 
    'organico', 
    'organico',
    'Sintomas Leves',
    'baixa'
);

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se as tabelas foram criadas
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('questionarios', 'leads_menopausa', 'sintomas_identificados', 'respostas_questionario')
ORDER BY tablename;

-- Verificar se as views foram criadas
SELECT 
    schemaname,
    viewname,
    viewowner
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname IN ('dashboard_leads', 'relatorio_conversao', 'metricas_dashboard')
ORDER BY viewname;

-- Contar registros de teste
SELECT 
    'questionarios' as tabela,
    COUNT(*) as total_registros
FROM public.questionarios

UNION ALL

SELECT 
    'leads_menopausa' as tabela,
    COUNT(*) as total_registros
FROM leads_menopausa

UNION ALL

SELECT 
    'dashboard_leads (view)' as tabela,
    COUNT(*) as total_registros
FROM dashboard_leads;
