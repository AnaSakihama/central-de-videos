# Configuração do Google Sheets — SalesChannel

## 1. Criar a Planilha

1. Acesse [sheets.google.com](https://sheets.google.com) e crie uma nova planilha
2. Renomeie para: **SalesChannel - Pedidos**
3. Renomeie a aba padrão (Plan1) para: **pedidos**

## 2. Criar os Cabeçalhos (Linha 1)

Na aba `pedidos`, preencha as células da linha 1 exatamente como abaixo:

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| order_id | nome | email | telegram_username | valor | status_pagamento | status_pedido | criado_em | aprovado_em | log_email |

> **Importante:** os nomes devem ser escritos exatamente assim (com underscore, sem espaços e sem acentos), pois o n8n os usa para mapear os dados.

## 3. Obter o ID da Planilha

A URL da sua planilha tem o seguinte formato:
```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/edit
```

O ID é a parte entre `/d/` e `/edit`:
```
1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
```

Copie este ID — você vai precisar dele nos workflows n8n.

## 4. Substituir o ID nos Workflows n8n

Nos arquivos `WF1-pagamento-aprovado.json` e `WF3-admin-api.json`, localize o texto:
```
1Llgir5nwJ1Kllgx_RKBS2XUbi6qohNWsb4N6Gan-7nE
```

Substitua pelo ID copiado no passo anterior antes de importar no n8n.

## 5. Configurar Credenciais no n8n

### Google Sheets (OAuth2)
1. No n8n: **Configurações → Credenciais → Nova Credencial**
2. Tipo: `Google Sheets OAuth2 API`
3. Nome: `Google Sheets - SalesChannel`
4. Faça login com a conta Google dona da planilha

### Gmail SMTP
1. Tipo: `SMTP`
2. Nome: `Gmail SMTP - SalesChannel`
3. Host: `smtp.gmail.com`
4. Port: `465` (SSL) ou `587` (TLS)
5. User: seu e-mail Gmail
6. Password: **Senha de App do Google** (NÃO sua senha normal)
   - Gere em: myaccount.google.com → Segurança → Senhas de app

### Mercado Pago (HTTP Header Auth)
1. Tipo: `HTTP Header Auth`
2. Nome: `Mercado Pago - Access Token`
3. Header Name: `Authorization`
4. Header Value: `Bearer SEU_ACCESS_TOKEN_DE_PRODUCAO`
   - Obtenha em: developers.mercadopago.com

## 6. Importar Workflows no n8n

1. No n8n: **Workflows → Novo → Importar do arquivo**
2. Importe `WF1-pagamento-aprovado.json`
3. Repita para `WF3-admin-api.json`
4. Em cada workflow, abra os nós do Google Sheets e selecione a planilha correta
5. Configure os e-mails (de/para) nos nós `emailSend`
6. No WF3, substitua `DEFINA_SUA_ADMIN_KEY_AQUI` por uma chave forte (ex: `sc_admin_2026_XXXXX`)
7. Ative os dois workflows

## 7. Configurar Webhook no Mercado Pago

1. Acesse [developers.mercadopago.com](https://developers.mercadopago.com)
2. Sua Aplicação → **Configurar notificações**
3. URL de notificação: `https://SEU_N8N_URL/webhook/mp-payment`
4. Marque o evento: ✅ **Pagamentos**
5. Salve

## 8. Configurar Admin Panel

Abra `admin-panel/app.js` e edite:
```javascript
const API_BASE = 'https://SEU_N8N_URL/webhook/admin'; // Sua URL n8n real
```

Pronto! O painel lê os pedidos da API n8n que por sua vez lê o Google Sheets.

## 9. Criar Link de Checkout no Mercado Pago

Crie uma preferência de pagamento com preço fixo R$12,90:
1. No painel MP: **Cobranças → Criar cobrança**
2. Valor: R$12,90
3. Descrição: "Vídeos Prontos Diários — Afiliados Shopee (Vitalício)"
4. Copie o link de pagamento gerado
5. Use este link nos anúncios e posts

> **Dica:** para capturar o username do comprador, adicione um campo personalizado na preferência via API antes de gerar o link.

## 10. Testar o Fluxo Completo

1. Use o **Sandbox do Mercado Pago** para fazer um pagamento de teste
2. Verifique se o webhook chegou no n8n (Executions)
3. Confirme o pedido na planilha Google Sheets
4. Verifique o e-mail de confirmação
5. Abra o painel admin e confirme que o pedido aparece
