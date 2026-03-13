# SalesChannel — Vídeos Prontos para Afiliados Shopee.

> Canal privado no Telegram com vídeos prontos diários para afiliados Shopee | R$12,90 acesso vitalício

---

## 📦 O que está incluído neste projeto..

```
SalesChannel/
├── admin-panel/        # Painel admin (abrir direto no browser)
├── landing-page/       # Página de Vendas (para hospedar)
│   ├── index.html      # Estrutura e copy da página
│   └── styles.css      # Design e identidade visual
├── marketing/          # Estratégia de Tração
│   ├── instagram-content.md # Roteiros de Reels e Bio
│   ├── copies.md       # Variações de copy
│   └── telegram-post.md# Lançamento
├── playbook-aprovacao.md # SOP de aprovação (SLA 8h)
└── README.md           # Este arquivo
```

---

## 🚀 Configuração Inicial

### 1. Google Sheets (Banco de Dados)

Crie uma planilha chamada `SalesChannel - Pedidos` com a aba `pedidos`:

| order_id | nome | email | telegram_username | valor | status_pagamento | status_pedido | criado_em | aprovado_em | log_email |
|---|---|---|---|---|---|---|---|---|---|

Valores de `status_pagamento`: `pendente`, `aprovado`, `recusado`, `estornado`  
Valores de `status_pedido`: `novo`, `link_enviado`, `aguardando_aprovacao`, `aprovado_no_telegram`, `rejeitado`

### 2. n8n — Credenciais Necessárias

No n8n, vá em **Settings → Credentials → Add Credential** para cada item abaixo.

---

#### 🔑 2.1 — Mercado Pago Access Token

**Tipo no n8n:** `Header Auth`

1. Acesse [developers.mercadopago.com](https://developers.mercadopago.com) e faça login
2. Clique em **Suas integrações → selecione sua aplicação** (ou crie uma nova)
3. Vá em **Credenciais de produção**
4. Copie o **Access Token** (começa com `APP_USR-...`)
5. No n8n, crie uma credencial do tipo **Header Auth**:
   - **Name:** `Mercado Pago Access Token`
   - **Header Name:** `Authorization`
   - **Header Value:** `Bearer APP_USR-SEU_TOKEN_AQUI`
6. Clique em **Save**

> ⚠️ Use o token de **produção** para receber pagamentos reais. Para testes, use o token **sandbox** (APP_USR-TEST-...).

---

#### 📧 2.2 — Gmail SMTP

**Tipo no n8n:** `SMTP`

> ⚠️ O Gmail exige uma **Senha de App** (não a senha da conta). Siga os passos abaixo:

**Pré-requisito — Gerar Senha de App no Google:**
1. Acesse [myaccount.google.com](https://myaccount.google.com)
2. Vá em **Segurança → Verificação em duas etapas** (ative se ainda não estiver ativa)
3. De volta em **Segurança**, clique em **Senhas de app**
4. Em "Selecionar app", escolha **Outro (nome personalizado)** → digite `n8n`
5. Clique em **Gerar** → copie a senha de 16 caracteres exibida

**Configurar no n8n:**
1. Crie uma credencial do tipo **SMTP**:
   - **Name:** `Gmail SMTP`
   - **Host:** `smtp.gmail.com`
   - **Port:** `465`
   - **SSL/TLS:** ativado
   - **User:** `seu-email@gmail.com`
   - **Password:** cole a senha de app de 16 caracteres (ex: `abcd efgh ijkl mnop`)
2. Clique em **Save**

---

#### 📊 2.3 — Google Sheets OAuth2

**Tipo no n8n:** `Google Sheets OAuth2 API`

> ⚠️ Para uso próprio (sem publicação pública), o fluxo simplificado abaixo é suficiente.

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um projeto (ou selecione um existente)
3. Vá em **APIs e serviços → Biblioteca** → busque `Google Sheets API` → **Ativar**
4. Vá em **APIs e serviços → Credenciais → Criar credenciais → ID do cliente OAuth**
   - **Tipo de aplicação:** `Aplicativo da Web`
   - **Nome:** `n8n SalesChannel`
   - Em **URIs de redirecionamento autorizados**, adicione a URL de callback do seu n8n:  
     `http://localhost:5678/rest/oauth2-credential/callback` (local)  
     ou `https://SEU_N8N/rest/oauth2-credential/callback` (produção)
5. Copie o **Client ID** e o **Client Secret**
6. No n8n, crie uma credencial do tipo **Google Sheets OAuth2 API**:
   - **Name:** `Google Sheets OAuth`
   - **Client ID:** cole o valor copiado
   - **Client Secret:** cole o valor copiado
7. Clique em **Sign in with Google** e autorize o acesso com sua conta do Google
8. Clique em **Save**

---

### 🚨 Alternativa: Configuração Direta nos Nós (Sem Credenciais Globais)

Caso o seu n8n seja uma instância restrita onde você **não tem permissão** para acessar a aba "Credentials", você precisará adaptar os workflows para passar as chaves de acesso diretamente pelas configurações dos nós. Como fazer isso:

#### Mercado Pago (Substituindo a Credencial)
Em vez de usar a credencial `Header Auth`, você usará um nó genérico **HTTP Request**:
- **Authentication:** `None`
- **Send Headers:** Ativado (`true`)
- Em **Headers**, adicione:
  - **Name:** `Authorization`
  - **Value:** `Bearer APP_USR-SEU_TOKEN_AQUI`

#### E-mails (Substituindo o Gmail)
Os nós nativos de Gmail e SMTP no n8n **exigem** a criação de uma credencial global. Se você não puder criar credenciais, **não será possível usar o Gmail diretamente**.
**A solução:** Use um serviço de envio de e-mail por API (como [Resend](https://resend.com), [Brevo](https://www.brevo.com/pt/) ou [SendGrid](https://sendgrid.com)) que forneça uma chave de API (API Key).
- No n8n, crie um nó **HTTP Request**:
- **Method:** `POST`
- **URL:** Endpoint da API (ex: `https://api.resend.com/emails`)
- **Authentication:** `None`
- **Send Headers:** Ativado → `Authorization: Bearer SUA_API_KEY`
- **Send Body:** Ativado → Configure o JSON com o destinatário, assunto e corpo do e-mail.

#### Google Sheets (Substituindo a Credencial Oauth2)
O nó nativo do Google Sheets **exige** credencial global no n8n.
**A solução:** Para ler e escrever dados na planilha sem o nó nativo, use ferramentas que transformam planilhas em APIs REST públicas (como [Sheet.best](https://sheet.best) ou [SheetDB](https://sheetdb.io)).
- Elas fornecem uma URL única (ex: `https://sheet.best/api/sheets/123abc456`).
- No n8n, use um nó **HTTP Request** enviando um `POST` para essa URL passando o JSON com os dados da aba para adicionar uma nova linha.

---

### 3. Workflows n8n

Importe os workflows (ou crie via painel n8n):

- **WF1 — MP Pagamento Aprovado** (`/webhook/mp-payment`)
  - Recebe webhook IPN do Mercado Pago
  - Consulta status real do pagamento
  - Grava pedido no Google Sheets
  - Envia e-mails para comprador e admin
  
- **WF2 — Admin API** (`/webhook/admin/...`)
  - `GET /admin/orders` — lista/filtra pedidos
  - `GET /admin/orders/:id` — detalhe
  - `POST /admin/orders/:id/status` — atualiza status

### 4. Mercado Pago — Configuração do Webhook IPN

1. Acesse [Mercado Pago Developers](https://developers.mercadopago.com)
2. Vá em **Suas Integrações → Configurar notificações**
3. URL de notificação: `https://SEU_N8N/webhook/mp-payment`
4. Eventos: `payment` ✅

### 5. Painel Admin

1. Abra `admin-panel/index.html` no browser
2. Na barra lateral, insira sua **Admin Key** (definida no n8n)
3. Clique em **Salvar**
4. Os pedidos serão carregados automaticamente

> ⚠️ **Produção**: o painel lê dados de `http://localhost:5678/webhook/admin` por padrão. Ajuste a constante `API_BASE` em `app.js` para a URL do seu n8n em produção.

---

### 🧪 6. Como Testar o Fluxo (End-to-End)

Para garantir que o webhook do n8n, a gravação na planilha e o envio de e-mails estão rodando perfeitamente antes de lançar, siga este passo a passo usando o ambiente de testes do Mercado Pago:

1. **Ative o Workflow**: Deixe o seu workflow n8n (o WF1, que recebe o webhook) como **Active** ou clique em **Listen for Test Event**.
2. **Crie um Pagamento Fake**:
   - Acesse o link de checkout do seu produto no Mercado Pago (ou use a API se estiver criando via código).
   - Na hora de pagar, você **não** usa um cartão real.
   - Use um dos [Cartões de Teste Oficiais do Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/test-cards). O cartão terminado em `0001` (ex: `1111 1111 1111 0001`) força um pagamento **aprovado** na hora.
   - Coloque qualquer CVV (ex: `123`) e validade no futuro (ex: `12/28`).
3. **Verifique a Execução**:
   - Assim que o pagamento "fake" aprovar na tela, o Mercado Pago vai disparar o Webhook para a URL que você configurou no Passo 4.
   - Abra o n8n e vá na aba **Executions** (Execuções). Você deverá ver uma nova execução de sucesso.
4. **Valide os Resultados**:
   - Abra sua planilha (`SalesChannel - Pedidos`) e veja se uma nova linha foi inserida com `status_pagamento = aprovado`.
   - Verifique o e-mail que você usou na compra de teste: o e-mail de "Acesso Confirmado" deve ter chegado à sua caixa de entrada.

> 💡 **Dica de Debug:** Se a execução não chegou ao n8n, confira se a URL configurada lá no painel do Mercado Pago está 100% correta (cuidado com `http` vs `https` e o caminho `/webhook/...`). Outra forma de testar se a URL está exposta para a internet é copiar a URL do seu webhook e colar no navegador; o n8n deve retornar a mensagem `{"message":"Workflow was started"}` (isso prova que o webhook está online).

---

## 📧 E-mails Automáticos

### E-mail para o Comprador (pagamento aprovado)
```
Assunto: ✅ Acesso Confirmado — Vídeos Prontos Diários para Afiliados Shopee

Olá [NOME]!

Seu pagamento de R$12,90 foi aprovado. Bem-vindo(a)!

👉 Clique aqui para solicitar entrada no canal:
https://t.me/+N-22gpRv42MyMjhh

⚠️ Atenção: sua entrada será aprovada manualmente em até 8 horas.
Certifique-se de que seu @username do Telegram está correto.

Qualquer dúvida, responda este e-mail.
```

### E-mail para o Admin (nova compra)
```
Assunto: 🛒 Nova Compra — SalesChannel

Order ID: #[ID]
Nome: [NOME]
E-mail: [EMAIL]
Telegram: @[USERNAME]
Valor: R$12,90
Status: aprovado
Data: [TIMESTAMP]

➡ Verifique e aprove o pedido no painel admin.
```

---

## 🔑 Jornada do Usuário

```
Instagram (Reels/Bio) → Clica no Link → Acessa a Landing Page
→ Clica em Comprar → Checkout Mercado Pago (R$12,90) 
→ E-mail automático com link → Solicita entrada no canal 
→ Admin aprova no painel em até 8h → Acessa vídeos diários
```

---

## 🌐 Como Hospedar a Landing Page (Grátis)

Para que as pessoas do Instagram possam acessar a sua página de vendas, os arquivos da pasta `landing-page/` precisam estar online. Você pode hospedá-los de graça em 2 minutos.

**Opção 1: Vercel (Mais Fácil)**
1. Crie uma conta em [vercel.com](https://vercel.com)
2. Vá em `Add New Component` -> `Project`
3. Na área inferior, clique em "Upload Folder" e faça o upload da pasta `landing-page/` do seu computador.
4. Clique em Deploy. A Vercel vai gerar um link público (ex: `seu-projeto.vercel.app`) que você colará na Bio do Instagram.

**Opção 2: Tiiny.host (Sem precisa de conta complexa)**
1. Acesse [tiiny.host](https://tiiny.host)
2. Arraste e solte o arquivo `index.html` e `styles.css` (ou a pasta zipada)
3. Escolha um nome para o link
4. Clique em Publicar.

---

## 📊 KPIs para Acompanhar

- CTR do anúncio → checkout
- Taxa de conversão (visitas → compras)
- % pagamentos aprovados
- Tempo médio de aprovação (meta: ≤8h)
- Taxa de solicitação de entrada após e-mail
- Crescimento líquido de membros aprovados

---

## ⚖️ LGPD

Dados coletados: nome, e-mail, @username Telegram, valor pago.  
Base legal: execução de contrato (acesso ao serviço pago).  
Retenção: enquanto o membro estiver ativo; excluída mediante solicitação.  
Solicitação de exclusão: responder e-mail de confirmação de compra.

---

## 📞 Suporte

Responda o e-mail de confirmação de compra ou entre em contato pelo Telegram do admin.

---

*SalesChannel — Afiliados Shopee | Fevereiro 2026*
