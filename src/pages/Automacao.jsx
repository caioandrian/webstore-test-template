import { useState } from 'react';

const SELECTORS = [
  {
    section: 'Header / Navegação',
    icon: '🧭',
    items: [
      { selector: 'header', element: 'header', desc: 'Cabeçalho principal da página' },
      { selector: 'logo', element: 'button', desc: 'Logo — navega para a Home' },
      { selector: 'desktop-nav', element: 'nav', desc: 'Navegação desktop' },
      { selector: 'nav-home', element: 'a', desc: 'Link Início' },
      { selector: 'nav-eventos', element: 'a', desc: 'Link Eventos' },
      { selector: 'nav-contato', element: 'a', desc: 'Link Contato' },
      { selector: 'header-login-btn', element: 'button', desc: 'Botão Entrar (usuário deslogado)' },
      { selector: 'buy-tickets-cta', element: 'button', desc: 'Botão Comprar Ingressos (usuário deslogado)' },
      { selector: 'user-menu-btn', element: 'button', desc: 'Avatar do usuário — abre dropdown (logado)' },
      { selector: 'user-dropdown', element: 'div', desc: 'Dropdown do usuário logado' },
      { selector: 'menu-profile', element: 'button', desc: 'Item Meu Perfil no dropdown' },
      { selector: 'menu-orders', element: 'button', desc: 'Item Minhas Compras no dropdown' },
      { selector: 'menu-tickets', element: 'button', desc: 'Item Meus Ingressos no dropdown' },
      { selector: 'header-logout-btn', element: 'button', desc: 'Botão Sair no dropdown' },
      { selector: 'mobile-menu-btn', element: 'button', desc: 'Botão menu hambúrguer (mobile)' },
      { selector: 'mobile-menu', element: 'div', desc: 'Menu mobile expandido' },
      { selector: 'mobile-nav-home', element: 'a', desc: 'Link Início no menu mobile' },
      { selector: 'mobile-nav-eventos', element: 'a', desc: 'Link Eventos no menu mobile' },
      { selector: 'mobile-nav-contato', element: 'a', desc: 'Link Contato no menu mobile' },
      { selector: 'mobile-nav-perfil', element: 'a', desc: 'Link Perfil no menu mobile (logado)' },
      { selector: 'mobile-login-btn', element: 'button', desc: 'Botão Entrar no menu mobile' },
      { selector: 'mobile-buy-btn', element: 'button', desc: 'Botão Comprar no menu mobile' },
    ],
  },
  {
    section: 'Home',
    icon: '🏠',
    items: [
      { selector: 'home-page', element: 'main', desc: 'Página inicial' },
      { selector: 'hero', element: 'section', desc: 'Seção hero' },
      { selector: 'hero-badge', element: 'span', desc: 'Badge "Os melhores shows do Brasil"' },
      { selector: 'hero-cta-primary', element: 'button', desc: 'CTA primário — Ver Todos os Eventos' },
      { selector: 'hero-cta-secondary', element: 'button', desc: 'CTA secundário — Fale Conosco' },
      { selector: 'hero-stat', element: 'div', desc: 'Cards de estatísticas (múltiplos)' },
      { selector: 'featured-events', element: 'section', desc: 'Seção Eventos em Destaque' },
      { selector: 'see-all-events-btn', element: 'button', desc: 'Botão Ver todos → (destaque)' },
      { selector: 'categories', element: 'section', desc: 'Seção de categorias' },
      { selector: 'category-btn', element: 'button', desc: 'Botão de categoria (Rock, Sertanejo…)' },
      { selector: 'trust-section', element: 'section', desc: 'Seção Por que escolher a ShowTickets' },
      { selector: 'trust-card', element: 'div', desc: 'Cards de confiança (múltiplos)' },
      { selector: 'all-events-preview', element: 'section', desc: 'Seção Próximos Eventos' },
      { selector: 'see-all-btn-bottom', element: 'button', desc: 'Botão Ver todos → (inferior)' },
      { selector: 'cta-banner', element: 'section', desc: 'Banner CTA final' },
      { selector: 'final-cta-btn', element: 'button', desc: 'Botão Garantir Meu Ingresso' },
    ],
  },
  {
    section: 'Login & Cadastro',
    icon: '🔐',
    url: '#/login',
    items: [
      { selector: 'login-page', element: 'main', desc: 'Página de autenticação' },
      { selector: 'auth-tabs', element: 'div', desc: 'Container das abas Entrar / Criar Conta' },
      { selector: 'tab-login', element: 'button', desc: 'Aba Entrar' },
      { selector: 'tab-register', element: 'button', desc: 'Aba Criar Conta' },
      { selector: 'login-form', element: 'form', desc: 'Formulário de login' },
      { selector: 'login-email', element: 'input', desc: 'Campo e-mail do login' },
      { selector: 'login-password', element: 'input', desc: 'Campo senha do login' },
      { selector: 'login-error', element: 'div', desc: 'Mensagem de erro do login' },
      { selector: 'login-submit-btn', element: 'button', desc: 'Botão Entrar (submit)' },
      { selector: 'switch-to-register', element: 'button', desc: 'Link para tela de cadastro' },
      { selector: 'register-form', element: 'form', desc: 'Formulário de cadastro' },
      { selector: 'reg-name', element: 'input', desc: 'Campo Nome Completo no cadastro' },
      { selector: 'reg-email', element: 'input', desc: 'Campo E-mail no cadastro' },
      { selector: 'reg-cpf', element: 'input', desc: 'Campo CPF no cadastro' },
      { selector: 'reg-phone', element: 'input', desc: 'Campo Telefone no cadastro' },
      { selector: 'reg-birthdate', element: 'input', desc: 'Campo Data de Nascimento no cadastro' },
      { selector: 'reg-password', element: 'input', desc: 'Campo Senha no cadastro' },
      { selector: 'reg-confirm-password', element: 'input', desc: 'Campo Confirmar Senha no cadastro' },
      { selector: 'register-api-error', element: 'div', desc: 'Mensagem de erro do cadastro' },
      { selector: 'register-submit-btn', element: 'button', desc: 'Botão Criar Conta Grátis (submit)' },
      { selector: 'switch-to-login', element: 'button', desc: 'Link para tela de login' },
      { selector: 'back-to-events-link', element: 'a', desc: 'Link Voltar para eventos' },
    ],
  },
  {
    section: 'Compra — Passo 1: Ingressos',
    icon: '🎫',
    url: '#/comprar/rock-festival-2025',
    items: [
      { selector: 'purchase-page', element: 'div', desc: 'Página de compra' },
      { selector: 'purchase-event-header', element: 'div', desc: 'Banner do evento' },
      { selector: 'purchase-step-content', element: 'div', desc: 'Conteúdo do passo atual' },
      { selector: 'step-tickets', element: 'div', desc: 'Conteúdo do passo 1 — Ingressos' },
      { selector: 'ticket-option', element: 'div', desc: 'Card de opção de ingresso (múltiplos)' },
      { selector: 'qty-decrease', element: 'button', desc: 'Botão − diminuir quantidade' },
      { selector: 'qty-value', element: 'span', desc: 'Valor atual da quantidade' },
      { selector: 'qty-increase', element: 'button', desc: 'Botão + aumentar quantidade' },
      { selector: 'order-summary', element: 'aside', desc: 'Sidebar: Resumo do Pedido' },
      { selector: 'summary-total', element: 'span', desc: 'Total exibido no resumo' },
      { selector: 'purchase-nav-buttons', element: 'div', desc: 'Container dos botões Voltar/Continuar' },
      { selector: 'back-btn', element: 'button', desc: 'Botão Voltar' },
      { selector: 'next-btn', element: 'button', desc: 'Botão Continuar / Finalizar Pedido' },
    ],
  },
  {
    section: 'Compra — Modal de Login',
    icon: '🔒',
    items: [
      { selector: 'login-gate-overlay', element: 'div', desc: 'Overlay escuro do modal (aparece se não logado ao avançar)' },
      { selector: 'login-gate', element: 'div', desc: 'Card do modal de login necessário' },
      { selector: 'login-gate-close', element: 'button', desc: 'Botão × fechar modal' },
      { selector: 'gate-login-btn', element: 'button', desc: 'Botão Entrar na minha conta' },
      { selector: 'gate-register-btn', element: 'button', desc: 'Botão Criar conta grátis' },
    ],
  },
  {
    section: 'Compra — Passo 2 a 4',
    icon: '💳',
    items: [
      { selector: 'step-addons', element: 'div', desc: 'Passo 2 — Experiências Exclusivas' },
      { selector: 'addon-card', element: 'div', desc: 'Card de adicional clicável (múltiplos)' },
      { selector: 'step-user-data', element: 'div', desc: 'Passo 3 — Seus Dados' },
      { selector: 'field-name', element: 'input', desc: 'Campo Nome Completo (passo 3)' },
      { selector: 'field-email', element: 'input', desc: 'Campo E-mail (passo 3)' },
      { selector: 'field-confirmEmail', element: 'input', desc: 'Campo Confirmar E-mail (passo 3)' },
      { selector: 'field-cpf', element: 'input', desc: 'Campo CPF (passo 3)' },
      { selector: 'field-phone', element: 'input', desc: 'Campo Telefone (passo 3)' },
      { selector: 'field-birthdate', element: 'input', desc: 'Campo Data de Nascimento (passo 3)' },
      { selector: 'step-payment', element: 'div', desc: 'Passo 4 — Pagamento' },
      { selector: 'payment-total', element: 'span', desc: 'Total a pagar exibido no passo 4' },
      { selector: 'payment-method-tabs', element: 'div', desc: 'Container das abas de pagamento' },
      { selector: 'payment-method-btn', element: 'button', desc: 'Botão de método (credit/debit/pix/boleto)' },
      { selector: 'card-form', element: 'div', desc: 'Formulário do cartão' },
      { selector: 'field-card-number', element: 'input', desc: 'Campo Número do Cartão' },
      { selector: 'field-card-name', element: 'input', desc: 'Campo Nome no Cartão' },
      { selector: 'field-expiry', element: 'input', desc: 'Campo Validade MM/AA' },
      { selector: 'field-cvv', element: 'input', desc: 'Campo CVV' },
      { selector: 'field-installments', element: 'select', desc: 'Select de parcelamento (crédito)' },
      { selector: 'pix-section', element: 'div', desc: 'Seção PIX com código' },
      { selector: 'copy-pix-btn', element: 'button', desc: 'Botão Copiar Código PIX' },
      { selector: 'boleto-section', element: 'div', desc: 'Seção Boleto' },
      { selector: 'payment-processing', element: 'div', desc: 'Indicador de processamento do pagamento' },
    ],
  },
  {
    section: 'Compra — Passo 5: Confirmação',
    icon: '✅',
    items: [
      { selector: 'purchase-success', element: 'div', desc: 'Tela de compra confirmada' },
      { selector: 'order-confirmation-card', element: 'div', desc: 'Card com resumo do pedido aprovado' },
      { selector: 'order-id', element: 'span', desc: 'ID do pedido gerado' },
      { selector: 'view-tickets-btn', element: 'button', desc: 'Botão Ver Meus Ingressos' },
      { selector: 'buy-more-btn', element: 'button', desc: 'Botão Comprar Mais' },
      { selector: 'purchase-error', element: 'div', desc: 'Tela de pagamento recusado' },
      { selector: 'retry-payment-btn', element: 'button', desc: 'Botão Tentar Novamente' },
      { selector: 'go-events-btn', element: 'button', desc: 'Botão Ver Outros Eventos' },
    ],
  },
  {
    section: 'Perfil',
    icon: '👤',
    url: '#/perfil',
    items: [
      { selector: 'profile-page', element: 'main', desc: 'Página de perfil do usuário' },
      { selector: 'toast-notification', element: 'div', desc: 'Notificação toast de sucesso/erro' },
      { selector: 'profile-name', element: 'h1', desc: 'Nome do usuário no cabeçalho do perfil' },
      { selector: 'profile-nav', element: 'nav', desc: 'Navegação lateral do perfil' },
      { selector: 'profile-nav-info', element: 'button', desc: 'Nav — Dados Pessoais' },
      { selector: 'profile-nav-security', element: 'button', desc: 'Nav — Segurança' },
      { selector: 'profile-nav-orders', element: 'button', desc: 'Nav — Minhas Compras' },
      { selector: 'logout-btn', element: 'button', desc: 'Botão Sair da conta' },
      { selector: 'profile-info-section', element: 'div', desc: 'Seção Dados Pessoais' },
      { selector: 'profile-info-form', element: 'form', desc: 'Formulário de dados pessoais' },
      { selector: 'profile-name-field', element: 'input', desc: 'Campo Nome no perfil' },
      { selector: 'profile-email-field', element: 'input', desc: 'Campo E-mail no perfil' },
      { selector: 'profile-cpf-field', element: 'input', desc: 'Campo CPF no perfil (desabilitado)' },
      { selector: 'profile-phone-field', element: 'input', desc: 'Campo Telefone no perfil' },
      { selector: 'profile-birthdate-field', element: 'input', desc: 'Campo Data de Nascimento no perfil' },
      { selector: 'save-profile-btn', element: 'button', desc: 'Botão Salvar Alterações' },
      { selector: 'profile-security-section', element: 'div', desc: 'Seção Segurança' },
      { selector: 'profile-security-form', element: 'form', desc: 'Formulário de troca de senha' },
      { selector: 'field-current-password', element: 'input', desc: 'Campo Senha Atual' },
      { selector: 'field-new-password', element: 'input', desc: 'Campo Nova Senha' },
      { selector: 'field-confirm-password', element: 'input', desc: 'Campo Confirmar Nova Senha' },
      { selector: 'save-password-btn', element: 'button', desc: 'Botão Alterar Senha' },
      { selector: 'profile-orders-section', element: 'div', desc: 'Seção Minhas Compras' },
      { selector: 'profile-orders-empty', element: 'div', desc: 'Estado vazio (sem compras)' },
      { selector: 'go-buy-btn', element: 'button', desc: 'Botão Ver Eventos (estado vazio)' },
      { selector: 'profile-order-card', element: 'div', desc: 'Card de pedido (múltiplos)' },
      { selector: 'order-status-badge', element: 'span', desc: 'Badge de status do pedido' },
      { selector: 'order-id-label', element: 'p', desc: 'Label com ID do pedido' },
      { selector: 'order-total-label', element: 'p', desc: 'Label com total pago' },
      { selector: 'toggle-order-details', element: 'button', desc: 'Botão expandir/recolher detalhes' },
      { selector: 'order-details-expanded', element: 'div', desc: 'Conteúdo expandido do pedido' },
    ],
  },
  {
    section: 'Meus Ingressos',
    icon: '🎟️',
    url: '#/meus-ingressos',
    items: [
      { selector: 'my-tickets-page', element: 'main', desc: 'Página Meus Ingressos' },
      { selector: 'my-tickets-title', element: 'h1', desc: 'Título da página (logado)' },
      { selector: 'go-to-profile-btn', element: 'button', desc: 'Botão Meu Perfil' },
      { selector: 'orders-list', element: 'div', desc: 'Lista de pedidos' },
      { selector: 'ticket-card', element: 'div', desc: 'Card de ingresso (múltiplos)' },
      { selector: 'order-event-title', element: 'p', desc: 'Título do evento no card' },
      { selector: 'order-status', element: 'span', desc: 'Badge de status' },
      { selector: 'order-id-display', element: 'p', desc: 'ID do pedido no card' },
      { selector: 'order-total', element: 'p', desc: 'Total pago no card' },
      { selector: 'expand-order-btn', element: 'button', desc: 'Botão expandir detalhes do ingresso' },
      { selector: 'order-details', element: 'div', desc: 'Detalhes expandidos do ingresso' },
      { selector: 'no-tickets', element: 'div', desc: 'Estado vazio — sem ingressos' },
      { selector: 'discover-events-btn', element: 'button', desc: 'Botão Descobrir Eventos (estado vazio)' },
      { selector: 'login-to-see-tickets-btn', element: 'button', desc: 'Botão Entrar (não logado)' },
      { selector: 'explore-events-btn', element: 'button', desc: 'Botão Ver Eventos (não logado)' },
    ],
  },
  {
    section: 'Rodapé',
    icon: '🦶',
    items: [
      { selector: 'footer', element: 'footer', desc: 'Rodapé da página' },
      { selector: 'social-instagram', element: 'a', desc: 'Link Instagram' },
      { selector: 'social-twitter', element: 'a', desc: 'Link Twitter' },
      { selector: 'social-facebook', element: 'a', desc: 'Link Facebook' },
      { selector: 'social-youtube', element: 'a', desc: 'Link YouTube' },
    ],
  },
];

const MOCK_SCENARIOS = [
  {
    label: 'Pagamento APROVADO',
    color: 'green',
    items: [
      { field: 'CPF', value: 'Qualquer CPF válido (exceto terminado em 00)', example: '123.456.789-01' },
      { field: 'Cartão', value: 'Qualquer número (exceto iniciado com 5555)', example: '4111 1111 1111 1111' },
    ],
  },
  {
    label: 'Pagamento RECUSADO',
    color: 'red',
    items: [
      { field: 'CPF', value: 'CPF terminando em 00', example: '123.456.789-00' },
      { field: 'Cartão', value: 'Número iniciando com 5555', example: '5555 1234 5678 9012' },
    ],
  },
];

const LS_KEYS = ['showtickets_session', 'showtickets_users', 'showtickets_orders'];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    const val = `[data-cy="${e.currentTarget.dataset.selector}"]`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(val).catch(() => fallbackCopy(val));
    } else {
      fallbackCopy(val);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      data-selector={text}
      onClick={handleCopy}
      title={`Copiar: [data-cy="${text}"]`}
      className="ml-1 px-1.5 py-0.5 text-xs rounded bg-purple-900/30 hover:bg-purple-700/40 text-purple-300 transition-colors flex-shrink-0"
    >
      {copied ? '✓' : '⎘'}
    </button>
  );
}

function fallbackCopy(text) {
  const el = document.createElement('textarea');
  el.value = text;
  el.style.position = 'fixed';
  el.style.opacity = '0';
  document.body.appendChild(el);
  el.focus();
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}

function SectionAccordion({ section }) {
  const [open, setOpen] = useState(false);
  const total = section.items.length;

  return (
    <div className="bg-[#13131f] border border-purple-900/30 rounded-2xl overflow-hidden">
      <button
        id={`accordion-${section.section.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`}
        data-cy="accordion-toggle"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{section.icon}</span>
          <div>
            <p className="text-white font-bold">{section.section}</p>
            <p className="text-gray-500 text-xs">{total} seletor{total !== 1 ? 'es' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {section.url && (
            <a
              href={section.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-purple-400 hover:text-purple-300 text-xs px-2 py-1 rounded bg-purple-900/20 border border-purple-700/30 transition-colors hidden sm:block"
            >
              Abrir página ↗
            </a>
          )}
          <svg className={`w-5 h-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="border-t border-purple-900/20">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-purple-900/10 text-left">
                  <th className="px-4 py-2 text-gray-400 font-semibold text-xs uppercase tracking-wider">Seletor</th>
                  <th className="px-4 py-2 text-gray-400 font-semibold text-xs uppercase tracking-wider hidden sm:table-cell">Elemento</th>
                  <th className="px-4 py-2 text-gray-400 font-semibold text-xs uppercase tracking-wider">Descrição</th>
                </tr>
              </thead>
              <tbody>
                {section.items.map((item, i) => (
                  <tr key={item.selector} className={`border-t border-purple-900/10 ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1">
                        <code className="text-purple-300 font-mono text-xs bg-purple-900/20 px-1.5 py-0.5 rounded whitespace-nowrap">
                          {item.selector}
                        </code>
                        <CopyButton text={item.selector} />
                      </div>
                    </td>
                    <td className="px-4 py-2.5 hidden sm:table-cell">
                      <span className="text-gray-500 text-xs font-mono">&lt;{item.element}&gt;</span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-300 text-xs leading-relaxed">{item.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Automacao() {
  const [resetStatus, setResetStatus] = useState(null);
  const [search, setSearch] = useState('');

  const totalSelectors = SELECTORS.reduce((s, sec) => s + sec.items.length, 0);

  const handleReset = () => {
    LS_KEYS.forEach((k) => localStorage.removeItem(k));
    setResetStatus('success');
    setTimeout(() => setResetStatus(null), 3000);
  };

  const filtered = search.trim()
    ? SELECTORS.map((sec) => ({
        ...sec,
        items: sec.items.filter(
          (it) =>
            it.selector.includes(search.toLowerCase()) ||
            it.desc.toLowerCase().includes(search.toLowerCase()) ||
            it.element.includes(search.toLowerCase())
        ),
      })).filter((sec) => sec.items.length > 0)
    : SELECTORS;

  return (
    <main id="automacao-page" data-cy="automacao-page" className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-purple-700/20 border border-purple-600/30 text-purple-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
          🤖 Automação de Testes
        </div>
        <h1 className="text-white text-3xl sm:text-4xl font-black mb-3">
          Playground de Automação
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Ambiente pensado para iniciantes em automação de testes. Todos os elementos interativos possuem
          atributos <code className="text-purple-300 bg-purple-900/20 px-1 rounded">data-cy</code> e{' '}
          <code className="text-purple-300 bg-purple-900/20 px-1 rounded">id</code> para facilitar a seleção.
        </p>
        <div className="flex flex-wrap gap-3 mt-4 text-sm text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            {totalSelectors} seletores documentados
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
            Compatível com Cypress, Playwright, Selenium
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Estado isolado via localStorage
          </span>
        </div>
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        {/* Reset card */}
        <div id="reset-state-card" data-cy="reset-state-card" className="bg-[#13131f] border border-purple-900/30 rounded-2xl p-6">
          <div className="flex items-start gap-4 mb-4">
            <span className="text-3xl">🔄</span>
            <div>
              <h2 className="text-white font-black text-lg">Resetar Estado</h2>
              <p className="text-gray-400 text-sm mt-1">
                Apaga sessão, usuários e pedidos do localStorage. Use antes de cada suite de testes para garantir estado limpo.
              </p>
            </div>
          </div>
          <div className="bg-[#0f0f1a] rounded-xl p-3 mb-4 font-mono text-xs text-gray-400 space-y-1">
            {LS_KEYS.map((k) => (
              <p key={k}><span className="text-pink-400">localStorage</span>.removeItem(<span className="text-green-300">'{k}'</span>)</p>
            ))}
          </div>
          <button
            id="reset-state-btn"
            data-cy="reset-state-btn"
            onClick={handleReset}
            className="w-full bg-gradient-to-r from-red-700 to-pink-700 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-95"
          >
            🗑️ Limpar Estado Agora
          </button>
          {resetStatus === 'success' && (
            <p id="reset-success-msg" data-cy="reset-success-msg" className="text-green-400 text-sm text-center mt-3 font-medium animate-pulse">
              ✓ Estado limpo com sucesso! Recarregue a página.
            </p>
          )}
        </div>

        {/* Mock scenarios card */}
        <div id="mock-scenarios-card" data-cy="mock-scenarios-card" className="bg-[#13131f] border border-purple-900/30 rounded-2xl p-6">
          <div className="flex items-start gap-4 mb-4">
            <span className="text-3xl">🎭</span>
            <div>
              <h2 className="text-white font-black text-lg">Cenários de Mock</h2>
              <p className="text-gray-400 text-sm mt-1">
                Sem backend real. Use estes dados para simular aprovação ou recusa de pagamento.
              </p>
            </div>
          </div>
          {MOCK_SCENARIOS.map((scenario) => (
            <div
              key={scenario.label}
              data-cy={`mock-scenario-${scenario.color}`}
              className={`rounded-xl p-4 mb-3 border ${
                scenario.color === 'green'
                  ? 'bg-green-900/15 border-green-700/30'
                  : 'bg-red-900/15 border-red-700/30'
              }`}
            >
              <p className={`font-bold text-sm mb-2 ${scenario.color === 'green' ? 'text-green-400' : 'text-red-400'}`}>
                {scenario.color === 'green' ? '✓' : '✗'} {scenario.label}
              </p>
              {scenario.items.map((it) => (
                <div key={it.field} className="flex justify-between text-xs gap-2 mb-1">
                  <span className="text-gray-400 font-medium">{it.field}:</span>
                  <span className="text-gray-300 text-right">{it.example}</span>
                </div>
              ))}
            </div>
          ))}
          <p className="text-gray-600 text-xs mt-2">
            PIX e Boleto sempre retornam sucesso independente dos dados.
          </p>
        </div>
      </div>

      {/* Como usar */}
      <div id="how-to-use" data-cy="how-to-use" className="bg-[#13131f] border border-purple-900/30 rounded-2xl p-6 mb-8">
        <h2 className="text-white font-black text-lg mb-4">Como usar os seletores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              tool: 'Cypress',
              color: 'text-green-400',
              code: "cy.get('[data-cy=\"login-email\"]')\n  .type('user@email.com')",
            },
            {
              tool: 'Playwright',
              color: 'text-blue-400',
              code: "await page\n  .locator('[data-cy=\"login-email\"]')\n  .fill('user@email.com')",
            },
            {
              tool: 'Selenium (Python)',
              color: 'text-yellow-400',
              code: 'driver.find_element(\n  By.CSS_SELECTOR,\n  \'[data-cy="login-email"]\')',
            },
          ].map((ex) => (
            <div key={ex.tool} className="bg-[#0f0f1a] rounded-xl p-4">
              <p className={`text-xs font-bold mb-2 ${ex.color}`}>{ex.tool}</p>
              <pre className="text-gray-300 text-xs font-mono whitespace-pre-wrap leading-relaxed">{ex.code}</pre>
            </div>
          ))}
        </div>
      </div>

      {/* Selector reference */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 id="selectors-title" data-cy="selectors-title" className="text-white font-black text-xl">
            Referência de Seletores
          </h2>
          <input
            id="selector-search"
            data-cy="selector-search"
            type="text"
            placeholder="Buscar seletor ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#13131f] border border-purple-900/40 focus:border-purple-500 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none text-sm w-full sm:w-72 transition-colors"
          />
        </div>

        {filtered.length === 0 ? (
          <div id="no-results" data-cy="no-results" className="text-center py-12 text-gray-500">
            Nenhum seletor encontrado para "<span className="text-gray-300">{search}</span>".
          </div>
        ) : (
          <div id="selectors-list" data-cy="selectors-list" className="space-y-3">
            {filtered.map((sec) => (
              <SectionAccordion key={sec.section} section={sec} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
