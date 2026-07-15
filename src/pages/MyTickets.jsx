import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../utils/localStorage';
import { getEventById } from '../data/mockEvents';

const BASE_URL = 'https://caioandrian.github.io/webstore-test-template';

function TicketCard({ order, autoExpand }) {
  const [expanded, setExpanded] = useState(autoExpand);
  const cardRef = useRef(null);
  const event = getEventById(order.event?.id);

  useEffect(() => {
    if (autoExpand && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [autoExpand]);
  const totalTickets = Object.values(order.tickets || {}).reduce((s, v) => s + v, 0);
  const qrUrl = `${BASE_URL}/#/meus-ingressos?order=${order.id}`;

  return (
    <div
      ref={cardRef}
      id={`ticket-card-${order.id}`}
      data-cy="ticket-card"
      data-order-id={order.id}
      className="bg-[#13131f] border border-purple-900/30 rounded-2xl overflow-hidden"
    >
      {/* Event banner strip */}
      {event?.image && (
        <div className="h-28 relative overflow-hidden">
          <img src={event.image} alt={order.event?.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#13131f] via-[#13131f]/55 to-transparent" />
          <div className="absolute inset-0 px-5 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p
                id={`order-event-title-${order.id}`}
                data-cy="order-event-title"
                className="text-white font-black text-lg leading-tight truncate"
              >
                {order.event?.title}
              </p>
              <p className="text-gray-300 text-xs mt-0.5">
                📅 {order.event?.dateFormatted} — 📍 {order.event?.venue}
              </p>
            </div>
            <span
              id={`order-status-${order.id}`}
              data-cy="order-status"
              className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full border ${
                order.status === 'confirmed'
                  ? 'bg-green-900/70 text-green-300 border-green-700/50'
                  : 'bg-yellow-900/70 text-yellow-300 border-yellow-700/50'
              }`}
            >
              {order.status === 'confirmed' ? '✓ Confirmado' : 'Pendente'}
            </span>
          </div>
        </div>
      )}

      {/* Info row */}
      <div className="px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-5 flex-wrap">
            <div>
              <p className="text-gray-500 text-xs">Pedido</p>
              <p
                id={`order-id-display-${order.id}`}
                data-cy="order-id-display"
                className="text-purple-300 font-mono text-sm font-bold"
              >
                {order.id}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Ingressos</p>
              <p className="text-white text-sm font-bold">{totalTickets}x</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Pagamento</p>
              <p className="text-white text-sm">
                {order.paymentMethod === 'credit' ? '💳 Crédito'
                  : order.paymentMethod === 'debit' ? '💳 Débito'
                  : order.paymentMethod === 'pix' ? '⚡ PIX'
                  : '📄 Boleto'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-gray-500 text-xs">Total pago</p>
              <p
                id={`order-total-${order.id}`}
                data-cy="order-total"
                className="text-green-400 font-bold text-xl"
              >
                R$ {order.total?.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <button
              id={`expand-order-${order.id}`}
              data-cy="expand-order-btn"
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? 'Fechar detalhes' : 'Ver detalhes'}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div
            id={`order-details-${order.id}`}
            data-cy="order-details"
            className="border-t border-purple-900/20 pt-4 mt-4 space-y-4"
          >
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Ingressos</p>
              <div className="space-y-1">
                {Object.entries(order.tickets || {})
                  .filter(([, qty]) => qty > 0)
                  .map(([key, qty]) => {
                    const [ticketId, type] = key.split('_');
                    return (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-300">
                          {qty}× {ticketId} — {type === 'meia' ? 'Meia-Entrada' : 'Inteira'}
                        </span>
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

            {/* QR Code mockup */}
            <div className="flex flex-col items-center py-4 bg-white rounded-2xl max-w-[180px] mx-auto">
              <div className="w-28 h-28 bg-black rounded-lg flex items-center justify-center text-5xl">📱</div>
              <p className="text-gray-500 text-xs mt-2 font-medium">QR Code do Ingresso</p>
              <p className="text-gray-400 text-[10px] px-2 text-center break-all">{qrUrl}</p>
            </div>

            <p className="text-gray-600 text-xs text-center">
              Comprado em {new Date(order.createdAt).toLocaleString('pt-BR')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyTickets() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const targetOrderId = searchParams.get('order');

  if (!user) {
    return (
      <main id="my-tickets-page" data-cy="my-tickets-page" className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="text-6xl mb-4">🔐</div>
        <h1 className="text-white text-2xl font-black mb-3">Acesso restrito</h1>
        <p className="text-gray-400 mb-8">Faça login para ver seus ingressos e histórico de compras.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            id="login-to-see-tickets-btn"
            data-cy="login-to-see-tickets-btn"
            onClick={() => navigate('/login?redirect=/meus-ingressos')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-8 py-3 rounded-xl hover:scale-105 transition-all"
          >
            Entrar na minha conta
          </button>
          <button
            id="explore-events-btn"
            data-cy="explore-events-btn"
            onClick={() => navigate('/eventos')}
            className="bg-white/10 border border-white/20 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/20 transition-all"
          >
            Ver Eventos
          </button>
        </div>
      </main>
    );
  }

  const orders = storage.getOrders(user.id);

  return (
    <main id="my-tickets-page" data-cy="my-tickets-page" className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            id="my-tickets-title"
            data-cy="my-tickets-title"
            className="text-white text-3xl font-black mb-1"
          >
            Meus Ingressos
          </h1>
          <p className="text-gray-400">
            {orders.length} compra{orders.length !== 1 ? 's' : ''} realizada{orders.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          id="go-to-profile-btn"
          data-cy="go-to-profile-btn"
          onClick={() => navigate('/perfil')}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm font-semibold transition-colors px-3 py-2 rounded-lg hover:bg-purple-900/10"
        >
          👤 Meu Perfil
        </button>
      </div>

      {orders.length === 0 ? (
        <div id="no-tickets" data-cy="no-tickets" className="text-center py-20">
          <div className="text-7xl mb-6">🎫</div>
          <h2 className="text-white text-2xl font-black mb-3">Nenhum ingresso ainda</h2>
          <p className="text-gray-400 mb-8">
            Olá, {user.name.split(' ')[0]}! Você ainda não comprou nenhum ingresso.
          </p>
          <button
            id="discover-events-btn"
            data-cy="discover-events-btn"
            onClick={() => navigate('/eventos')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all hover:scale-105 shadow-lg shadow-purple-900/40"
          >
            🎉 Descobrir Eventos
          </button>
        </div>
      ) : (
        <div id="orders-list" data-cy="orders-list" className="space-y-4">
          {orders.map((order) => (
            <TicketCard key={order.id} order={order} autoExpand={order.id === targetOrderId} />
          ))}
        </div>
      )}
    </main>
  );
}
