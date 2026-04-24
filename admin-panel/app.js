// ─────────────────────────────────────────────
//  SalesChannel Admin Panel — app.js
//  Conecta com a API n8n (WF3 - Admin API)
// ─────────────────────────────────────────────

const API_BASE = 'https://n8n.saleschannel.com.br/webhook/admin'; // Endpoint único do WF3
let adminKey = sessionStorage.getItem('sc_admin_key') || '';
let allOrders = [];

// ── Init ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (adminKey) document.getElementById('adminKey').value = adminKey;
  setupNavigation();
  loadOrders();
});

// ── Navigation ────────────────────────────────
function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const view = link.dataset.view;
      switchView(view);
    });
  });
}

function switchView(viewName) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`[data-view="${viewName}"]`)?.classList.add('active');

  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${viewName}`)?.classList.add('active');

  const titles = { dashboard: 'Dashboard', orders: 'Pedidos', pending: 'Aguardando Aprovação' };
  document.getElementById('pageTitle').textContent = titles[viewName] || viewName;

  if (viewName === 'pending') renderPendingTable();
}

// ── Admin Key ─────────────────────────────────
function saveKey() {
  adminKey = document.getElementById('adminKey').value.trim();
  sessionStorage.setItem('sc_admin_key', adminKey);
  loadOrders();
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-admin-key': adminKey
  };
}

// ── Load Orders ───────────────────────────────
async function loadOrders() {
  // Verificar se a Admin Key foi informada
  if (!adminKey) {
    const msg = '🔑 Informe a Admin Key na sidebar e clique "Salvar" para acessar os dados.';
    setTableError('recentTable', msg);
    setTableError('ordersTable', msg);
    setTableError('pendingTable', msg);
    return;
  }

  try {
    setTableLoading('recentTable');
    setTableLoading('ordersTable');
    setTableLoading('pendingTable');

    // WF3 usa um único endpoint POST com campo action no body
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ action: 'listar_pedidos' })
    });

    // Erro de autenticação
    if (res.status === 401) {
      const msg = '🔒 Admin Key incorreta. Verifique e clique em "Salvar" novamente.';
      setTableError('recentTable', msg);
      setTableError('ordersTable', msg);
      setTableError('pendingTable', msg);
      return;
    }

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    allOrders = Array.isArray(data) ? data : (data.orders || []);

    updateStats();
    renderRecentTable();
    filterOrders();
  } catch (err) {
    console.error('Erro ao carregar pedidos:', err);
    setTableError('recentTable', err.message);
    setTableError('ordersTable', err.message);
    setTableError('pendingTable', err.message);
  }
}

// ── Stats ─────────────────────────────────────
function updateStats() {
  document.getElementById('statTotal').textContent = allOrders.length;
  document.getElementById('statAprovados').textContent =
    allOrders.filter(o => o.payment_status === 'aprovado').length;
  document.getElementById('statPendentes').textContent =
    allOrders.filter(o => o.order_status === 'novo').length;
  document.getElementById('statLinkEnviado').textContent =
    allOrders.filter(o => o.order_status === 'link_enviado').length;
}

// ── Render Helpers ────────────────────────────
function paymentBadge(status) {
  const map = {
    aprovado: ['badge-green', '✅', 'Aprovado'],
    pendente: ['badge-yellow', '⏳', 'Pendente'],
    recusado: ['badge-red', '❌', 'Recusado'],
    estornado: ['badge-red', '↩️', 'Estornado'],
  };
  const [cls, icon, label] = map[status] || ['badge-gray', '❓', status || '—'];
  return `<span class="badge ${cls}">${icon} ${label}</span>`;
}

function orderBadge(status) {
  // Valores conforme tabela core.orders
  const map = {
    novo:         ['badge-gray',   '🆕', 'Novo'],
    link_enviado: ['badge-blue',   '📧', 'Link Enviado'],
    rejeitado:    ['badge-red',    '🚫', 'Rejeitado'],
  };
  const [cls, icon, label] = map[status] || ['badge-gray', '❓', status || '—'];
  return `<span class="badge ${cls}">${icon} ${label}</span>`;
}

function formatDate(ts) {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  } catch { return ts; }
}

// ── Recent Table (Dashboard) ──────────────────
function renderRecentTable() {
  const recent = [...allOrders]
    .sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em))
    .slice(0, 8);
  document.getElementById('recentTable').innerHTML = buildTable(recent);
}

// ── Orders Table (with filter) ────────────────
function filterOrders() {
  const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const payFilter = document.getElementById('filterPayment')?.value || '';
  const orderFilter = document.getElementById('filterOrder')?.value || '';

  const filtered = allOrders.filter(o => {
    const matchSearch = !search ||
      (o.email || '').toLowerCase().includes(search) ||
      (o.telegram_username || '').toLowerCase().includes(search) ||
      (o.name || '').toLowerCase().includes(search);
    const matchPay = !payFilter || o.payment_status === payFilter;
    const matchOrd = !orderFilter || o.order_status === orderFilter;
    return matchSearch && matchPay && matchOrd;
  });

  document.getElementById('ordersTable').innerHTML = buildTable(filtered);
}

function renderPendingTable() {
  const pending = allOrders.filter(o =>
    o.order_status === 'novo' || o.order_status === 'link_enviado'
  );
  document.getElementById('pendingTable').innerHTML = buildTable(pending);
}

function buildTable(orders) {
  if (!orders.length) {
    return `<div class="empty-state"><div class="empty-icon">📭</div>Nenhum pedido encontrado.</div>`;
  }

  const rows = orders.map(o => `
    <tr onclick="openOrderModal('${o.order_id}')">
      <td>${o.order_id || '—'}</td>
      <td>${o.name || '—'}</td>
      <td>${o.email || '—'}</td>
      <td>${o.telegram_username ? '@' + o.telegram_username.replace('@', '') : '—'}</td>
      <td>${paymentBadge(o.payment_status)}</td>
      <td>${orderBadge(o.order_status)}</td>
      <td>${formatDate(o.created_at)}</td>
    </tr>
  `).join('');

  return `<div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th>Order ID</th><th>Nome</th><th>E-mail</th><th>Telegram</th>
          <th>Pagamento</th><th>Status Pedido</th><th>Criado em</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

// ── Modal ─────────────────────────────────────
function openOrderModal(orderId) {
  const order = allOrders.find(o => o.order_id === orderId);
  if (!order) return;

  const eligible = order.payment_status === 'aprovado';
  const eligibilityBlock = eligible
    ? `<div class="eligibility-ok">✅ Pagamento aprovado — elegível para entrada no canal.</div>`
    : `<div class="eligibility-fail">❌ Pagamento NÃO aprovado — não autorizar entrada.</div>`;

  const canApprove = eligible && order.order_status !== 'rejeitado';

  document.getElementById('modalContent').innerHTML = `
    <div class="modal-title">📋 Pedido #${order.order_id}</div>
    ${eligibilityBlock}
    <div style="margin-top:16px">
      ${detailRow('Nome', order.name || '—')}
      ${detailRow('E-mail', order.email || '—')}
      ${detailRow('Telegram', order.telegram_username ? '@' + order.telegram_username : '—')}
      ${detailRow('Valor', 'R$' + (order.price || '12,90'))}
      ${detailRow('Status Pagamento', paymentBadge(order.payment_status))}
      ${detailRow('Status Pedido', orderBadge(order.order_status))}
      ${detailRow('Criado em', formatDate(order.created_at))}
      ${detailRow('Aprovado em', formatDate(order.approved_at))}
      ${detailRow('Log E-mail', order.log_email || '—')}
    </div>
    <div class="modal-actions">
      ${canApprove ? `
        <button class="btn btn-success" onclick="updateStatus('${order.order_id}','link_enviado')">
          📧 Marcar Link Enviado
        </button>
        <button class="btn btn-danger" onclick="updateStatus('${order.order_id}','rejeitado')">
          🚫 Rejeitar
        </button>
      ` : ''}
      <button class="btn" style="background:#6c63ff; color:white;" onclick="resetAccess('${order.order_id}')">
        🔄 Redefinir e Gerar Novo Link
      </button>
      <button class="btn" style="background:var(--bg-hover); color:var(--text-secondary);" onclick="closeModal()">
        Fechar
      </button>
    </div>
    <div id="resetResult" style="margin-top:16px; display:none; padding:12px; background:rgba(108,99,255,0.05); border-radius:10px; border:1px solid rgba(108,99,255,0.2);">
      <p style="font-size:11px; color:#6c63ff; font-weight:bold; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.5px;">Link Gerado com Sucesso</p>
      <div style="display:flex; gap:8px; align-items:center;">
        <input type="text" id="newInviteLink" readonly style="background:var(--bg-panel); border:1px solid var(--border-color); color:var(--text-primary); padding:8px 12px; border-radius:6px; flex:1; font-size:12px; font-family:monospace;">
        <button onclick="copyNewLink()" style="background:#6c63ff; border:none; color:white; padding:8px 15px; border-radius:6px; font-size:12px; font-weight:bold; cursor:pointer; transition:0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">Copiar</button>
      </div>
    </div>
  `;

  document.getElementById('modal').classList.add('open');
}

function detailRow(label, value) {
  return `<div class="detail-row">
    <span class="detail-label">${label}</span>
    <span class="detail-value">${value}</span>
  </div>`;
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

function closeModalOutside(e) {
  if (e.target === document.getElementById('modal')) closeModal();
}

// ── Update Status ─────────────────────────────
async function updateStatus(orderId, newStatus) {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        action: 'atualizar_status',
        order_id: orderId,
        order_status: newStatus,
        approved_at: newStatus === 'link_enviado' ? new Date().toISOString() : ''
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    closeModal();
    await loadOrders();
    alert(`✅ Status atualizado: ${newStatus}`);
  } catch (err) {
    alert('Erro ao atualizar status: ' + err.message);
  }
}

async function resetAccess(orderId) {
  const btn = document.querySelector('.modal-actions button[onclick*="resetAccess"]');
  const originalText = btn.textContent;
  
  try {
    btn.disabled = true;
    btn.textContent = '⏳ Gerando...';
    
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        action: 'redefinir_acesso',
        order_id: orderId
      })
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    
    // A API do Telegram retorna { ok: true, result: { invite_link: "..." } }
    // O n8n pode repassar o objeto direto ou aninhado em result
    const inviteLink = data.invite_link
      || data.result?.invite_link
      || (Array.isArray(data) && data[0]?.invite_link)
      || (Array.isArray(data) && data[0]?.result?.invite_link);

    if (inviteLink) {
      const resultDiv = document.getElementById('resetResult');
      const input = document.getElementById('newInviteLink');
      input.value = inviteLink;
      resultDiv.style.display = 'block';
      btn.textContent = '✅ Sucesso!';
      setTimeout(() => { btn.textContent = originalText; btn.disabled = false; }, 2000);
    } else {
      // Log para debug — exibe o objeto raw no console para diagnóstico
      console.error('Resposta da API (debug):', JSON.stringify(data));
      throw new Error('Link não retornado pela API. Verifique o console (F12) para detalhes.');
    }
  } catch (err) {
    alert('Erro ao redefinir acesso: ' + err.message);
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

function copyNewLink() {
  const input = document.getElementById('newInviteLink');
  navigator.clipboard.writeText(input.value).then(() => {
    alert('Link copiado para a área de transferência!');
  }).catch(() => {
    // Fallback para navegadores antigos
    input.select();
    document.execCommand('copy');
    alert('Link copiado!');
  });
}

// ── Loading / Error states ─────────────────────
function setTableLoading(id) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = `<div class="loading-state"><div class="spinner"></div> Carregando...</div>`;
}

function setTableError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = `<div class="empty-state">
    <div class="empty-icon">⚠️</div>
    Erro ao carregar dados.<br><small style="color:var(--text-muted)">${msg}</small><br><br>
    <small>Verifique a Admin Key e a URL da API n8n.</small>
  </div>`;
}
