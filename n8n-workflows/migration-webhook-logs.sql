-- ====================================================================
-- Migração: Garantir Unicidade de Envios de E-mail
-- ====================================================================

-- 1. Garantir que a tabela existe
CREATE TABLE IF NOT EXISTS core.webhook_logs (
  order_id     TEXT        NOT NULL,
  event_type   TEXT,
  action_taken TEXT        NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Limpar registros duplicados existentes (deixando apenas um por order_id + action_taken)
DELETE FROM core.webhook_logs a
USING core.webhook_logs b
WHERE a.ctid < b.ctid
  AND a.order_id = b.order_id
  AND a.action_taken = b.action_taken;

-- 3. Adicionar constraint UNIQUE se ela não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'unique_order_action'
    ) THEN
        ALTER TABLE core.webhook_logs 
        ADD CONSTRAINT unique_order_action UNIQUE (order_id, action_taken);
    END IF;
END $$;
