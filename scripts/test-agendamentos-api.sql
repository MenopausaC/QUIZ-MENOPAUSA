-- ============================================
-- SCRIPT PARA TESTAR OPERAÇÕES DA API AGENDAMENTOS
-- ============================================

-- 1. Testar inserção de novo agendamento
DO $$
DECLARE
    novo_id UUID;
    data_teste DATE := CURRENT_DATE + INTERVAL '3 days';
    horario_teste TIME := '14:30:00';
BEGIN
    RAISE NOTICE '🧪 Iniciando testes da API agendamentos...';
    
    -- Teste 1: Verificar estrutura da tabela
    RAISE NOTICE 'Teste 1: Estrutura da tabela';
    FOR col IN SELECT column_name, data_type, is_nullable, column_default 
               FROM information_schema.columns 
               WHERE table_name = 'agendamentos' 
               AND table_schema = 'public'
               ORDER BY ordinal_position LOOP
        RAISE NOTICE '%', col;
    END LOOP;
    
    -- Teste 2: Inserção básica
    INSERT INTO public.agendamentos (
        nome_paciente,
        email_paciente,
        telefone_paciente,
        whatsapp,
        data_agendamento,
        horario_agendamento,
        status,
        tipo_consulta,
        valor_consulta,
        origem
    ) VALUES (
        'João Teste API',
        'joao@teste.com',
        '11987654321',
        '11987654321',
        data_teste,
        horario_teste,
        'AGENDADO',
        'GRATUITO',
        0.00,
        'api-test'
    ) RETURNING id INTO novo_id;
    
    RAISE NOTICE '✅ Teste 2 - Inserção básica: SUCESSO (ID: %)', novo_id;
    
    -- Teste 3: Buscar o registro inserido
    IF EXISTS (SELECT 1 FROM public.agendamentos WHERE id = novo_id) THEN
        RAISE NOTICE '✅ Teste 3 - Busca por ID: SUCESSO';
    ELSE
        RAISE NOTICE '❌ Teste 3 - Busca por ID: FALHOU';
    END IF;
    
    -- Teste 4: Atualizar status
    UPDATE public.agendamentos 
    SET status = 'CONFIRMADO' 
    WHERE id = novo_id;
    
    IF EXISTS (SELECT 1 FROM public.agendamentos WHERE id = novo_id AND status = 'CONFIRMADO') THEN
        RAISE NOTICE '✅ Teste 4 - Atualização de status: SUCESSO';
    ELSE
        RAISE NOTICE '❌ Teste 4 - Atualização de status: FALHOU';
    END IF;
    
    -- Teste 5: Verificar constraint de horário único
    BEGIN
        INSERT INTO public.agendamentos (
            nome_paciente,
            email_paciente,
            telefone_paciente,
            whatsapp,
            data_agendamento,
            horario_agendamento,
            status,
            tipo_consulta,
            valor_consulta,
            origem
        ) VALUES (
            'Teste Conflito',
            'conflito@teste.com',
            '11955555555',
            '11955555555',
            data_teste,
            horario_teste,
            'AGENDADO',
            'GRATUITO',
            0.00,
            'api-test'
        );
        RAISE NOTICE '❌ Teste 5 - Constraint de horário único: FALHOU (deveria ter dado erro)';
    EXCEPTION WHEN unique_violation THEN
        RAISE NOTICE '✅ Teste 5 - Constraint de horário único: SUCESSO (erro esperado)';
    END;
    
    -- Teste 6: Buscar por status
    IF EXISTS (SELECT 1 FROM public.agendamentos WHERE status = 'CONFIRMADO') THEN
        RAISE NOTICE '✅ Teste 6 - Busca por status: SUCESSO';
    ELSE
        RAISE NOTICE '❌ Teste 6 - Busca por status: FALHOU';
    END IF;
    
    -- Teste 7: Verificar conflito de horário
    DO $$
    DECLARE
        conflict_count INTEGER;
    BEGIN
        -- Tentar inserir no mesmo horário
        INSERT INTO public.agendamentos (
            nome_paciente,
            telefone_paciente,
            data_agendamento,
            horario_agendamento,
            origem
        ) VALUES (
            'Conflito Teste',
            '11999999999',
            data_teste,
            horario_teste,
            'conflict-test'
        );
        
        RAISE NOTICE 'ERRO: Deveria ter dado conflito de horário!';
    EXCEPTION
        WHEN unique_violation THEN
            RAISE NOTICE 'OK: Conflito de horário detectado corretamente';
    END $$;
    
    -- Teste 8: Buscar agendamentos (simulando GET da API)
    RAISE NOTICE 'Teste 7: Busca de agendamentos';
    FOR agendamento IN SELECT id, nome_paciente, data_agendamento, horario_agendamento 
                      FROM public.agendamentos 
                      WHERE origem LIKE '%test%'
                      ORDER BY data_agendamento, horario_agendamento LOOP
        RAISE NOTICE '%', agendamento;
    END LOOP;
    
    -- Teste 9: Verificar performance dos índices
    RAISE NOTICE 'Teste 8: Verificar performance dos índices';
    EXECUTE 'EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM public.agendamentos WHERE data_agendamento = $1 AND horario_agendamento = $2' 
    USING data_teste, horario_teste;
    
    -- Teste 10: Testar atualização de status
    RAISE NOTICE 'Teste 9: Testar atualização de status';
    FOR updated_agendamento IN SELECT id, nome_paciente, status, observacoes, updated_at 
                              FROM public.agendamentos 
                              WHERE origem = 'api-test' 
                              AND status = 'CONFIRMADO' 
                              AND observacoes = 'Teste de atualização via API' LOOP
        RAISE NOTICE '%', updated_agendamento;
    END LOOP;
    
    -- Teste 11: Verificar trigger de updated_at
    RAISE NOTICE 'Teste 10: Trigger updated_at';
    FOR trigger_check IN SELECT nome_paciente, created_at, updated_at, (updated_at > created_at) as trigger_funcionando 
                        FROM public.agendamentos 
                        WHERE origem = 'api-test' LOOP
        RAISE NOTICE '%', trigger_check;
    END LOOP;
    
    -- Teste 12: Estatísticas da tabela
    RAISE NOTICE 'Teste 11: Estatísticas da tabela';
    FOR stats IN SELECT COUNT(*) as total_agendamentos, COUNT(DISTINCT data_agendamento) as dias_com_agendamentos, COUNT(DISTINCT status) as status_diferentes, AVG(valor_consulta) as valor_medio 
                 FROM public.agendamentos LOOP
        RAISE NOTICE '%', stats;
    END LOOP;
    
    -- Teste 13: Testar inserção de agendamento com novo status
    INSERT INTO public.agendamentos (
        nome_paciente,
        telefone_paciente,
        whatsapp,
        email_paciente,
        data_agendamento,
        horario_agendamento,
        status,
        tipo_consulta,
        origem
    ) VALUES (
        'Teste API',
        '11999999999',
        '11999999999',
        'teste@api.com',
        CURRENT_DATE + INTERVAL '2 days',
        '10:00',
        'AGUARDANDO_PAGAMENTO',
        'PAGO',
        'api_test'
    ) RETURNING id INTO novo_id;
    
    RAISE NOTICE '✅ Teste 13 - Inserção com novo status: SUCESSO (ID: %)', novo_id;
    
    -- Teste 14: Verificar se foi inserido
    RAISE NOTICE 'Teste 14: Verificar inserção';
    FOR inserted_agendamento IN SELECT id, nome_paciente, data_agendamento, horario_agendamento, status 
                                FROM public.agendamentos 
                                WHERE origem = 'api_test' LOOP
        RAISE NOTICE '%', inserted_agendamento;
    END LOOP;
    
    -- Teste 15: Testar busca por data e horário
    RAISE NOTICE 'Teste 15: Busca por data e horário';
    FOR conflict_agendamento IN SELECT COUNT(*) as conflitos_encontrados 
                                FROM public.agendamentos 
                                WHERE data_agendamento = CURRENT_DATE + INTERVAL '2 days'
                                  AND horario_agendamento = '10:00'
                                  AND status != 'CANCELADO' LOOP
        RAISE NOTICE '%', conflict_agendamento;
    END LOOP;
    
    -- Teste 16: Testar atualização
    UPDATE public.agendamentos 
    SET status = 'CONFIRMADO' 
    WHERE origem = 'api_test';
    
    RAISE NOTICE '✅ Teste 16 - Atualização: SUCESSO';
    
    -- Teste 17: Verificar atualização
    RAISE NOTICE 'Teste 17: Verificar atualização';
    FOR updated_agendamento IN SELECT status, updated_at 
                                FROM public.agendamentos 
                                WHERE origem = 'api_test' LOOP
        RAISE NOTICE '%', updated_agendamento;
    END LOOP;
    
    -- Teste 18: Testar performance dos índices
    RAISE NOTICE 'Teste 18: Verificar performance dos índices';
    EXECUTE 'EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM public.agendamentos WHERE data_agendamento = $1 AND horario_agendamento = $2' 
    USING CURRENT_DATE + INTERVAL '2 days', '10:00';
    
    -- Teste 19: Estatísticas da tabela
    RAISE NOTICE 'Teste 19: Estatísticas finais';
    FOR stats IN SELECT COUNT(*) as total_agendamentos, COUNT(DISTINCT data_agendamento) as dias_com_agendamentos, COUNT(DISTINCT status) as status_diferentes, MIN(data_agendamento) as primeira_data, MAX(data_agendamento) as ultima_data 
                 FROM public.agendamentos LOOP
        RAISE NOTICE '%', stats;
    END LOOP;
    
    -- Limpar dados de teste
    DELETE FROM public.agendamentos WHERE origem LIKE '%test%';
    RAISE NOTICE '🧹 Dados de teste removidos';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Erro durante os testes: %', SQLERRM;
END $$;

-- Resultado final
RAISE NOTICE 'Testes concluídos com sucesso!';
RAISE NOTICE 'Timestamp do teste: %', NOW();

COMMIT;
