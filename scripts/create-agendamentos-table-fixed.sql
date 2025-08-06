-- Função para criar a tabela de agendamentos automaticamente
CREATE OR REPLACE FUNCTION create_agendamentos_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Criar tabela de agendamentos se não existir
    CREATE TABLE IF NOT EXISTS public.agendamentos (
        id BIGSERIAL PRIMARY KEY,
        data_agendamento DATE NOT NULL,
        horario_agendamento TIME NOT NULL,
        tipo_consulta VARCHAR(20) NOT NULL DEFAULT 'ORGANICO' CHECK (tipo_consulta IN ('ORGANICO', 'PAGO')),
        status VARCHAR(20) NOT NULL DEFAULT 'AGENDADO' CHECK (status IN ('AGENDADO', 'CONFIRMADO', 'CANCELADO', 'REALIZADO')),
        nome_paciente VARCHAR(255),
        email_paciente VARCHAR(255),
        telefone_paciente VARCHAR(20),
        observacoes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Criar índices para melhor performance
    CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON public.agendamentos(data_agendamento);
    CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON public.agendamentos(status);
    CREATE INDEX IF NOT EXISTS idx_agendamentos_tipo ON public.agendamentos(tipo_consulta);
    CREATE INDEX IF NOT EXISTS idx_agendamentos_created_at ON public.agendamentos(created_at);

    -- Criar constraint única para evitar duplo agendamento no mesmo horário
    ALTER TABLE public.agendamentos 
    DROP CONSTRAINT IF EXISTS unique_agendamento_horario;
    
    ALTER TABLE public.agendamentos 
    ADD CONSTRAINT unique_agendamento_horario 
    UNIQUE (data_agendamento, horario_agendamento);

    -- Habilitar RLS
    ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

    -- Remover políticas existentes
    DROP POLICY IF EXISTS "Permitir acesso total aos agendamentos" ON public.agendamentos;
    DROP POLICY IF EXISTS "Permitir leitura de agendamentos" ON public.agendamentos;
    DROP POLICY IF EXISTS "Permitir inserção de agendamentos" ON public.agendamentos;
    DROP POLICY IF EXISTS "Permitir atualização de agendamentos" ON public.agendamentos;

    -- Política para permitir leitura para usuários anônimos
    CREATE POLICY "Permitir leitura de agendamentos" ON public.agendamentos
        FOR SELECT USING (true);

    -- Política para permitir inserção para usuários anônimos
    CREATE POLICY "Permitir inserção de agendamentos" ON public.agendamentos
        FOR INSERT WITH CHECK (true);

    -- Política para permitir atualização para usuários anônimos
    CREATE POLICY "Permitir atualização de agendamentos" ON public.agendamentos
        FOR UPDATE USING (true);

    -- Conceder permissões para o usuário anônimo
    GRANT SELECT, INSERT, UPDATE ON public.agendamentos TO anon;
    GRANT USAGE, SELECT ON SEQUENCE public.agendamentos_id_seq TO anon;

    -- Inserir alguns dados de exemplo (opcional)
    INSERT INTO public.agendamentos (data_agendamento, horario_agendamento, tipo_consulta, status, nome_paciente, email_paciente, telefone_paciente, observacoes)
    VALUES 
        (CURRENT_DATE + INTERVAL '1 day', '09:00:00', 'ORGANICO', 'AGENDADO', 'Maria Silva', 'maria@email.com', '(11) 99999-9999', 'Primeira consulta'),
        (CURRENT_DATE + INTERVAL '1 day', '10:00:00', 'PAGO', 'CONFIRMADO', 'Ana Santos', 'ana@email.com', '(11) 88888-8888', 'Retorno'),
        (CURRENT_DATE + INTERVAL '2 days', '14:00:00', 'ORGANICO', 'AGENDADO', 'Carla Oliveira', 'carla@email.com', '(11) 77777-7777', 'Consulta de acompanhamento')
    ON CONFLICT DO NOTHING;

    -- Verificar se a tabela foi criada corretamente
    RAISE NOTICE 'Tabela agendamentos criada com sucesso!';
END;
$$;

-- Executar a função para criar a tabela
SELECT create_agendamentos_table();
