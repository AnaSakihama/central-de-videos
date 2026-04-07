# Configuração do Banco de Dados — SalesChannel

> **Atualizado em:** Março 2026 — controle de pedidos migrado de Google Sheets para **PostgreSQL**.

---

## 1. Pré-requisito: banco de dados PostgreSQL

O projeto utiliza o banco `shopee_db`, que já deve estar em execução no ambiente (container Docker ou servidor). Dados de conexão:

| Parâmetro | Valor |
|-----------|-------|
| Host | `db` |
| Porta | `5432` |
| Database | `shopee_db` |
| User | `shopee_user` |

---

## 2. Criar o Schema e a Tabela

Execute o script `n8n-workflows/init-saleschannel.sql` no banco:

```bash
psql -h db -U shopee_user -d shopee_db -f n8n-workflows/init-saleschannel.sql
```

Ou copie e cole o conteúdo em qualquer client (pgAdmin, DBeaver, etc.).

O script cria:
- **Schema:** `saleschannel`
- **Tabela:** `saleschannel.pedidos`
- **Índices** para filtros frequentes (`status_pedido`, `status_pagamento`, `criado_em`, `email`)

### Estrutura da Tabela

| Coluna | Tipo | Descrição |
|---|---|---|
| `order_id` | `TEXT` (PK) | ID do pagamento Mercado Pago |
| `nome` | `TEXT` | Nome do comprador |
| `email` | `TEXT` | E-mail do comprador |
| `telegram_username` | `TEXT` | @username do Telegram |
| `valor` | `NUMERIC(10,2)` | Valor pago (ex: `12.90`) |
| `status_pagamento` | `TEXT` | `aprovado` \| `recusado` \| `estornado` |
| `status_pedido` | `TEXT` | `novo` \| `link_enviado` \| `rejeitado` |
| `criado_em` | `TIMESTAMPTZ` | Data/hora da criação |
| `aprovado_em` | `TIMESTAMPTZ` | Data/hora da aprovação manual |
| `log_email` | `TEXT` | Log do envio de e-mail |

---

## 3. Criar a Credential PostgreSQL no n8n

1. No n8n: **Settings → Credentials → New Credential**
2. Tipo: **PostgreSQL**
3. Preencha:

| Campo | Valor |
|---|---|
| **Name** | `PostgreSQL - SalesChannel` |
| **Host** | `db` |
| **Database** | `shopee_db` |
| **User** | `shopee_user` |
| **Password** | `<sua senha>` |
| **Port** | `5432` |

4. Clique em **Save**

> **Importante:** O nome da credential deve ser exatamente `PostgreSQL - SalesChannel`, pois os workflows referenciam esse nome.

---

## 4. Configurar Credenciais Restantes no n8n

### Mercado Pago (HTTP Header Auth)

1. Tipo: `HTTP Header Auth`
2. Nome: `Mercado Pago - Access Token`
3. Header Name: `Authorization`
4. Header Value: `Bearer SEU_ACCESS_TOKEN_DE_PRODUCAO`
   - Obtenha em: [developers.mercadopago.com](https://developers.mercadopago.com)

### Gmail SMTP

1. Tipo: `SMTP`
2. Nome: `Gmail SMTP - SalesChannel`
3. Host: `smtp.gmail.com`
4. Port: `465` (SSL) ou `587` (TLS)
5. User: seu e-mail Gmail
6. Password: **Senha de App do Google** (NÃO sua senha normal)
   - Gere em: myaccount.google.com → Segurança → Senhas de app

---

## 5. Importar Workflows no n8n

1. No n8n: **Workflows → Novo → Importar do arquivo**
2. Importe `WF1-pagamento-aprovado.json`
3. Importe `WF3-admin-api.json`
4. Em cada workflow, abra os nós **PostgreSQL** e confirme que a credential `PostgreSQL - SalesChannel` está selecionada
5. Configure os e-mails (de/para) nos nós `emailSend`
6. No WF3, substitua `DEFINA_SUA_ADMIN_KEY_AQUI` por uma chave forte (ex: `sc_admin_2026_XXXXX`)
7. Ative os dois workflows

---

## 6. Configurar Webhook no Mercado Pago

1. Acesse [developers.mercadopago.com](https://developers.mercadopago.com)
2. Sua Aplicação → **Configurar notificações**
3. URL de notificação: `https://SEU_N8N_URL/webhook/mp-payment`
4. Marque o evento: ✅ **Pagamentos**
5. Salve

---

## 7. Configurar Admin Panel

Abra `admin-panel/app.js` e edite:
```javascript
const API_BASE = 'https://SEU_N8N_URL/webhook/admin'; // Sua URL n8n real
```

O painel lê os pedidos da API n8n, que por sua vez consulta a tabela `saleschannel.pedidos` no PostgreSQL.

---

## 8. Testar o Fluxo Completo

1. Use o **Sandbox do Mercado Pago** para fazer um pagamento de teste
2. Verifique se o webhook chegou no n8n (aba **Executions**)
3. Confirme o registro inserido no banco:
   ```sql
   SELECT * FROM saleschannel.pedidos ORDER BY criado_em DESC LIMIT 5;
   ```
4. Verifique o e-mail de confirmação na caixa do comprador de teste
5. Abra o painel admin e confirme que o pedido aparece
