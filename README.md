# Estúdio de Mídias — Vídeos Prontos para Afiliados

> Canal privado no Telegram com vídeos prontos diários para afiliados (Shopee, Amazon, AliExpress, etc) | R$12,90 acesso vitalício. Entrega 100% automatizada via Telegram Bot.

---

## 📦 Estrutura do Projeto

```
sellingvideos/
├── admin-panel/        # Painel admin (abrir https://estudiodemidias.com.br)
├── landing-page/       # Ativos de design e CSS da página de vendas
├── index.html          # Landing Page principal (Página de Vendas)
├── suporte.html        # Central de Suporte (Formulário Integrado)
├── termos.html         # Termos de Uso e LGPD
├── marketing/          # Estratégia de Tração (Copies e Roteiros)
├── n8n-workflows/      # Workflows automatizados (IPN, Admin, Bot, Suporte)
├── playbook-operacao.md# SOP de monitoramento e redundância
└── README.md           # Este arquivo
```

---

## 🚀 Arquitetura e Stack

O projeto utiliza uma stack moderna focada em automação e baixo custo de manutenção:
- **Hospedagem:** VPS Linux (Docker + Docker Compose).
- **Banco de Dados:** PostgreSQL (Tabela `core.orders` com campos em inglês).
- **Automação (Cérebro):** n8n (Integração Mercado Pago, E-mails e Bot).
- **Entrega:** Bot do Telegram (`divulgaVovo_bot`) para geração de links temporários de uso único.
- **Frontend:** Vanilla HTML/JS com design premium e responsivo.

---

## 🗄️ Banco de Dados (PostgreSQL)

O projeto usa o schema **`core`** no banco `sellingvideos_db`.

### Estrutura da Tabela `core.orders`:
| Coluna | Tipo | Descrição |
|---|---|---|
| `order_id` | TEXT (PK) | ID do pagamento no Mercado Pago |
| `name` | TEXT | Nome do comprador |
| `email` | TEXT | E-mail da compra |
| `price` | NUMERIC | Valor pago (R$ 12,90) |
| `payment_status`| TEXT | `aprovado`, `pendente`, `recusado`, `estornado` |
| `order_status` | TEXT | `novo`, `aguardando_pagamento`, `link_enviado`, `rejeitado` |
| `invite_code` | TEXT | Código único gerado para o Bot |
| `created_at` | TIMESTAMPTZ | Data de criação do pedido |

---

## 🤖 Fluxo de Automação

1. **Compra:** O cliente paga R$ 12,90 na Landing Page via Mercado Pago.
2. **IPN (WF1):** O Mercado Pago avisa o n8n.
   - Se **Pendente**: Envia e-mail de "Pedido Recebido".
   - Se **Aprovado**: Gera um código único (`SV-XXXXXX`), grava no banco e envia e-mail de "Acesso Liberado" com o link do Bot.
3. **Bot (WF5):** O cliente clica no link do e-mail e abre o bot.
   - O Bot valida o código no banco.
   - Se válido, gera um **Link de Convite Temporário** (5 min / 1 uso).
   - O cliente entra no canal e o código é marcado como usado.

---

## 📧 Templates de E-mail

### E-mail de Acesso Liberado
```
Assunto: ✅ Acesso Liberado — Vídeos Estúdio de Mídias VIP

Olá [NAME]!
Seu pagamento foi confirmado. Para entrar no canal VIP:
👉 Clique aqui para liberar acesso: https://t.me/divulgaVovo_bot?start=[CODE]

⚠️ O link gerado pelo bot funcionará apenas uma vez e expirará em 5 minutos.
```

---

## 📞 Suporte e Contato

- **Formulário:** Disponível em `/suporte.html`.
- **E-mail:** `admin@estudiodemidias.com.br` (recebe todas as solicitações do formulário via WF4).

---

*Estúdio de Mídias — Automação de Vendas Digitais | Abril 2026*
