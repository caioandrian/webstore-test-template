import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formatCPF, formatPhone } from '../utils/mockPayment';
import { storage } from '../utils/localStorage';
import { getEventById } from '../data/mockEvents';

function Avatar({ user, size = 'lg' }) {
  const initials = (user?.name || 'U')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const sz = size === 'lg' ? 'w-20 h-20 text-2xl' : 'w-12 h-12 text-base';
  return (
    <div className={`${sz} rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-black flex-shrink-0`}>
      {initials}
    </div>
  );
}

function Toast({ message, type }) {
  if (!message) return null;
  const colors = type === 'success'
    ? 'bg-green-900/30 border-green-700/40 text-green-300'
    : 'bg-red-900/30 border-red-700/40 text-red-400';
  return (
    <div id="toast-notification" data-cy="toast" className={`fixed top-20 right-4 z-50 max-w-[calc(100vw-2rem)] border rounded-xl px-5 py-3 text-sm font-medium shadow-xl ${colors} animate-bounce`}>
      {type === 'success' ? '✓ ' : '✗ '}{message}
    </div>
  );
}

export default function Profile() {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState('info');
  const [toast, setToast] = useState({ message: '', type: '' });

  if (!user) { navigate('/login'); return null; }

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3500);
  };

  return (
    <main id="profile-page" data-cy="profile-page" className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Toast message={toast.message} type={toast.type} />

      {/* Header */}
      <div className="flex items-center gap-5 mb-8">
        <Avatar user={user} size="lg" />
        <div>
          <h1 id="profile-name" data-cy="profile-name" className="text-white text-2xl font-black">
            {user.name}
          </h1>
          <p className="text-gray-400 text-sm">{user.email}</p>
          <p className="text-gray-500 text-xs mt-1">
            Membro desde {new Date(user.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar nav */}
        <nav id="profile-nav" data-cy="profile-nav" className="md:col-span-1 space-y-1">
          {[
            { id: 'info', label: 'Dados Pessoais', icon: '👤' },
            { id: 'security', label: 'Segurança', icon: '🔒' },
            { id: 'orders', label: 'Minhas Compras', icon: '🎫' },
          ].map((item) => (
            <button
              key={item.id}
              id={`profile-nav-${item.id}`}
              data-cy={`profile-nav-${item.id}`}
              data-active={section === item.id}
              onClick={() => setSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
                section === item.id
                  ? 'bg-purple-700/30 text-purple-300 border border-purple-600/40'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
          <button
            id="logout-btn"
            data-cy="logout-btn"
            onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-900/10 transition-all text-left mt-4"
          >
            <span>🚪</span>
            Sair da conta
          </button>
        </nav>

        {/* Main content */}
        <div className="md:col-span-3">
          {section === 'info' && <PersonalInfo user={user} updateProfile={updateProfile} showToast={showToast} />}
          {section === 'security' && <Security user={user} changePassword={changePassword} showToast={showToast} />}
          {section === 'orders' && <Orders userId={user.id} navigate={navigate} />}
        </div>
      </div>
    </main>
  );
}

// ── Personal Info ─────────────────────────────────────────────────────────────
function PersonalInfo({ user, updateProfile, showToast }) {
  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    cpf: user.cpf || '',
    phone: user.phone || '',
    birthdate: user.birthdate || '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Nome é obrigatório';
    if (!form.email.trim()) e.email = 'E-mail é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail inválido';
    if (form.cpf && form.cpf.replace(/\D/g, '').length < 11) e.cpf = 'CPF inválido';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const result = updateProfile(form);
    setLoading(false);
    if (result.success) showToast('Dados atualizados com sucesso!', 'success');
    else showToast(result.error || 'Erro ao salvar.', 'error');
  };

  const fields = [
    { id: 'profile-name-field', key: 'name', label: 'Nome Completo', type: 'text', placeholder: 'João da Silva', full: true },
    { id: 'profile-email-field', key: 'email', label: 'E-mail', type: 'email', placeholder: 'seu@email.com' },
    { id: 'profile-cpf-field', key: 'cpf', label: 'CPF', type: 'text', placeholder: '000.000.000-00', disabled: true },
    { id: 'profile-phone-field', key: 'phone', label: 'Telefone / WhatsApp', type: 'tel', placeholder: '(11) 99999-9999' },
    { id: 'profile-birthdate-field', key: 'birthdate', label: 'Data de Nascimento', type: 'date', placeholder: '' },
  ];

  return (
    <div id="profile-info-section" data-cy="profile-info-section" className="bg-[#13131f] border border-purple-900/30 rounded-2xl p-6">
      <h2 className="text-white text-xl font-bold mb-5">Dados Pessoais</h2>
      <form id="profile-info-form" data-cy="profile-info-form" onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {fields.map((f) => (
            <div key={f.key} className={f.full ? 'sm:col-span-2' : ''}>
              <label htmlFor={f.id} className="block text-gray-300 text-sm font-medium mb-2">
                {f.label}
                {f.disabled && <span className="ml-2 text-xs text-gray-500">(não editável)</span>}
              </label>
              <input
                id={f.id}
                data-cy={f.id}
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.key]}
                disabled={f.disabled}
                onChange={(e) => {
                  let v = e.target.value;
                  if (f.key === 'cpf') v = formatCPF(v);
                  if (f.key === 'phone') v = formatPhone(v);
                  set(f.key, v);
                }}
                className={`w-full bg-[#0f0f1a] border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors ${
                  f.disabled ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                  errors[f.key] ? 'border-red-500' : 'border-purple-900/40 focus:border-purple-500'
                }`}
              />
              {errors[f.key] && (
                <p id={`error-${f.id}`} data-cy={`error-${f.id}`} className="text-red-400 text-xs mt-1">
                  {errors[f.key]}
                </p>
              )}
            </div>
          ))}
        </div>

        <button
          id="save-profile-btn"
          data-cy="save-profile-btn"
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-xl transition-all flex items-center gap-2"
        >
          {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  );
}

// ── Security ──────────────────────────────────────────────────────────────────
function Security({ changePassword, showToast }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.current) errs.current = 'Digite a senha atual';
    if (!form.next) errs.next = 'Digite a nova senha';
    else if (form.next.length < 6) errs.next = 'Mínimo 6 caracteres';
    if (form.next !== form.confirm) errs.confirm = 'Senhas não conferem';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const result = changePassword(form.current, form.next);
    setLoading(false);
    if (result.success) {
      showToast('Senha alterada com sucesso!', 'success');
      setForm({ current: '', next: '', confirm: '' });
    } else {
      showToast(result.error, 'error');
    }
  };

  return (
    <div id="profile-security-section" data-cy="profile-security-section" className="bg-[#13131f] border border-purple-900/30 rounded-2xl p-6">
      <h2 className="text-white text-xl font-bold mb-5">Segurança</h2>
      <form id="profile-security-form" data-cy="profile-security-form" onSubmit={handle} noValidate className="space-y-4">
        {[
          { id: 'field-current-password', key: 'current', label: 'Senha Atual' },
          { id: 'field-new-password', key: 'next', label: 'Nova Senha' },
          { id: 'field-confirm-password', key: 'confirm', label: 'Confirmar Nova Senha' },
        ].map((f) => (
          <div key={f.key}>
            <label htmlFor={f.id} className="block text-gray-300 text-sm font-medium mb-2">
              {f.label} <span className="text-pink-500">*</span>
            </label>
            <input
              id={f.id}
              data-cy={f.id}
              type="password"
              placeholder="••••••••"
              value={form[f.key]}
              onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
              className={`w-full bg-[#0f0f1a] border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors ${
                errors[f.key] ? 'border-red-500' : 'border-purple-900/40 focus:border-purple-500'
              }`}
            />
            {errors[f.key] && (
              <p id={`error-${f.id}`} data-cy={`error-${f.id}`} className="text-red-400 text-xs mt-1">{errors[f.key]}</p>
            )}
          </div>
        ))}
        <button
          id="save-password-btn"
          data-cy="save-password-btn"
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-xl transition-all flex items-center gap-2"
        >
          {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
          {loading ? 'Salvando...' : 'Alterar Senha'}
        </button>
      </form>
    </div>
  );
}

// ── Orders ────────────────────────────────────────────────────────────────────
function Orders({ userId, navigate }) {
  const orders = storage.getOrders(userId);
  const [expanded, setExpanded] = useState(null);

  if (orders.length === 0) {
    return (
      <div id="profile-orders-empty" data-cy="profile-orders-empty" className="bg-[#13131f] border border-purple-900/30 rounded-2xl p-10 text-center">
        <div className="text-5xl mb-4">🎫</div>
        <p className="text-white font-bold text-lg mb-2">Nenhuma compra ainda</p>
        <p className="text-gray-400 text-sm mb-6">Seus pedidos aparecerão aqui após a compra.</p>
        <button
          id="go-buy-btn"
          data-cy="go-buy-btn"
          onClick={() => navigate('/eventos')}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-6 py-3 rounded-xl transition-all hover:scale-105"
        >
          Ver Eventos
        </button>
      </div>
    );
  }

  return (
    <div id="profile-orders-section" data-cy="profile-orders-section" className="space-y-4">
      <h2 className="text-white text-xl font-bold mb-1">Minhas Compras</h2>
      <p className="text-gray-400 text-sm mb-4">{orders.length} pedido{orders.length > 1 ? 's' : ''}</p>

      {orders.map((order) => {
        const event = getEventById(order.event?.id);
        const isOpen = expanded === order.id;
        const totalTickets = Object.values(order.tickets || {}).reduce((s, v) => s + v, 0);

        return (
          <div
            key={order.id}
            id={`profile-order-card-${order.id}`}
            data-cy="profile-order-card"
            data-order-id={order.id}
            className="bg-[#13131f] border border-purple-900/30 rounded-2xl overflow-hidden"
          >
            {/* Banner strip */}
            {event?.image && (
              <div className="h-24 relative overflow-hidden">
                <img src={event.image} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#13131f] via-[#13131f]/60 to-transparent" />
                <div className="absolute inset-0 flex items-center px-5 gap-4">
                  <div className="flex-1">
                    <p className="text-white font-black text-lg leading-tight line-clamp-1">{order.event?.title}</p>
                    <p className="text-gray-300 text-xs">📅 {order.event?.dateFormatted}</p>
                  </div>
                  <span
                    id={`order-status-${order.id}`}
                    data-cy="order-status-badge"
                    className={`text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 ${
                      order.status === 'confirmed'
                        ? 'bg-green-900/70 text-green-300 border border-green-700/50'
                        : 'bg-yellow-900/70 text-yellow-300 border border-yellow-700/50'
                    }`}
                  >
                    {order.status === 'confirmed' ? '✓ Confirmado' : 'Pendente'}
                  </span>
                </div>
              </div>
            )}

            <div className="p-5">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  <div>
                    <p className="text-gray-500 text-xs">Pedido</p>
                    <p id={`order-id-label-${order.id}`} data-cy="order-id-label" className="text-purple-300 font-mono text-sm font-bold">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Ingressos</p>
                    <p className="text-white text-sm font-bold">{totalTickets}x</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Pagamento</p>
                    <p className="text-white text-sm capitalize">
                      {order.paymentMethod === 'credit' ? '💳 Crédito'
                        : order.paymentMethod === 'debit' ? '💳 Débito'
                        : order.paymentMethod === 'pix' ? '⚡ PIX'
                        : '📄 Boleto'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Local</p>
                    <p className="text-white text-sm">{order.event?.venue}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-gray-500 text-xs">Total pago</p>
                    <p id={`order-total-${order.id}`} data-cy="order-total-label" className="text-green-400 font-bold text-lg">
                      R$ {order.total?.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <button
                    id={`toggle-order-${order.id}`}
                    data-cy="toggle-order-details"
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              {isOpen && (
                <div id={`order-details-${order.id}`} data-cy="order-details-expanded" className="border-t border-purple-900/20 pt-4 mt-2 space-y-4">
                  {/* Ticket breakdown */}
                  <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Ingressos</p>
                    <div className="space-y-1">
                      {Object.entries(order.tickets || {})
                        .filter(([, qty]) => qty > 0)
                        .map(([key, qty]) => {
                          const [ticketId, type] = key.split('_');
                          return (
                            <div key={key} className="flex justify-between text-sm">
                              <span className="text-gray-300">{qty}× {ticketId} — {type === 'meia' ? 'Meia-Entrada' : 'Inteira'}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {order.addons?.length > 0 && (
                    <div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Adicionais</p>
                      {order.addons.map((id) => (
                        <p key={id} className="text-gray-300 text-sm">✨ {id}</p>
                      ))}
                    </div>
                  )}

                  {/* QR mockup */}
                  <div className="flex flex-col items-center py-4 bg-white rounded-xl mx-auto max-w-[180px]">
                    <div className="w-24 h-24 bg-black rounded-lg flex items-center justify-center text-4xl">📱</div>
                    <p className="text-gray-500 text-xs mt-2 font-medium text-center">QR Code do Ingresso</p>
                    <p className="text-gray-400 text-[10px] text-center px-2 break-all">{order.transactionId}</p>
                  </div>

                  <p className="text-gray-600 text-xs text-center">
                    Comprado em {new Date(order.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
