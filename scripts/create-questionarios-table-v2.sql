-- scripts/create-questionarios-table-v2.sql
-- Este script cria a tabela 'questionarios' com a estrutura baseada nos dados fornecidos.
-- Execute este script no SQL Editor do Supabase se a tabela 'questionarios' ainda não existir
-- ou se você precisar atualizar sua estrutura para incluir todos esses campos.

CREATE TABLE IF NOT EXISTS public.questionarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    whatsapp VARCHAR(50),
    dispositivo VARCHAR(50),
    idade_faixa VARCHAR(50),
    ja_conhecia TEXT,
    estado_civil VARCHAR(50),
    renda_mensal VARCHAR(100),
    nome_completo VARCHAR(255),
    urgencia_caso VARCHAR(50),
    email_cadastro VARCHAR(255),
    fase_menopausa VARCHAR(100),
    tempo_sintomas VARCHAR(100),
    pontuacao_total INTEGER,
    estado_residencia VARCHAR(100),
    principal_sintoma TEXT,
    qualificacao_lead VARCHAR(50),
    tipo_questionario VARCHAR(50),
    urgencia_resolver VARCHAR(100),
    categoria_sintomas TEXT,
    valor_disposto_pagar TEXT,
    impacto_sintomas_vida TEXT,
    fez_reposicao_hormonal TEXT,
    sintomas_identificados TEXT, -- Assumindo que é uma string separada por vírgulas
    motivo_inscricao_evento TEXT,
    tempo_medio_resposta_ms INTEGER,
    compra_online_experiencia VARCHAR(50),
    outros_sintomas_incomodam TEXT,
    pergunta_mais_lenta_texto TEXT,
    impacto_sintomas_vida_outro TEXT,
    tempo_total_questionario_ms INTEGER,
    intensidade_sintoma_principal VARCHAR(50),
    tempo_medio_resposta_segundos INTEGER,
    impacto_sintomas_relacionamento TEXT,
    tempo_total_questionario_minutos INTEGER,
    tempo_total_questionario_segundos INTEGER,
    pergunta_mais_lenta_tempo_segundos INTEGER,
    impacto_sintomas_relacionamento_outro TEXT
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_questionarios_email ON public.questionarios(email_cadastro);
CREATE INDEX IF NOT EXISTS idx_questionarios_tipo ON public.questionarios(tipo_questionario);
CREATE INDEX IF NOT EXISTS idx_questionarios_created_at ON public.questionarios(created_at);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column_questionarios_trigger()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_questionarios_updated_at
    BEFORE UPDATE ON public.questionarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column_questionarios_trigger();
