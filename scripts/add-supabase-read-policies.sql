-- Enable RLS on tables if not already enabled
ALTER TABLE leads_menopausa ENABLE ROW LEVEL SECURITY;
ALTER TABLE sintomas_identificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE respostas_questionario ENABLE ROW LEVEL SECURITY;

-- Grant SELECT permissions to anon role for leads_menopausa table
CREATE POLICY IF NOT EXISTS "Allow anon to read leads_menopausa" 
ON leads_menopausa 
FOR SELECT 
TO anon 
USING (true);

-- Grant SELECT permissions to anon role for sintomas_identificados table
CREATE POLICY IF NOT EXISTS "Allow anon to read sintomas_identificados" 
ON sintomas_identificados 
FOR SELECT 
TO anon 
USING (true);

-- Grant SELECT permissions to anon role for respostas_questionario table
CREATE POLICY IF NOT EXISTS "Allow anon to read respostas_questionario" 
ON respostas_questionario 
FOR SELECT 
TO anon 
USING (true);

-- Grant INSERT permissions to anon role for leads_menopausa table
CREATE POLICY IF NOT EXISTS "Allow anon to insert leads_menopausa" 
ON leads_menopausa 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Grant INSERT permissions to anon role for sintomas_identificados table
CREATE POLICY IF NOT EXISTS "Allow anon to insert sintomas_identificados" 
ON sintomas_identificados 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Grant INSERT permissions to anon role for respostas_questionario table
CREATE POLICY IF NOT EXISTS "Allow anon to insert respostas_questionario" 
ON respostas_questionario 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('leads_menopausa', 'sintomas_identificados', 'respostas_questionario')
ORDER BY tablename, policyname;
