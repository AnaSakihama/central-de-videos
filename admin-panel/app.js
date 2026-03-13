// ─────────────────────────────────────────────
//  SalesChannel Admin Panel — app.js
//  Conecta com a API n8n (WF3 - Admin API)
// ─────────────────────────────────────────────

const API_BASE = 'http://localhost:5678/webhook/admin'; // Ajustar para URL n8n em produção
let adminKey = localStorage.getItem('sc_admin_key') || '';
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
  localStorage.setItem('sc_admin_key', adminKey);
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
  try {
    setTableLoading('recentTable');
    setTableLoading('ordersTable');
    setTableLoading('pendingTable');

    const res = await fetch(`${API_BASE}/orders`, { headers: getHeaders() });
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
    allOrders.filter(o => o.status_pedido === 'aprovado_no_telegram').length;
  document.getElementById('statPendentes').textContent =
    allOrders.filter(o => o.status_pedido === 'aguardando_aprovacao').length;
  document.getElementById('statLinkEnviado').textContent =
    allOrders.filter(o => o.status_pedido === 'link_enviado').length;
}

// ── Render Helpers ────────────────────────────
function paymentBadge(status) {
  const map = {
    aprovado:  ['badge-green',  '✅', 'Aprovado'],
    pendente:  ['badge-yellow', '⏳', 'Pendente'],
    recusado:  ['badge-red',    '❌', 'Recusado'],
    estornado: ['badge-red',    '↩️', 'Estornado'],
  };
  const [cls, icon, label] = map[status] || ['badge-gray', '❓', status || '—'];
  return `<span class="badge ${cls}">${icon} ${label}</span>`;
}

function orderBadge(status) {
  const map = {
    novo:                 ['badge-gray',   '🆕', 'Novo'],
    link_enviado:         ['badge-blue',   '📧', 'Link Enviado'],
    aguardando_aprovacao: ['badge-yellow', '⌛', 'Aguardando'],
    aprovado_no_telegram: ['badge-green',  '✅', 'Aprovado'],
    rejeitado:            ['badge-red',    '🚫', 'Rejeitado'],
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
      (o.nome || '').toLowerCase().includes(search);
    const matchPay = !payFilter || o.status_pagamento === payFilter;
    const matchOrd = !orderFilter || o.status_pedido === orderFilter;
    return matchSearch && matchPay && matchOrd;
  });

  document.getElementById('ordersTable').innerHTML = buildTable(filtered);
}

function renderPendingTable() {
  const pending = allOrders.filter(o =>
    o.status_pedido === 'aguardando_aprovacao' || o.status_pedido === 'link_enviado'
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
      <td>${o.nome || '—'}</td>
      <td>${o.email || '—'}</td>
      <td>${o.telegram_username ? '@' + o.telegram_username.replace('@','') : '—'}</td>
      <td>${paymentBadge(o.status_pagamento)}</td>
      <td>${orderBadge(o.status_pedido)}</td>
      <td>${formatDate(o.criado_em)}</td>
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

  const eligible = order.status_pagamento === 'aprovado';
  const eligibilityBlock = eligible
    ? `<div class="eligibility-ok">✅ Pagamento aprovado — elegível para entrada no canal.</div>`
    : `<div class="eligibility-fail">❌ Pagamento NÃO aprovado — não autorizar entrada.</div>`;

  const canApprove = eligible && order.status_pedido !== 'aprovado_no_telegram' && order.status_pedido !== 'rejeitado';

  document.getElementById('modalContent').innerHTML = `
    <div class="modal-title">📋 Pedido #${order.order_id}</div>
    ${eligibilityBlock}
    <div style="margin-top:16px">
      ${detailRow('Nome', order.nome || '—')}
      ${detailRow('E-mail', order.email || '—')}
      ${detailRow('Telegram', order.telegram_username ? '@'+order.telegram_username : '—')}
      ${detailRow('Valor', 'R$' + (order.valor || '12,90'))}
      ${detailRow('Status Pagamento', paymentBadge(order.status_pagamento))}
      ${detailRow('Status Pedido', orderBadge(order.status_pedido))}
      ${detailRow('Criado em', formatDate(order.criado_em))}
      ${detailRow('Aprovado em', formatDate(order.aprovado_em))}
      ${detailRow('Log E-mail', order.log_email || '—')}
    </div>
    <div class="modal-actions">
      ${canApprove ? `
        <button class="btn btn-success" onclick="updateStatus('${order.order_id}','aprovado_no_telegram')">
          ✅ Aprovado no Telegram
        </button>
        <button class="btn btn-danger" onclick="updateStatus('${order.order_id}','rejeitado')">
          🚫 Rejeitar
        </button>
      ` : ''}
      <button class="btn" style="background:var(--bg-hover); color:var(--text-secondary);" onclick="closeModal()">
        Fechar
      </button>
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
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ status_pedido: newStatus, aprovado_em: new Date().toISOString() })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    closeModal();
    await loadOrders();
    alert(`✅ Status atualizado: ${newStatus}`);
  } catch (err) {
    alert('Erro ao atualizar status: ' + err.message);
  }
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
