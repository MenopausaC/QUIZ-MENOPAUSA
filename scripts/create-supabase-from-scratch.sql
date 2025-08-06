-- =============================================
-- CONFIGURAÇÃO COMPLETA DO SUPABASE DO ZERO
-- =============================================

-- 1. CRIAR TABELA QUESTIONARIOS
CREATE TABLE questionarios (
    -- Chave primária
    id BIGSERIAL PRIMARY KEY,
    
    -- Dados pessoais
    nome_completo TEXT,
    email_cadastro TEXT,
    whatsapp TEXT,
    idade_faixa TEXT,
    estado_residencia TEXT,
    estado_civil TEXT,
    renda_mensal TEXT,
    
    -- Dados sobre menopausa
    fase_menopausa TEXT,
    principal_sintoma TEXT,
    principal_sintoma_outro TEXT,
    intensidade_sintoma_principal TEXT,
    outros_sintomas_incomodam TEXT,
    outros_sintomas_incomodam_outro TEXT,
    tempo_sintomas TEXT,
    impacto_sintomas_vida TEXT,
    impacto_sintomas_vida_outro TEXT,
    impacto_sintomas_relacionamento TEXT,
    impacto_sintomas_relacionamento_outro TEXT,
    urgencia_resolver TEXT,
    fez_reposicao_hormonal TEXT,
    
    -- Dados sobre evento/produto
    motivo_inscricao_evento TEXT,
    valor_disposto_pagar TEXT,
    compra_online_experiencia TEXT,
    ja_conhecia TEXT,
    
    -- Dados de qualificação
    pontuacao_total INTEGER DEFAULT 0,
    qualificacao_lead TEXT,
    categoria_sintomas TEXT,
    urgencia_caso TEXT,
    sintomas_identificados TEXT,
    
    -- Dados técnicos de tempo
    tempo_total_questionario_ms BIGINT,
    tempo_total_questionario_segundos INTEGER,
    tempo_total_questionario_minutos INTEGER,
    tempo_medio_resposta_ms BIGINT,
    tempo_medio_resposta_segundos INTEGER,
    pergunta_mais_lenta_id TEXT,
    pergunta_mais_lenta_texto TEXT,
    pergunta_mais_lenta_tempo_ms BIGINT,
    pergunta_mais_lenta_tempo_segundos INTEGER,
    
    -- Dados de engajamento
    total_perguntas INTEGER,
    perguntas_respondidas INTEGER,
    taxa_completude DECIMAL(5,2),
    engajamento TEXT,
    
    -- Dados de origem
    tipo_questionario TEXT DEFAULT 'ORGANICO',
    dispositivo TEXT,
    origem TEXT DEFAULT 'questionario-web',
    user_agent TEXT,
    versao_questionario TEXT DEFAULT '3.4',
    
    -- Timestamps
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    data_envio TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CRIAR FUNÇÃO PARA ATUALIZAR TIMESTAMP
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. CRIAR TRIGGER PARA UPDATED_AT
CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON questionarios
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

-- 4. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX idx_questionarios_email ON questionarios(email_cadastro);
CREATE INDEX idx_questionarios_tipo ON questionarios(tipo_questionario);
CREATE INDEX idx_questionarios_qualificacao ON questionarios(qualificacao_lead);
CREATE INDEX idx_questionarios_created_at ON questionarios(created_at);
CREATE INDEX idx_questionarios_data_envio ON questionarios(data_envio);
CREATE INDEX idx_questionarios_whatsapp ON questionarios(whatsapp);
CREATE INDEX idx_questionarios_nome ON questionarios(nome_completo);

-- 5. HABILITAR RLS
ALTER TABLE questionarios ENABLE ROW LEVEL SECURITY;

-- 6. CRIAR POLÍTICAS RLS PARA USUÁRIOS ANÔNIMOS
CREATE POLICY "Permitir inserção anônima" ON questionarios
    FOR INSERT TO anon
    WITH CHECK (true);

CREATE POLICY "Permitir leitura anônima" ON questionarios
    FOR SELECT TO anon
    USING (true);

-- 7. CRIAR POLÍTICAS RLS PARA USUÁRIOS AUTENTICADOS
CREATE POLICY "Permitir inserção autenticada" ON questionarios
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Permitir leitura autenticada" ON questionarios
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Permitir atualização autenticada" ON questionarios
    FOR UPDATE TO authenticated
    USING (true);

-- 8. INSERIR DADOS DE TESTE
INSERT INTO questionarios (
    nome_completo,
    email_cadastro,
    whatsapp,
    idade_faixa,
    tipo_questionario,
    qualificacao_lead,
    pontuacao_total,
    origem
) VALUES 
(
    'Teste Orgânico',
    'teste.organico@exemplo.com',
    '(11) 99999-0001',
    '45-50 anos',
    'ORGANICO',
    'QUENTE',
    65,
    'teste-sistema'
),
(
    'Teste Pago',
    'teste.pago@exemplo.com',
    '(11) 99999-0002',
    '50-55 anos',
    'PAGO',
    'MUITO_QUENTE',
    85,
    'teste-sistema'
);

-- 9. VERIFICAR CONFIGURAÇÃO
SELECT 
    'Tabela criada com sucesso!' as status,
    COUNT(*) as total_registros
FROM questionarios;

-- 10. MOSTRAR ESTRUTURA DA TABELA
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'questionarios' 
ORDER BY ordinal_position;

-- 11. VERIFICAR POLÍTICAS RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'questionarios';

-- 12. VERIFICAR ÍNDICES
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'questionarios';

SELECT 'Configuração do Supabase concluída com sucesso!' as resultado;
