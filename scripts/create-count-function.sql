-- Função para contar questionários (contorna possíveis problemas de RLS)
CREATE OR REPLACE FUNCTION get_questionarios_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_count FROM questionarios;
    RETURN total_count;
END;
$$;

-- Dar permissão para usuários anônimos executarem a função
GRANT EXECUTE ON FUNCTION get_questionarios_count() TO anon;
GRANT EXECUTE ON FUNCTION get_questionarios_count() TO authenticated;
