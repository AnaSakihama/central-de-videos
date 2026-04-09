# 📋 Playbook de Operação — SellingVideos

> **Foco:** Monitoramento da automação e suporte ao cliente.
> A aprovação agora é 100% automatizada via Telegram Bot.

---

## 1. Visão Geral da Automação

O sistema foi desenhado para rodar sem intervenção humana:
1. Cliente compra → Recebe E-mail 1 (Pedido Recebido).
2. Banco confirma → Recebe E-mail 2 (Acesso Liberado com Link do Bot).
3. Bot Telegram → Valida código e gera Link de Entrada Único.

**Sua função agora é apenas monitorar e resolver casos de suporte.**

---

## 2. Monitoramento Diário

Acesse o **Painel Admin** (`/sellingvideos/admin-panel`) 1x ao dia para:
- [ ] Verificar se todos os pagamentos `aprovados` possuem um `invite_code` gerado.
- [ ] Checar no banco se os usuários estão conseguindo usar o código (`order_status` vira `aprovado_no_telegram`).
- [ ] Responder e-mails de suporte que chegam no `admin@saleschannel.com.br`.

---

## 3. Guia de Suporte (Casos Comuns)

### "Não recebi o e-mail de acesso"
1. Abra o Painel Admin.
2. Busque pelo e-mail do cliente.
3. Verifique o `payment_status`:
   - Se `pendente`: Explique que o banco ainda não confirmou (Boleto pode levar 48h).
   - Se `aprovado`: Copie o `invite_code` e envie manualmente para o cliente.

### "O bot diz que o código é inválido"
1. Verifique se o cliente já usou o código (campo `code_used_at` no banco ou status no painel).
2. Se ele já usou, mas saiu do grupo, você deve gerar um link manual (veja abaixo).
3. Se não usou, verifique se ele está digitando `/start [CÓDIGO]` corretamente.

---

## 4. Como gerar um Link Manual (Plano B)

Se por qualquer motivo o Bot falhar, você pode gerar um link de convite manualmente no Telegram:
1. Abra seu Canal no Telegram.
2. Vá em **Manage Channel** → **Invite Links**.
3. Clique em **Create a New Link**.
4. Configure: **Limit by number of users: 1**.
5. Copie o link e envie para o cliente.
6. **Importante:** Registre no Painel Admin que o usuário foi aprovado manualmente.

---

## 5. Manutenção Técnica (VPS)

Se o sistema parar de responder:
1. Verifique se o n8n está online: `n8n.saleschannel.com.br`.
2. Verifique o status dos containers na VPS: `docker ps`.
3. Confira os logs do bot no n8n para ver se ele está recebendo os webhooks do Telegram.

---

*Última atualização: Abril 2026*
