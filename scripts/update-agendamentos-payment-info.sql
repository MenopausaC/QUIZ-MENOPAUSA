-- Adiciona colunas para detalhes de pagamento na tabela de agendamentos
ALTER TABLE public.agendamentos
ADD COLUMN IF NOT EXISTS valor_pago NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50);

-- Adiciona comentários para as novas colunas para clareza
COMMENT ON COLUMN public.agendamentos.valor_pago IS 'Valor que foi efetivamente pago pela consulta.';
COMMENT ON COLUMN public.agendamentos.payment_id IS 'O ID da transação retornado pelo gateway de pagamento.';
COMMENT ON COLUMN public.agendamentos.payment_status IS 'O status do pagamento (ex: approved, completed, failed).';

-- Garante que a coluna de status aceite 'CONFIRMADO'
-- A estrutura atual já suporta isso, então nenhuma alteração é necessária aqui.
