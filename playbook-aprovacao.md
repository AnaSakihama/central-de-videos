# 📋 Playbook de Aprovação — SalesChannel
## SLA: Aprovação em até 8 horas

---

## 1. Quando Aprovar?

Sempre que um usuário solicitar entrada no canal Telegram, siga este checklist:

### Checklist de Elegibilidade
- [ ] O usuário solicitou entrada no canal
- [ ] O e-mail ou @username bate com algum pedido no painel admin
- [ ] O status de pagamento é **"aprovado"**
- [ ] O status do pedido é **"link_enviado"** ou **"aguardando_aprovacao"**

**Só aprove se TODOS os itens acima estiverem marcados.**

---

## 2. Processo Passo a Passo

### Passo 1 — Receber a Solicitação
Ao chegar uma solicitação de entrada no canal:
1. Clique no perfil do solicitante para ver o @username
2. Anote o @username (ex: `@usuario123`)

### Passo 2 — Verificar no Painel Admin
1. Acesse o painel admin: `admin-panel/index.html`
2. Na aba **Pedidos**, busque pelo @username ou e-mail
3. Clique na linha do pedido para abrir o detalhe
4. Verifique o bloco de elegibilidade:
   - 🟢 **"Pagamento aprovado — elegível"** → pode aprovar
   - 🔴 **"Pagamento NÃO aprovado"** → NÃO aprovar

### Passo 3 — Ação no Telegram
**Se elegível:**
- Clique em **"Aprovar"** na solicitação do Telegram
- Volte ao painel admin e marque como **"Aprovado no Telegram"**

**Se NÃO elegível ou username não encontrado:**
- Clique em **"Recusar"** no Telegram
- Envie mensagem direta (opcional):
  > "Olá! Não encontramos pagamento vinculado ao seu username. Se você comprou, por favor envie o e-mail usado na compra para: [SEU_EMAIL]"

### Passo 4 — Registrar no Painel
1. Abra o pedido no painel admin
2. Clique em **"Aprovado no Telegram"** ou **"Rejeitar"**
3. O status será atualizado automaticamente

---

## 3. Casos Especiais

### Comprador não tem @username informado
O e-mail enviado ao comprador instrui a informar o username. Se ainda assim não houver, o comprador deve:
1. Responder o e-mail de confirmação com seu @username
2. Ou entrar em contato via canal de suporte

Busque no painel pelo e-mail e atualize o campo `telegram_username`.

### Pagamento pendente ou recusado
- Status `pendente`: o pagamento ainda pode ser confirmado. Aguarde 30 minutos e verifique novamente.
- Status `recusado`: não autorize entrada. O comprador deve realizar nova compra.
- Status `estornado`: não autorize entrada.

### Solicitação duplicada (já aprovado)
- Se `status_pedido = aprovado_no_telegram`, o usuário já tem acesso.
- Pode haver troca de conta Telegram — peça confirmação do e-mail da compra.

---

## 4. Rotina de Verificação

**Frequência recomendada:** 3× ao dia (manhã, tarde, noite)

| Horário | Ação |
|---------|------|
| 08h | Verificar solicitações noite anterior |
| 14h | Verificar solicitações da manhã |
| 20h | Verificar solicitações da tarde |

Isso garante o SLA de 8h em praticamente 100% dos casos.

**Alerta de SLA:** Se houver solicitações com mais de 6h sem aprovação, priorize imediatamente.

---

## 5. Comunicação com o Comprador

### Se precisar entrar em contato:
- Responda o e-mail de confirmação de compra (logs no Google Sheets)
- Mantenha tom profissional e acolhedor

### Template de resposta por e-mail:
```
Olá [NOME]!

Recebemos sua solicitação de entrada no canal.
Para finalizar sua aprovação, precisamos do seu @username do Telegram.

Por favor, responda este e-mail com o seu username (ex: @seunome).

Aprovaremos em até 8h após a confirmação.

Atenciosamente,
SalesChannel Afiliados Shopee
```

---

## 6. Anti-Fraude

**Atenção aos seguintes sinais:**
- Username completamente diferente do informado na compra
- E-mail de domínio suspeito (temporário, disposable)
- Múltiplas solicitações do mesmo IP com e-mails diferentes

Em caso de dúvida, **não aprove** e solicite comprovante adicional.

---

## 7. Link do Canal
**Link para solicitar entrada:** `https://t.me/+N-22gpRv42MyMjhh`

> ⚠️ Nunca compartilhe o link de forma pública. Ele é enviado apenas por e-mail para compradores.

---

*Última atualização: Fevereiro 2026*
