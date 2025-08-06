-- Testar integração com Make - inserções que devem funcionar
BEGIN;

-- Teste 1: Inserção básica (deve funcionar)
INSERT INTO agendamentos (
    nome_paciente,
    whatsapp,
    data_agendamento,
    horario_agendamento,
    status,
    tipo_consulta
) VALUES (
    'Teste Make 1',
    '11999999999',
    '2025-01-20',
    '09:00',
    'AGUARDANDO_PAGAMENTO',
    'CONSULTA_PAGA'
);

-- Teste 2: Inserção com telefone_paciente NULL (deve funcionar)
INSERT INTO agendamentos (
    nome_paciente,
    telefone_paciente,
    whatsapp,
    email_paciente,
    data_agendamento,
    horario_agendamento,
    status,
    tipo_consulta,
    valor_consulta,
    payment_status,
    origem
) VALUES (
    'Ricardo Souza',
    NULL,  -- telefone_paciente pode ser NULL
    '42999374244',
    NULL,  -- email_paciente pode ser NULL
    '2025-08-08',
    '09:00',
    'AGUARDANDO_PAGAMENTO',
    'CONSULTA_PAGA',
    150.00,
    'AGUARDANDO_PAGAMENTO',
    'site'
);

-- Teste 3: Inserção apenas com telefone (deve funcionar)
INSERT INTO agendamentos (
    nome_paciente,
    telefone_paciente,
    data_agendamento,
    horario_agendamento
) VALUES (
    'João Silva',
    '11987654321',
    '2025-01-25',
    '15:00'
);

-- Teste 4: Inserção que deve falhar (sem nenhum contato)
-- Esta deve dar erro por causa da constraint check_contact_info
-- INSERT INTO agendamentos (
--     nome_paciente,
--     data_agendamento,
--     horario_agendamento
-- ) VALUES (
--     'Teste Sem Contato',
--     '2025-01-26',
--     '16:00'
-- );

COMMIT;

-- Verificar resultados
SELECT 
    id,
    nome_paciente,
    telefone_paciente,
    whatsapp,
    email_paciente,
    data_agendamento,
    horario_agendamento,
    status,
    created_at
FROM agendamentos 
WHERE nome_paciente LIKE 'Teste%' OR nome_paciente = 'Ricardo Souza' OR nome_paciente = 'João Silva'
ORDER BY created_at DESC;

-- Contar total de agendamentos
SELECT COUNT(*) as total_agendamentos FROM agendamentos;
