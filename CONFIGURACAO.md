# Configuração Técnica — Estúdio de Mídias

> **Última Atualização:** Abril 2026 — VPS `187.127.3.62`.
> Automação completa via Bot Telegram e Banco PostgreSQL (Colunas em Inglês).

---

## 1. Banco de Dados PostgreSQL

| Parâmetro | Valor |
|-----------|-------|
| **Host** | `saleschannel_postgres` |
| **User/Owner** | `sellingvideos_user` |
| **Database** | `sellingvideos_db` |
| **Schema** | `core` |
| **Tabela Principal** | `core.orders` |

### Comandos Úteis (SSH)

**Verificar conexão e contagem de pedidos:**
```bash
docker exec -it saleschannel_postgres psql -U sellingvideos_user -d sellingvideos_db \
  -c "SELECT COUNT(*) FROM core.orders;"
```

**Rodar script de inicialização manual:**
```bash
docker exec -i saleschannel_postgres psql -U sellingvideos_user -d sellingvideos_db \
  < n8n-workflows/init-saleschannel.sql
```

---

## 2. Credentials no n8n

| Credencial | Tipo | Configuração |
|---|---|---|
| **PostgresEstudiodemidias** | `PostgreSQL` | Host: `saleschannel_postgres`, User: `sellingvideos_user`, DB: `sellingvideos_db` |
| **Mercado Pago - Access Token**| `Header Auth` | Name: `Authorization`, Value: `Bearer APP_USR-...` |
| **Gmail SMTP - Estúdio de Mídias** | `SMTP` | Host: `smtp.gmail.com`, Port: `465` (SSL), User: `estudiodemidias.admin@gmail.com`, Password: `Senha de App` |

---

## 3. Workflows (Arquivos JSON)

Importe os arquivos da pasta `n8n-workflows/` na seguinte ordem:

1. **WF1 — MP Pagamento Aprovado**: Gerencia IPN, cria código `invite_code` e envia e-mails.
2. **WF3 — Admin API**: Alimenta o painel admin. Defina sua `Admin Key` no nó de `If`.
3. **WF4 — Suporte**: Recebe dados de `suporte.html` e envia para `admin@estudiodemidias.com.br`.
4. **WF5 — Telegram Bot**: Valida códigos e gera links únicos.

---

## 4. Configuração do Bot do Telegram

### Ativação
1. **Token:** `8621371115:AAH26uR8zSLzaaYFpofhc5NuJ23Yg4Ss83E`.
2. **ID do Canal:** No **WF5**, nó "Gerar Link Temporário", insira o ID do canal (ex: `-100...`).
3. **Set Webhook:** Ative o bot executando esta URL no seu navegador:
   `https://api.telegram.org/bot8621371115:AAH26uR8zSLzaaYFpofhc5NuJ23Yg4Ss83E/setWebhook?url=URL_DO_WEBHOOK_TG_DO_N8N`

---

## 6. Configuração do Mercado Pago (Automática via API)

O projeto agora utiliza o **Checkout Pro via API**, o que elimina a necessidade de configurar URLs de retorno manualmente para cada link.

### 6.1 — Ativando o Checkout API
1. Importe o arquivo `n8n-workflows/WF6-checkout-api.json` no seu n8n.
2. Certifique-se de que a credencial `Mercado Pago - Access Token` está selecionada no nó "Criar Preferência MP".
3. No painel do Mercado Pago (Dados do Negócio), configure o seu **Nome Fantasia** como "Início" ou o nome que deseja que apareça no botão de retorno.
4. Ative o workflow.

### 6.2 — Workflow V3 (Pagamento + Merchant Order)
O arquivo `n8n-workflows/WF1-pagamento-aprovado.json` agora é a **versão V3**. 
- Ele suporta tanto notificações de `payment` quanto de `merchant_order`.
- Se ele receber um pedido, ele busca automaticamente os pagamentos vinculados e processa o que estiver aprovado.
- Isso evita que o fluxo pare caso o Mercado Pago envie o aviso de "Pedido" antes do aviso de "Pagamento".
Mesmo com o checkout automático, você ainda precisa configurar a IPN para que o n8n receba o aviso de pagamento aprovado:
1. Vá para o portal [Mercado Pago Developers](https://developers.mercadopago.com/panel).
2. Selecione sua aplicação e clique em **Notificações IPN**.
3. No campo **URL de Notificação**, insira:
   `https://n8n.saleschannel.com.br/webhook/mp-payment`
4. Marque o evento **Pagamentos** (payments) e salve.

---

## 7. Depuração (O que fazer se nada acontecer?)

1. **Erro ao Clicar no Botão:** Verifique o Console do Navegador (F12). Se houver erro de CORS, certifique-se de que o nó de resposta no n8n possui o header `Access-Control-Allow-Origin: *`.
2. **Checkout não abre:** Verifique as execuções do `WF6`. Se houver erro 401, o seu Access Token do Mercado Pago expirou ou foi revogado.
3. **Não redireciona após pagar:** O redirecionamento automático pelo Mercado Pago só ocorre se o pagamento for aprovado instantaneamente (Pix/Cartão). Para boletos, ele mostrará a tela de sucesso do MP.

---

## 8. Estrutura de URLs (Produção)

- **Landing Page:** `https://estudiodemidias.com.br`
- **Checkout API:** `https://n8n.saleschannel.com.br/webhook/checkout`
- **Webhook IPN:** `https://n8n.saleschannel.com.br/webhook/mp-payment`
- **Obrigado:** `https://estudiodemidias.com.br/obrigado.html`
