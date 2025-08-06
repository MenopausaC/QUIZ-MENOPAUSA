# Configuração Make.com + Supabase - CORRIGIDA

## 🎯 Problema Resolvido
O erro "null value in column telefone_paciente violates not-null constraint" foi corrigido.

## 📋 Estrutura da Tabela Corrigida

### Campos Obrigatórios (NOT NULL):
- `id` - UUID (gerado automaticamente)
- `nome_paciente` - TEXT
- `data_agendamento` - DATE
- `horario_agendamento` - TIME
- `status` - TEXT (default: 'AGENDADO')
- `tipo_consulta` - TEXT (default: 'CONSULTA_PAGA')
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP

### Campos Opcionais (PODEM SER NULL):
- `telefone_paciente` - TEXT
- `whatsapp` - TEXT
- `email_paciente` - TEXT
- `observacoes` - TEXT
- `valor_consulta` - DECIMAL (default: 150.00)
- `payment_id` - TEXT
- `payment_status` - TEXT (default: 'AGUARDANDO_PAGAMENTO')
- `qualificacao_lead` - TEXT (default: 'qualificado')
- `origem` - TEXT (default: 'site')

### Constraint de Validação:
\`\`\`sql
CONSTRAINT check_contact_info CHECK (
    telefone_paciente IS NOT NULL OR 
    whatsapp IS NOT NULL OR 
    email_paciente IS NOT NULL
)
\`\`\`

## 🔧 Configuração no Make.com

### 1. Webhook Trigger
Configure o webhook para receber os dados do agendamento:

**URL do Webhook:** `https://hook.make.com/seu-webhook-id`

**Dados Recebidos:**
\`\`\`json
{
  "id": "agendamento_1234567890",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "nome_completo": "Maria Silva",
  "whatsapp": "11999999999",
  "data_agendamento": "2024-01-20",
  "horario_agendamento": "09:00",
  "data_formatada": "sábado, 20 de janeiro de 2024",
  "status_compra": "AGUARDANDO_COMPRA",
  "tipo_consulta": "CONSULTA_PAGA",
  "valor_consulta": 150.00,
  "status": "AGENDADO",
  "origem": "site_agendamento"
}
\`\`\`

### 2. Módulo Supabase - Insert a Record

**Configuração dos Campos:**

| Campo Supabase | Valor do Make | Obrigatório |
|----------------|---------------|-------------|
| `nome_paciente` | `{{1.nome_completo}}` | ✅ SIM |
| `telefone_paciente` | `{{1.whatsapp}}` | ❌ NÃO |
| `whatsapp` | `{{1.whatsapp}}` | ❌ NÃO |
| `email_paciente` | *deixar vazio* | ❌ NÃO |
| `data_agendamento` | `{{1.data_agendamento}}` | ✅ SIM |
| `horario_agendamento` | `{{1.horario_agendamento}}` | ✅ SIM |
| `status` | `AGUARDANDO_PAGAMENTO` | ✅ SIM |
| `tipo_consulta` | `{{1.tipo_consulta}}` | ✅ SIM |
| `valor_consulta` | `{{1.valor_consulta}}` | ❌ NÃO |
| `payment_status` | `AGUARDANDO_PAGAMENTO` | ❌ NÃO |
| `origem` | `{{1.origem}}` | ❌ NÃO |

### 3. Configurações Importantes

**⚠️ ATENÇÃO:**
- **NÃO** deixe campos obrigatórios vazios
- **PODE** deixar campos opcionais vazios (serão NULL)
- **SEMPRE** preencha pelo menos um contato (telefone, whatsapp ou email)

**✅ Configuração Correta:**
\`\`\`
nome_paciente: {{1.nome_completo}}
telefone_paciente: {{1.whatsapp}}
whatsapp: {{1.whatsapp}}
email_paciente: [DEIXAR VAZIO]
data_agendamento: {{1.data_agendamento}}
horario_agendamento: {{1.horario_agendamento}}
status: AGUARDANDO_PAGAMENTO
\`\`\`

**❌ Configuração Incorreta:**
\`\`\`
nome_paciente: [VAZIO] ← ERRO!
telefone_paciente: [VAZIO]
whatsapp: [VAZIO] 
email_paciente: [VAZIO] ← ERRO! Pelo menos um contato é obrigatório
\`\`\`

## 🧪 Teste da Configuração

### 1. Dados de Teste
Use estes dados para testar:

\`\`\`json
{
  "nome_completo": "Teste Make",
  "whatsapp": "11999999999",
  "data_agendamento": "2025-01-20",
  "horario_agendamento": "09:00",
  "tipo_consulta": "CONSULTA_PAGA",
  "valor_consulta": 150.00,
  "origem": "site"
}
\`\`\`

### 2. Verificação no Supabase
Após executar o cenário, verifique no Supabase:

\`\`\`sql
SELECT * FROM agendamentos 
WHERE nome_paciente = 'Teste Make' 
ORDER BY created_at DESC;
\`\`\`

## 🔍 Troubleshooting

### Erro: "null value violates not-null constraint"
**Causa:** Campo obrigatório está vazio
**Solução:** Verifique se todos os campos obrigatórios estão preenchidos

### Erro: "check constraint check_contact_info"
**Causa:** Nenhum contato foi fornecido
**Solução:** Preencha pelo menos um: telefone_paciente, whatsapp ou email_paciente

### Erro: "invalid input syntax for type date"
**Causa:** Formato de data incorreto
**Solução:** Use formato YYYY-MM-DD (ex: 2025-01-20)

### Erro: "invalid input syntax for type time"
**Causa:** Formato de horário incorreto
**Solução:** Use formato HH:MM (ex: 09:00)

## 📊 Monitoramento

### Logs do Make
Monitore os logs para verificar:
- ✅ Webhook recebido com sucesso
- ✅ Dados inseridos no Supabase
- ❌ Erros de validação

### Logs do Supabase
Verifique no SQL Editor:
\`\`\`sql
-- Contar agendamentos por status
SELECT status, COUNT(*) 
FROM agendamentos 
GROUP BY status;

-- Últimos agendamentos
SELECT nome_paciente, data_agendamento, status, created_at
FROM agendamentos 
ORDER BY created_at DESC 
LIMIT 10;
\`\`\`

## ✅ Checklist Final

- [ ] Tabela `agendamentos` criada com estrutura correta
- [ ] Constraints NOT NULL removidas dos campos opcionais
- [ ] Constraint de contato configurada
- [ ] Webhook configurado no Make
- [ ] Módulo Supabase configurado corretamente
- [ ] Teste realizado com sucesso
- [ ] Monitoramento ativo

**🎉 Configuração completa e funcional!**
