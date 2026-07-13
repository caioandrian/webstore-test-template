import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById } from '../data/mockEvents';
import StepIndicator, { STEPS } from '../components/StepIndicator';
import { processPayment, formatCPF, formatCard, formatExpiry, formatPhone, generatePixCode } from '../utils/mockPayment';
import { storage } from '../utils/localStorage';
import { useAuth } from '../contexts/AuthContext';

// ─── Step 1: Ticket selection ─────────────────────────────────────────────────
function StepTickets({ event, selection, onChange }) {
  return (
    <div id="step-tickets" data-cy="step-tickets">
      <h2 className="text-white text-2xl font-black mb-2">Escolha seus Ingressos</h2>
      <p className="text-gray-400 mb-6">Selecione o tipo e a quantidade desejada.</p>

      <div className="space-y-4">
        {event.tickets.map((ticket) => (
          <div
            key={ticket.id}
            id={`ticket-option-${ticket.id}`}
            data-cy="ticket-option"
            data-ticket-id={ticket.id}
            className="bg-[#13131f] border border-purple-900/30 rounded-2xl p-5"
          >
            <div className="flex flex-col gap-4">
              {/* Ticket name + badge */}
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-lg">{ticket.name}</h3>
                {ticket.available < 50 && (
                  <span className="bg-orange-600/20 text-orange-400 text-xs px-2 py-0.5 rounded-full border border-orange-600/30">
                    Últimas {ticket.available} unidades
                  </span>
                )}
              </div>

              {/* Per-type rows: label + price, then controls */}
              <div className="space-y-3">
                {['inteira', 'meia'].map((type) => {
                  const key = `${ticket.id}_${type}`;
                  const qty = selection[key] || 0;
                  const price = type === 'meia' ? ticket.halfPrice : ticket.price;
                  const label = type === 'meia' ? 'Meia-Entrada ½' : 'Inteira';
                  return (
                    <div key={type}>
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-gray-500 text-xs">{label}</span>
                        <span className={`font-bold text-xl ${type === 'meia' ? 'text-purple-300' : 'text-white'}`}>
                          R$ {price.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 justify-center">
                        <button
                          id={`qty-decrease-${ticket.id}-${type}`}
                          data-cy="qty-decrease"
                          data-ticket-id={ticket.id}
                          data-ticket-type={type}
                          onClick={() => onChange(key, Math.max(0, qty - 1), price)}
                          className="w-8 h-8 rounded-lg bg-purple-900/40 hover:bg-purple-700/40 text-white flex items-center justify-center font-bold transition-colors disabled:opacity-30"
                          disabled={qty === 0}
                        >
                          −
                        </button>
                        <span
                          id={`qty-value-${ticket.id}-${type}`}
                          data-cy="qty-value"
                          className="w-10 text-center text-white font-bold tabular-nums"
                        >
                          {qty}
                        </span>
                        <button
                          id={`qty-increase-${ticket.id}-${type}`}
                          data-cy="qty-increase"
                          data-ticket-id={ticket.id}
                          data-ticket-type={type}
                          onClick={() => onChange(key, Math.min(10, qty + 1), price)}
                          className="w-8 h-8 rounded-lg bg-purple-900/40 hover:bg-purple-700/40 text-white flex items-center justify-center font-bold transition-colors"
                          disabled={qty >= 10}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2: Add-ons ──────────────────────────────────────────────────────────
function StepAddons({ event, selected, onToggle }) {
  if (event.addons.length === 0) {
    return (
      <div id="step-addons-empty" data-cy="step-addons-empty" className="text-center py-12">
        <div className="text-5xl mb-4">🎉</div>
        <p className="text-gray-300 text-lg">Este evento não possui adicionais disponíveis.</p>
        <p className="text-gray-500 mt-2">Clique em Continuar para prosseguir.</p>
      </div>
    );
  }

  return (
    <div id="step-addons" data-cy="step-addons">
      <h2 className="text-white text-2xl font-black mb-2">Experiências Exclusivas</h2>
      <p className="text-gray-400 mb-6">Aprimore sua experiência com nossos adicionais especiais.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {event.addons.map((addon) => {
          const isSelected = selected.includes(addon.id);
          return (
            <div
              key={addon.id}
              id={`addon-${addon.id}`}
              data-cy="addon-card"
              data-addon-id={addon.id}
              data-selected={isSelected}
              onClick={() => onToggle(addon.id)}
              className={`relative bg-[#13131f] border rounded-2xl p-5 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-purple-500 shadow-lg shadow-purple-900/30 bg-purple-900/10'
                  : 'border-purple-900/30 hover:border-purple-700/50'
              }`}
            >
              {/* Check */}
              <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-600'
              }`}>
                {isSelected && <span className="text-white text-xs font-bold">✓</span>}
              </div>

              <div className="flex items-start gap-4">
                <div className="text-4xl">{addon.image}</div>
                <div className="flex-1 pr-6">
                  <h3 className="text-white font-bold text-base mb-1">{addon.name}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-3">{addon.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-300 font-bold text-lg">
                      + R$ {addon.price.toFixed(2).replace('.', ',')}
                    </span>
                    {addon.limited && addon.remaining !== null && (
                      <span className="text-orange-400 text-xs bg-orange-900/20 border border-orange-700/30 px-2 py-0.5 rounded-full">
                        Apenas {addon.remaining} restantes
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 3: Personal data ────────────────────────────────────────────────────
function StepUserData({ data, onChange, errors }) {
  return (
    <div id="step-user-data" data-cy="step-user-data">
      <h2 className="text-white text-2xl font-black mb-2">Seus Dados</h2>
      <p className="text-gray-400 mb-6">Preencha seus dados para emissão dos ingressos.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { id: 'name', label: 'Nome Completo', placeholder: 'João da Silva', type: 'text', full: true },
          { id: 'email', label: 'E-mail', placeholder: 'joao@email.com', type: 'email' },
          { id: 'confirmEmail', label: 'Confirmar E-mail', placeholder: 'joao@email.com', type: 'email' },
          { id: 'cpf', label: 'CPF', placeholder: '000.000.000-00', type: 'text' },
          { id: 'phone', label: 'Telefone / WhatsApp', placeholder: '(11) 99999-9999', type: 'tel' },
          { id: 'birthdate', label: 'Data de Nascimento', placeholder: '', type: 'date' },
        ].map((field) => (
          <div key={field.id} className={field.full ? 'md:col-span-2' : ''}>
            <label
              htmlFor={`field-${field.id}`}
              className="block text-gray-300 text-sm font-medium mb-2"
            >
              {field.label}
              <span className="text-pink-500 ml-1">*</span>
            </label>
            <input
              id={`field-${field.id}`}
              data-cy={`field-${field.id}`}
              type={field.type}
              placeholder={field.placeholder}
              value={data[field.id] || ''}
              onChange={(e) => {
                let val = e.target.value;
                if (field.id === 'cpf') val = formatCPF(val);
                if (field.id === 'phone') val = formatPhone(val);
                onChange(field.id, val);
              }}
              className={`w-full bg-[#0f0f1a] border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors ${
                errors[field.id]
                  ? 'border-red-500 focus:border-red-400'
                  : 'border-purple-900/40 focus:border-purple-500'
              }`}
            />
            {errors[field.id] && (
              <p id={`error-${field.id}`} data-cy={`error-${field.id}`} className="text-red-400 text-xs mt-1">
                {errors[field.id]}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 bg-blue-900/20 border border-blue-700/30 rounded-xl p-4">
        <p className="text-blue-300 text-sm">
          🔒 Seus dados são protegidos por criptografia SSL e nunca serão compartilhados com terceiros.
        </p>
      </div>

      <div className="mt-4 bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-4">
        <p className="text-yellow-300 text-sm font-medium mb-1">💡 Dica de teste:</p>
        <p className="text-yellow-400/80 text-xs">
          CPF terminando em <strong>00</strong> simula pagamento recusado. Use qualquer outro CPF para aprovar.
        </p>
      </div>
    </div>
  );
}

// ─── Step 4: Payment ──────────────────────────────────────────────────────────
function StepPayment({ paymentData, onChange, errors, total, processing }) {
  const [method, setMethod] = useState(paymentData.method || 'credit');
  const pixCode = generatePixCode();

  const handleMethod = (m) => {
    setMethod(m);
    onChange('method', m);
  };

  return (
    <div id="step-payment" data-cy="step-payment">
      <h2 className="text-white text-2xl font-black mb-2">Pagamento</h2>
      <p className="text-gray-400 mb-6">Escolha a forma de pagamento e finalize sua compra.</p>

      {/* Total */}
      <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/30 border border-purple-700/40 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-gray-300 font-medium">Total a pagar</span>
          <span
            id="payment-total"
            data-cy="payment-total"
            className="text-white font-black text-3xl"
          >
            R$ {total.toFixed(2).replace('.', ',')}
          </span>
        </div>
      </div>

      {/* Payment method tabs */}
      <div id="payment-method-tabs" data-cy="payment-method-tabs" className="grid grid-cols-2 sm:flex gap-2 mb-6">
        {[
          { id: 'credit', labelShort: '💳 Crédito', labelFull: '💳 Cartão de Crédito' },
          { id: 'debit', labelShort: '💳 Débito', labelFull: '💳 Cartão de Débito' },
          { id: 'pix', labelShort: '⚡ PIX', labelFull: '⚡ PIX' },
          { id: 'boleto', labelShort: '📄 Boleto', labelFull: '📄 Boleto' },
        ].map((m) => (
          <button
            key={m.id}
            id={`payment-method-${m.id}`}
            data-cy="payment-method-btn"
            data-method={m.id}
            data-selected={method === m.id}
            onClick={() => handleMethod(m.id)}
            className={`flex-1 py-3 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              method === m.id
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-[#1a1a2e] text-gray-300 hover:text-white border border-purple-900/30'
            }`}
          >
            <span className="sm:hidden">{m.labelShort}</span>
            <span className="hidden sm:inline">{m.labelFull}</span>
          </button>
        ))}
      </div>

      {/* Credit/Debit card form */}
      {(method === 'credit' || method === 'debit') && (
        <div id="card-form" data-cy="card-form" className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Número do Cartão <span className="text-pink-500">*</span>
            </label>
            <input
              id="field-cardNumber"
              data-cy="field-card-number"
              type="text"
              placeholder="0000 0000 0000 0000"
              value={paymentData.cardNumber || ''}
              onChange={(e) => onChange('cardNumber', formatCard(e.target.value))}
              className={`w-full bg-[#0f0f1a] border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors ${
                errors.cardNumber ? 'border-red-500' : 'border-purple-900/40 focus:border-purple-500'
              }`}
            />
            {errors.cardNumber && (
              <p id="error-cardNumber" data-cy="error-card-number" className="text-red-400 text-xs mt-1">{errors.cardNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Nome no Cartão <span className="text-pink-500">*</span>
            </label>
            <input
              id="field-cardName"
              data-cy="field-card-name"
              type="text"
              placeholder="JOÃO DA SILVA"
              value={paymentData.cardName || ''}
              onChange={(e) => onChange('cardName', e.target.value.toUpperCase())}
              className={`w-full bg-[#0f0f1a] border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors ${
                errors.cardName ? 'border-red-500' : 'border-purple-900/40 focus:border-purple-500'
              }`}
            />
            {errors.cardName && <p className="text-red-400 text-xs mt-1">{errors.cardName}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Validade <span className="text-pink-500">*</span>
              </label>
              <input
                id="field-expiry"
                data-cy="field-expiry"
                type="text"
                placeholder="MM/AA"
                value={paymentData.expiry || ''}
                onChange={(e) => onChange('expiry', formatExpiry(e.target.value))}
                className={`w-full bg-[#0f0f1a] border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors ${
                  errors.expiry ? 'border-red-500' : 'border-purple-900/40 focus:border-purple-500'
                }`}
              />
              {errors.expiry && <p className="text-red-400 text-xs mt-1">{errors.expiry}</p>}
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                CVV <span className="text-pink-500">*</span>
              </label>
              <input
                id="field-cvv"
                data-cy="field-cvv"
                type="text"
                placeholder="123"
                maxLength={4}
                value={paymentData.cvv || ''}
                onChange={(e) => onChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                className={`w-full bg-[#0f0f1a] border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors ${
                  errors.cvv ? 'border-red-500' : 'border-purple-900/40 focus:border-purple-500'
                }`}
              />
              {errors.cvv && <p className="text-red-400 text-xs mt-1">{errors.cvv}</p>}
            </div>
          </div>

          {method === 'credit' && (
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Parcelamento</label>
              <select
                id="field-installments"
                data-cy="field-installments"
                value={paymentData.installments || '1'}
                onChange={(e) => onChange('installments', e.target.value)}
                className="w-full bg-[#0f0f1a] border border-purple-900/40 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              >
                {[1, 2, 3, 4, 5, 6, 10, 12].map((n) => (
                  <option key={n} value={n}>
                    {n}x de R$ {(total / n).toFixed(2).replace('.', ',')}
                    {n > 1 ? ' sem juros' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-3">
            <p className="text-yellow-300 text-xs">
              💡 Cartão começando com <strong>5555</strong> simula recusa. Use qualquer outro número para aprovar.
            </p>
          </div>
        </div>
      )}

      {/* PIX */}
      {method === 'pix' && (
        <div id="pix-section" data-cy="pix-section" className="space-y-4">
          <div className="bg-[#13131f] border border-purple-900/30 rounded-2xl p-6 text-center">
            <div className="text-6xl mb-4">⚡</div>
            <p className="text-gray-300 mb-2">Pague via PIX e receba a confirmação em segundos!</p>
            <div className="bg-[#0f0f1a] border border-purple-900/30 rounded-xl p-3 mb-4">
              <p className="text-purple-300 text-xs font-mono break-all">{pixCode.slice(0, 60)}...</p>
            </div>
            <button
              id="copy-pix-btn"
              data-cy="copy-pix-btn"
              onClick={() => navigator.clipboard.writeText(pixCode)}
              className="bg-purple-700 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors text-sm"
            >
              📋 Copiar Código PIX
            </button>
          </div>
          <p className="text-gray-500 text-sm text-center">
            Após o pagamento, clique em "Finalizar Pedido" para simular a confirmação.
          </p>
        </div>
      )}

      {/* Boleto */}
      {method === 'boleto' && (
        <div id="boleto-section" data-cy="boleto-section" className="bg-[#13131f] border border-purple-900/30 rounded-2xl p-6 text-center">
          <div className="text-6xl mb-4">📄</div>
          <p className="text-gray-300 mb-2">O boleto será gerado após a confirmação.</p>
          <p className="text-gray-400 text-sm">Prazo de vencimento: 3 dias úteis</p>
          <p className="text-orange-400 text-sm mt-3 font-medium">
            ⚠️ Os ingressos só serão liberados após a compensação do pagamento (1-3 dias úteis).
          </p>
        </div>
      )}

      {processing && (
        <div id="payment-processing" data-cy="payment-processing" className="mt-6 bg-purple-900/20 border border-purple-700/30 rounded-xl p-4 flex items-center gap-4">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <p className="text-purple-300 font-medium">Processando seu pagamento, aguarde...</p>
        </div>
      )}
    </div>
  );
}

// ─── Step 5: Confirmation ─────────────────────────────────────────────────────
function StepConfirmation({ order, error, onRetry, onReset }) {
  const navigate = useNavigate();

  if (error) {
    return (
      <div id="purchase-error" data-cy="purchase-error" className="text-center py-8">
        <div className="text-7xl mb-6">❌</div>
        <h2 className="text-red-400 text-2xl font-black mb-3">Pagamento Recusado</h2>
        <p className="text-gray-300 mb-2">{error}</p>
        <p className="text-gray-500 text-sm mb-8">Nenhum valor foi cobrado. Tente novamente com outro método.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            id="retry-payment-btn"
            data-cy="retry-payment-btn"
            onClick={onRetry}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:scale-105"
          >
            Tentar Novamente
          </button>
          <button
            id="go-events-btn"
            data-cy="go-events-btn"
            onClick={() => navigate('/eventos')}
            className="bg-white/10 border border-white/20 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:bg-white/20"
          >
            Ver Outros Eventos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="purchase-success" data-cy="purchase-success" className="text-center py-4">
      <div className="text-7xl mb-6 animate-bounce">🎉</div>
      <h2 className="text-green-400 text-2xl font-black mb-2">Compra Confirmada!</h2>
      <p className="text-gray-300 mb-1">Parabéns! Seus ingressos foram reservados com sucesso.</p>
      <p className="text-gray-400 text-sm mb-6">
        Um e-mail de confirmação será enviado para <strong className="text-white">{order?.userData?.email}</strong>
      </p>

      {/* Order card */}
      <div
        id="order-confirmation-card"
        data-cy="order-confirmation-card"
        className="bg-[#13131f] border border-green-700/40 rounded-2xl p-6 text-left mb-6 max-w-md mx-auto"
      >
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-green-900/40">
          <span className="text-gray-400 text-sm">Pedido</span>
          <span id="order-id" data-cy="order-id" className="text-green-400 font-bold font-mono">
            {order?.id}
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">Evento</span>
            <span className="text-white text-sm font-medium">{order?.event?.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">Data</span>
            <span className="text-white text-sm">{order?.event?.dateFormatted}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">Local</span>
            <span className="text-white text-sm">{order?.event?.venue}</span>
          </div>
          <div className="flex justify-between border-t border-purple-900/30 pt-2 mt-2">
            <span className="text-gray-300 font-semibold">Total pago</span>
            <span className="text-green-400 font-bold text-lg">
              R$ {order?.total?.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          id="view-tickets-btn"
          data-cy="view-tickets-btn"
          onClick={() => navigate('/meus-ingressos')}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:scale-105"
        >
          🎫 Ver Meus Ingressos
        </button>
        <button
          id="buy-more-btn"
          data-cy="buy-more-btn"
          onClick={() => navigate('/eventos')}
          className="bg-white/10 border border-white/20 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:bg-white/20"
        >
          Comprar Mais
        </button>
      </div>
    </div>
  );
}

// ─── Order Summary Sidebar ────────────────────────────────────────────────────
function OrderSummary({ event, ticketSelection, selectedAddons }) {
  const ticketLines = Object.entries(ticketSelection).filter(([, qty]) => qty > 0).map(([key, qty]) => {
    const [ticketId, type] = key.split('_');
    const ticket = event.tickets.find((t) => t.id === ticketId);
    const price = type === 'meia' ? ticket.halfPrice : ticket.price;
    return { label: `${ticket.name} (${type === 'meia' ? 'Meia' : 'Inteira'})`, qty, price, subtotal: qty * price };
  });

  const addonLines = selectedAddons.map((id) => {
    const addon = event.addons.find((a) => a.id === id);
    return { label: addon.name, price: addon.price };
  });

  const ticketsTotal = ticketLines.reduce((s, l) => s + l.subtotal, 0);
  const addonsTotal = addonLines.reduce((s, l) => s + l.price, 0);
  const serviceFee = parseFloat((ticketsTotal * 0.1).toFixed(2));
  const total = ticketsTotal + addonsTotal + serviceFee;

  return (
    <aside
      id="order-summary"
      data-cy="order-summary"
      className="bg-[#13131f] border border-purple-900/30 rounded-2xl p-5 h-fit sticky top-24"
    >
      <h3 className="text-white font-bold text-lg mb-4">Resumo do Pedido</h3>

      {/* Event info */}
      <div className="flex gap-3 mb-5 pb-5 border-b border-purple-900/30">
        <img src={event.image} alt={event.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
        <div>
          <p className="text-white font-semibold text-sm leading-tight">{event.title}</p>
          <p className="text-gray-400 text-xs mt-1">📅 {event.dateFormatted}</p>
          <p className="text-gray-400 text-xs">📍 {event.venue}</p>
        </div>
      </div>

      {/* Tickets */}
      {ticketLines.length > 0 && (
        <div className="space-y-2 mb-4">
          {ticketLines.map((line, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-300">{line.qty}× {line.label}</span>
              <span className="text-white">R$ {line.subtotal.toFixed(2).replace('.', ',')}</span>
            </div>
          ))}
        </div>
      )}

      {/* Addons */}
      {addonLines.length > 0 && (
        <div className="space-y-2 mb-4 pt-3 border-t border-purple-900/20">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Adicionais</p>
          {addonLines.map((line, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-300">{line.label}</span>
              <span className="text-purple-300">+ R$ {line.price.toFixed(2).replace('.', ',')}</span>
            </div>
          ))}
        </div>
      )}

      {/* Fee & Total */}
      <div className="pt-3 border-t border-purple-900/30 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Taxa de serviço (10%)</span>
          <span className="text-gray-300">R$ {serviceFee.toFixed(2).replace('.', ',')}</span>
        </div>
        <div className="flex justify-between font-bold text-lg pt-1">
          <span className="text-white">Total</span>
          <span
            id="summary-total"
            data-cy="summary-total"
            className="text-purple-300"
          >
            R$ {total.toFixed(2).replace('.', ',')}
          </span>
        </div>
      </div>
    </aside>
  );
}

// ─── Login Required Gate (modal overlay) ─────────────────────────────────────
function LoginGate({ eventId, onClose }) {
  const navigate = useNavigate();
  return (
    <div
      id="login-gate-overlay"
      data-cy="login-gate-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        id="login-gate"
        data-cy="login-gate"
        className="relative bg-[#13131f] border border-purple-700/50 rounded-2xl p-8 text-center w-full max-w-md shadow-2xl shadow-purple-900/40"
      >
        <button
          id="login-gate-close"
          data-cy="login-gate-close"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white text-2xl leading-none transition-colors"
          aria-label="Fechar"
        >
          ×
        </button>

        <div className="text-5xl mb-4">🔐</div>
        <h2 className="text-white text-xl font-black mb-2">Login necessário</h2>
        <p className="text-gray-400 mb-6">
          Para finalizar sua compra, faça login ou crie uma conta gratuita. Sua seleção será mantida.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            id="gate-login-btn"
            data-cy="gate-login-btn"
            onClick={() => navigate(`/login?redirect=/comprar/${eventId}`)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-8 py-3 rounded-xl hover:scale-105 transition-all"
          >
            Entrar na minha conta
          </button>
          <button
            id="gate-register-btn"
            data-cy="gate-register-btn"
            onClick={() => navigate(`/login?redirect=/comprar/${eventId}&tab=register`)}
            className="bg-white/10 border border-white/20 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/20 transition-all"
          >
            Criar conta grátis
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Purchase Page ───────────────────────────────────────────────────────
export default function Purchase() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const event = getEventById(eventId);

  const [step, setStep] = useState(1);
  const [ticketSelection, setTicketSelection] = useState({});
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [userData, setUserData] = useState({});
  const [userErrors, setUserErrors] = useState({});
  const [paymentData, setPaymentData] = useState({ method: 'credit', installments: '1' });
  const [paymentErrors, setPaymentErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [showLoginGate, setShowLoginGate] = useState(false);

  // Pre-fill user data from profile when user logs in
  useEffect(() => {
    if (user && Object.keys(userData).length === 0) {
      setUserData({
        name: user.name || '',
        email: user.email || '',
        confirmEmail: user.email || '',
        cpf: user.cpf || '',
        phone: user.phone || '',
        birthdate: user.birthdate || '',
      });
    }
    if (user && showLoginGate) setShowLoginGate(false);
  }, [user]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  if (!event) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-400 text-xl mb-4">Evento não encontrado.</p>
        <button onClick={() => navigate('/eventos')} className="bg-purple-700 text-white px-6 py-3 rounded-xl">
          Ver Eventos
        </button>
      </div>
    );
  }

  if (event.soldOut) {
    return (
      <div className="text-center py-24">
        <div className="text-6xl mb-4">😔</div>
        <p className="text-white text-2xl font-bold mb-2">Evento Esgotado</p>
        <p className="text-gray-400 mb-6">Todos os ingressos para este evento foram vendidos.</p>
        <button onClick={() => navigate('/eventos')} className="bg-purple-700 text-white px-6 py-3 rounded-xl">
          Ver Outros Eventos
        </button>
      </div>
    );
  }

  const calcTotal = () => {
    const tickets = Object.entries(ticketSelection).reduce((s, [key, qty]) => {
      const [ticketId, type] = key.split('_');
      const ticket = event.tickets.find((t) => t.id === ticketId);
      return s + qty * (type === 'meia' ? ticket.halfPrice : ticket.price);
    }, 0);
    const addons = selectedAddons.reduce((s, id) => {
      const addon = event.addons.find((a) => a.id === id);
      return s + (addon?.price || 0);
    }, 0);
    const fee = parseFloat((tickets * 0.1).toFixed(2));
    return tickets + addons + fee;
  };

  const totalTickets = Object.values(ticketSelection).reduce((s, v) => s + v, 0);

  const handleTicketChange = (key, qty) => {
    setTicketSelection((prev) => ({ ...prev, [key]: qty }));
  };

  const handleAddonToggle = (id) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const validateUserData = () => {
    const errs = {};
    if (!userData.name?.trim()) errs.name = 'Nome é obrigatório';
    if (!userData.email?.trim()) errs.email = 'E-mail é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) errs.email = 'E-mail inválido';
    if (userData.email !== userData.confirmEmail) errs.confirmEmail = 'E-mails não conferem';
    if (!userData.cpf?.trim()) errs.cpf = 'CPF é obrigatório';
    else if (userData.cpf.replace(/\D/g, '').length < 11) errs.cpf = 'CPF inválido';
    if (!userData.phone?.trim()) errs.phone = 'Telefone é obrigatório';
    if (!userData.birthdate) errs.birthdate = 'Data de nascimento é obrigatória';
    return errs;
  };

  const validatePayment = () => {
    const errs = {};
    const { method } = paymentData;
    if (method === 'credit' || method === 'debit') {
      if (!paymentData.cardNumber || paymentData.cardNumber.replace(/\D/g, '').length < 16)
        errs.cardNumber = 'Número do cartão inválido';
      if (!paymentData.cardName?.trim()) errs.cardName = 'Nome no cartão é obrigatório';
      if (!paymentData.expiry || paymentData.expiry.length < 5) errs.expiry = 'Validade inválida';
      if (!paymentData.cvv || paymentData.cvv.length < 3) errs.cvv = 'CVV inválido';
    }
    return errs;
  };

  const handleNext = async () => {
    if (step === 1) {
      if (totalTickets === 0) return;
      // Require login before proceeding past ticket selection
      if (!user) { setShowLoginGate(true); return; }
      setStep(2);
    } else if (step === 2) {
      if (!user) { setShowLoginGate(true); return; }
      setStep(3);
    } else if (step === 3) {
      const errs = validateUserData();
      setUserErrors(errs);
      if (Object.keys(errs).length === 0) setStep(4);
    } else if (step === 4) {
      const errs = validatePayment();
      setPaymentErrors(errs);
      if (Object.keys(errs).length > 0) return;

      setProcessing(true);
      const result = await processPayment({ ...paymentData, cpf: userData.cpf });
      setProcessing(false);

      if (result.success) {
        const order = storage.saveOrder({
          userId: user?.id,
          event: { id: event.id, title: event.title, dateFormatted: event.dateFormatted, venue: event.venue },
          tickets: ticketSelection,
          addons: selectedAddons,
          userData,
          paymentMethod: paymentData.method,
          transactionId: result.transactionId,
          total: calcTotal(),
          status: 'confirmed',
        });
        setConfirmedOrder(order);
        setPaymentError(null);
      } else {
        setPaymentError(result.error);
      }
      setStep(5);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const total = calcTotal();

  return (
    <>
    {showLoginGate && (
      <LoginGate eventId={eventId} onClose={() => setShowLoginGate(false)} />
    )}
    <div id="purchase-page" data-cy="purchase-page" className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Event header */}
      <div
        id="purchase-event-header"
        data-cy="purchase-event-header"
        className="relative rounded-2xl overflow-hidden mb-8 h-36 md:h-48"
      >
        <img src={event.banner} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f1a] via-[#0f0f1a]/70 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-6">
          <span className="text-purple-300 text-sm font-medium mb-1">Comprando ingressos para</span>
          <h1 className="text-white text-2xl md:text-3xl font-black">{event.title}</h1>
          <p className="text-gray-300 text-sm mt-1">
            📅 {event.dateFormatted} às {event.time} — 📍 {event.venue}, {event.city}
          </p>
        </div>
      </div>

      <StepIndicator currentStep={step} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <div id="purchase-step-content" data-cy="purchase-step-content" className="bg-[#13131f] border border-purple-900/30 rounded-2xl p-6 md:p-8">
            {step === 1 && (
              <StepTickets event={event} selection={ticketSelection} onChange={handleTicketChange} />
            )}
            {step === 2 && (
              <StepAddons event={event} selected={selectedAddons} onToggle={handleAddonToggle} />
            )}
            {step === 3 && (
              <StepUserData data={userData} onChange={(k, v) => setUserData((p) => ({ ...p, [k]: v }))} errors={userErrors} />
            )}
            {step === 4 && (
              <StepPayment
                paymentData={paymentData}
                onChange={(k, v) => setPaymentData((p) => ({ ...p, [k]: v }))}
                errors={paymentErrors}
                total={total}
                processing={processing}
              />
            )}
            {step === 5 && (
              <StepConfirmation
                order={confirmedOrder}
                error={paymentError}
                onRetry={() => setStep(4)}
                onReset={() => navigate('/eventos')}
              />
            )}
          </div>

        </div>

        {/* Order summary sidebar */}
        {step < 5 && (
          <OrderSummary event={event} ticketSelection={ticketSelection} selectedAddons={selectedAddons} />
        )}

        {/* Navigation buttons */}
        {step < 5 && (
          <div id="purchase-nav-buttons" data-cy="purchase-nav-buttons" className="col-span-full flex items-center justify-between gap-4">
            <button
              id="back-btn"
              data-cy="back-btn"
              onClick={handleBack}
              disabled={step === 1}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed font-medium"
            >
              ← Voltar
            </button>

            <button
              id="next-btn"
              data-cy="next-btn"
              onClick={handleNext}
              disabled={(step === 1 && totalTickets === 0) || processing}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-xl transition-all hover:scale-105 disabled:hover:scale-100 shadow-lg shadow-purple-900/40"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processando...
                </>
              ) : step === 4 ? (
                '🔒 Finalizar Pedido'
              ) : (
                'Continuar →'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
