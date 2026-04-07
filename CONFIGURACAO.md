# Configuração — sellingvideos (ex-SalesChannel)

> **Atualizado em:** Abril 2026 — migrado para nova VPS `187.127.3.62` com Cloudflare Tunnel.

---

## Arquitetura

```
Mercado Pago (webhook)
        ↓
https://n8n.saleschannel.com.br   ← Cloudflare Tunnel → saleschannel_n8n:5678
        ↓
saleschannel_postgres (PostgreSQL)
        ↓
https://saleschannel.com.br/sellingvideos  ← NPM → saleschannel_portal → admin-panel/
```

---

## 1. Banco de Dados PostgreSQL

| Parâmetro | Valor |
|-----------|-------|
| Container/Host | `saleschannel_postgres` |
| Porta | `5432` |
| Database | `shopee_db` *(confirmar após migração)* |
| User | `shopee_user` |

**Verificar tabela migrada:**
```sql
SELECT COUNT(*) FROM saleschannel.pedidos;
```

**Se precisar criar do zero:**
```bash
docker exec -i saleschannel_postgres psql -U shopee_user -d shopee_db \
  < /root/apps/saleschannel/products/sellingvideos/n8n-workflows/init-saleschannel.sql
```

---

## 2. Credenciais no n8n

### PostgreSQL
| Campo | Valor |
|---|---|
| **Name** | `PostgreSQL - SalesChannel` |
| **Host** | `saleschannel_postgres` |
| **Database** | `shopee_db` |
| **User** | `shopee_user` |
| **Password** | `<conforme .env>` |
| **Port** | `5432` |

> O nome da credential deve ser exatamente `PostgreSQL - SalesChannel`.

### Mercado Pago (HTTP Header Auth)
| Campo | Valor |
|---|---|
| **Name** | `Mercado Pago - Access Token` |
| **Header Name** | `Authorization` |
| **Header Value** | `Bearer SEU_ACCESS_TOKEN_DE_PRODUCAO` |

Obtenha em: [developers.mercadopago.com](https://developers.mercadopago.com)

### Gmail SMTP
| Campo | Valor |
|---|---|
| **Name** | `Gmail SMTP - SalesChannel` |
| **Host** | `smtp.gmail.com` |
| **Port** | `465` (SSL) |
| **User** | seu e-mail Gmail |
| **Password** | Senha de App do Google |

Gere em: myaccount.google.com → Segurança → Senhas de app

---

## 3. Importar Workflows no n8n

1. Acesse `https://n8n.saleschannel.com.br`
2. **Workflows → Importar do arquivo**
3. Importe `WF1-pagamento-aprovado.json`
4. Importe `WF3-admin-api.json`
5. Em cada workflow: abra os nós **PostgreSQL** → confirme a credential
6. No WF3: substitua `DEFINA_SUA_ADMIN_KEY_AQUI` por uma chave forte
7. **Ative os dois workflows**

---

## 4. Webhook Mercado Pago

1. Acesse [developers.mercadopago.com](https://developers.mercadopago.com)
2. Sua Aplicação → **Configurar notificações**
3. URL: `https://n8n.saleschannel.com.br/webhook/mp-payment`
4. Evento: ✅ **Pagamentos**

---

## 5. Nginx Proxy Manager (NPM)

Acesse o NPM em `http://187.127.3.62:81` e configure:

| Host | Destino interno | SSL |
|---|---|---|
| `saleschannel.com.br` | `http://saleschannel_portal:80` | Let's Encrypt |
| `n8n.saleschannel.com.br` | via Cloudflare Tunnel | — |
| `evolution.saleschannel.com.br` | via Cloudflare Tunnel | — |

> O path `/sellingvideos` é servido automaticamente pelo `saleschannel_portal` que monta `/root/apps/saleschannel/products`.

---

## 6. Cloudflare Tunnels

| Tunnel | Domínio | Serviço interno |
|---|---|---|
| `Tunnel-n8n-saleschannel-prod` | `n8n.saleschannel.com.br` | `http://saleschannel_n8n:5678` |
| `Tunnel-evolution-saleschannel-prod` | `evolution.saleschannel.com.br` | `http://saleschannel_evolution:8080` |

---

## 7. Admin Panel

URL de acesso: **`https://saleschannel.com.br/sellingvideos`**

- Arquivos estáticos servidos pelo `saleschannel_portal`
- Comunicação com n8n via `https://n8n.saleschannel.com.br/webhook/admin`
- A **Admin Key** do WF3 é necessária para autenticar as requisições

---

## 8. Teste do Fluxo Completo

1. Use o **Sandbox do Mercado Pago** para fazer um pagamento de teste
2. Verifique o webhook no n8n: aba **Executions**
3. Confirme o registro no banco:
   ```sql
   SELECT * FROM saleschannel.pedidos ORDER BY criado_em DESC LIMIT 5;
   ```
4. Verifique o e-mail de confirmação
5. Acesse `https://saleschannel.com.br/sellingvideos` e confirme o pedido no painel
