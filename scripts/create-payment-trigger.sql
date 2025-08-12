-- Criar função para atualizar status do lead quando pagamento for confirmado
CREATE OR REPLACE FUNCTION update_lead_status_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Se pagamento_confirmado mudou de false/null para true
  IF (OLD.pagamento_confirmado IS DISTINCT FROM NEW.pagamento_confirmado) 
     AND NEW.pagamento_confirmado = true THEN
    
    -- Atualizar status_lead para 'CONFIRMADO'
    NEW.status_lead = 'CONFIRMADO';
    
    -- Atualizar payment_status para 'PAID' se ainda estiver PENDING
    IF NEW.payment_status = 'PENDING' THEN
      NEW.payment_status = 'PAID';
    END IF;
    
    -- Atualizar data de confirmação
    NEW.updated_at = NOW();
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger que executa antes de UPDATE na tabela agendamentos
DROP TRIGGER IF EXISTS trigger_update_lead_status_on_payment ON agendamentos;

CREATE TRIGGER trigger_update_lead_status_on_payment
  BEFORE UPDATE ON agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_status_on_payment();

-- Verificar se as colunas existem, se não, criar
DO $$
BEGIN
  -- Verificar se coluna status_lead existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'agendamentos' AND column_name = 'status_lead'
  ) THEN
    ALTER TABLE agendamentos ADD COLUMN status_lead TEXT;
  END IF;
  
  -- Verificar se coluna pagamento_confirmado existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'agendamentos' AND column_name = 'pagamento_confirmado'
  ) THEN
    ALTER TABLE agendamentos ADD COLUMN pagamento_confirmado BOOLEAN DEFAULT false;
  END IF;
  
  -- Verificar se coluna payment_status existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'agendamentos' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE agendamentos ADD COLUMN payment_status TEXT DEFAULT 'PENDING';
  END IF;
END $$;

-- Testar o trigger com um update de exemplo (comentado)
-- UPDATE agendamentos SET pagamento_confirmado = true WHERE id = 1;

-- Verificar se o trigger foi criado
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table, 
  action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_update_lead_status_on_payment';
