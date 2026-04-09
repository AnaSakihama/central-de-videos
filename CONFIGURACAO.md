# Configuração Técnica — SellingVideos

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
| **PostgreSQL - SalesChannel** | `PostgreSQL` | Host: `saleschannel_postgres`, User: `sellingvideos_user`, DB: `sellingvideos_db` |
| **Mercado Pago - Access Token**| `Header Auth` | Name: `Authorization`, Value: `Bearer APP_USR-...` |
| **Gmail SMTP - SalesChannel** | `SMTP` | Host: `smtp.gmail.com`, Port: `465` (SSL), User: `seu-gmail`, Password: `Senha de App` |

---

## 3. Workflows (Arquivos JSON)

Importe os arquivos da pasta `n8n-workflows/` na seguinte ordem:

1. **WF1 — MP Pagamento Aprovado**: Gerencia IPN, cria código `invite_code` e envia e-mails.
2. **WF3 — Admin API**: Alimenta o painel admin. Defina sua `Admin Key` no nó de `If`.
3. **WF4 — Suporte**: Recebe dados de `suporte.html` e envia para `admin@saleschannel.com.br`.
4. **WF5 — Telegram Bot**: Valida códigos e gera links únicos.

---

## 4. Configuração do Bot do Telegram

### Ativação
1. **Token:** `8621371115:AAH26uR8zSLzaaYFpofhc5NuJ23Yg4Ss83E`.
2. **ID do Canal:** No **WF5**, nó "Gerar Link Temporário", insira o ID do canal (ex: `-100...`).
3. **Set Webhook:** Ative o bot executando esta URL no seu navegador:
   `https://api.telegram.org/bot8621371115:AAH26uR8zSLzaaYFpofhc5NuJ23Yg4Ss83E/setWebhook?url=URL_DO_WEBHOOK_TG_DO_N8N`

---

## 5. Estrutura de URLs (Produção)

- **Landing Page:** `https://saleschannel.com.br/sellingvideos`
- **Painel Admin:** `https://saleschannel.com.br/sellingvideos/admin-panel`
- **API n8n:** `https://n8n.saleschannel.com.br`

> [!CAUTION]
> O certificado SSL é gerenciado pela Cloudflare (Origin Cert 15 anos). O NPM na VPS já está configurado. **NÃO** tente gerar certificados Let's Encrypt para o domínio `saleschannel.com.br`, pois causará erro de SSL.
