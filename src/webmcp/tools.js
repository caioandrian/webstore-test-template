// Ferramentas WebMCP da loja.
//
// Cada ferramenta representa uma capacidade que o usuario ja possui pela
// interface. Nao existe ferramenta generica de execucao, consulta a banco,
// leitura de arquivo ou acesso a codigo-fonte, e nenhuma ferramenta alcanca
// o Ground Truth do benchmark.

import { events, getEventById } from '../data/mockEvents.js';
import { storage } from '../utils/localStorage.js';
import { buildPurchaseQuote } from '../utils/pricing.js';
import { ERROR_CODES, ok, toolError } from './result.js';

const SESSION_KEY = 'showtickets_session';

const APP_ROUTES = ['/', '/eventos', '/comprar', '/meus-ingressos', '/contato', '/login', '/perfil', '/automacao'];

// Mesma lista oferecida pelo filtro da pagina de eventos (src/pages/Events.jsx),
// incluindo categorias que hoje nao possuem evento. A superficie WebMCP espelha
// a interface; nao corrige nem esconde o comportamento existente.
const CATEGORIES = ['Rock', 'Sertanejo', 'Eletrônica', 'Pagode', 'Forró', 'MPB'];

const BRL = (value) => `R$ ${value.toFixed(2).replace('.', ',')}`;

// Projecoes explicitas: um campo novo no catalogo nao vaza sozinho.
const toTicket = (t) => ({
  id: t.id,
  name: t.name,
  price: t.price,
  halfPrice: t.halfPrice,
  available: t.available,
});

const toAddon = (a) => ({
  id: a.id,
  name: a.name,
  description: a.description,
  price: a.price,
  limited: a.limited,
  remaining: a.remaining,
});

const priceFrom = (event) =>
  event.tickets.length ? Math.min(...event.tickets.map((t) => t.price)) : null;

const toSummary = (event) => ({
  id: event.id,
  title: event.title,
  subtitle: event.subtitle,
  category: event.category,
  dateFormatted: event.dateFormatted,
  time: event.time,
  venue: event.venue,
  city: event.city,
  featured: event.featured,
  soldOut: event.soldOut,
  priceFrom: priceFrom(event),
});

const toDetails = (event) => ({
  ...toSummary(event),
  date: event.date,
  doors: event.doors,
  address: event.address,
  artists: [...event.artists],
  description: event.description,
  tags: [...event.tags],
  tickets: event.tickets.map(toTicket),
  addons: event.addons.map(toAddon),
  route: `/comprar/${event.id}`,
});

const isAuthenticated = () => {
  try {
    return !!globalThis.localStorage?.getItem(SESSION_KEY);
  } catch {
    return false;
  }
};

const sessionUserId = () => {
  try {
    const raw = globalThis.localStorage?.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw).id ?? null : null;
  } catch {
    return null;
  }
};

const currentRoute = () => {
  const hash = globalThis.location?.hash || '';
  return hash.startsWith('#') ? hash.slice(1) || '/' : '/';
};

export const TOOLS = [
  {
    name: 'listEvents',
    description:
      'Lista os eventos do catalogo da loja, com paginacao. Devolve os mesmos eventos exibidos na pagina "Todos os Eventos".',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        limit: { type: 'integer', minimum: 1, maximum: 50, description: 'Quantidade maxima de eventos a devolver (padrao 20).' },
        offset: { type: 'integer', minimum: 0, description: 'Quantidade de eventos a pular (padrao 0).' },
      },
    },
    execute: ({ limit = 20, offset = 0 }) => {
      const page = events.slice(offset, offset + limit).map(toSummary);
      return ok(
        { events: page, total: events.length, limit, offset },
        `${page.length} de ${events.length} evento(s) listado(s).`
      );
    },
  },

  {
    name: 'searchEvents',
    description:
      'Pesquisa e filtra eventos por texto (titulo, cidade ou artista), categoria e disponibilidade. Espelha os filtros da pagina de eventos.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        query: { type: 'string', maxLength: 100, description: 'Texto buscado em titulo, cidade e nomes de artistas.' },
        category: { type: 'string', enum: ['Todas', ...CATEGORIES], description: 'Categoria musical do evento.' },
        includeSoldOut: { type: 'boolean', description: 'Incluir eventos esgotados no resultado (padrao true).' },
      },
    },
    execute: ({ query = '', category = 'Todas', includeSoldOut = true }) => {
      const term = query.trim().toLowerCase();
      const matches = events.filter((e) => {
        const matchCat = category === 'Todas' || e.category === category;
        const matchSearch =
          !term ||
          e.title.toLowerCase().includes(term) ||
          e.city.toLowerCase().includes(term) ||
          e.artists.some((a) => a.toLowerCase().includes(term));
        const matchSoldOut = includeSoldOut || !e.soldOut;
        return matchCat && matchSearch && matchSoldOut;
      });
      return ok(
        {
          events: matches.map(toSummary),
          total: matches.length,
          appliedFilters: { query, category, includeSoldOut },
        },
        `${matches.length} evento(s) encontrado(s).`
      );
    },
  },

  {
    name: 'getEventDetails',
    description:
      'Detalhes de um evento: local, endereco, horarios, artistas, descricao, tipos de ingresso com precos e adicionais disponiveis.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['eventId'],
      properties: {
        eventId: { type: 'string', minLength: 1, description: 'Identificador do evento, obtido por listEvents ou searchEvents.' },
      },
    },
    execute: ({ eventId }) => {
      const event = getEventById(eventId);
      if (!event) return toolError(ERROR_CODES.NOT_FOUND, `evento '${eventId}' nao encontrado`);
      return ok({ event: toDetails(event) }, `Detalhes de "${event.title}".`);
    },
  },

  {
    name: 'getStoreState',
    description:
      'Estado observavel da loja no navegador: rota atual, se ha uma sessao ativa, quantidade de pedidos da sessao e categorias disponiveis. Nao devolve dados pessoais, credenciais nem dados de pagamento.',
    annotations: { readOnlyHint: true },
    inputSchema: { type: 'object', additionalProperties: false, properties: {} },
    execute: () => {
      const authenticated = isAuthenticated();
      const userId = sessionUserId();
      const orderCount = authenticated ? storage.getOrders(userId).length : 0;
      const route = currentRoute();
      return ok(
        {
          authenticated,
          currentRoute: route,
          orderCount,
          eventCount: events.length,
          soldOutEventCount: events.filter((e) => e.soldOut).length,
          categories: CATEGORIES,
          routes: APP_ROUTES,
        },
        `Rota ${route}; sessao ${authenticated ? 'ativa' : 'inativa'}; ${orderCount} pedido(s).`
      );
    },
  },

  {
    name: 'navigateTo',
    description:
      'Navega para uma pagina da loja — a mesma acao de clicar no menu. Para a rota /comprar e obrigatorio informar eventId.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['route'],
      properties: {
        route: { type: 'string', enum: APP_ROUTES, description: 'Rota de destino dentro da aplicacao.' },
        eventId: { type: 'string', minLength: 1, description: 'Evento a comprar; obrigatorio somente quando route = /comprar.' },
      },
    },
    execute: ({ route, eventId }) => {
      let target = route;
      if (route === '/comprar') {
        if (!eventId) return toolError(ERROR_CODES.INVALID_ARGUMENTS, 'route /comprar exige eventId');
        if (!getEventById(eventId)) return toolError(ERROR_CODES.NOT_FOUND, `evento '${eventId}' nao encontrado`);
        target = `/comprar/${eventId}`;
      } else if (eventId) {
        return toolError(ERROR_CODES.INVALID_ARGUMENTS, `eventId so e aceito com route /comprar, nao com ${route}`);
      }
      if (!globalThis.location) {
        return toolError(ERROR_CODES.UNAVAILABLE, 'navegacao indisponivel neste contexto');
      }
      globalThis.location.hash = `#${target}`;
      return ok({ route: target }, `Navegado para ${target}.`);
    },
  },

  {
    name: 'getPurchaseQuote',
    description:
      'Calcula o valor de uma selecao de ingressos e adicionais de um evento, com a mesma regra usada pela pagina de compra (inclui taxa de servico). Nao cria pedido nem cobra nada.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['eventId', 'tickets'],
      properties: {
        eventId: { type: 'string', minLength: 1, description: 'Identificador do evento.' },
        tickets: {
          type: 'array',
          minItems: 1,
          maxItems: 20,
          description: 'Ingressos selecionados.',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['ticketId', 'quantity'],
            properties: {
              ticketId: { type: 'string', minLength: 1, description: 'Id do tipo de ingresso (ver getEventDetails).' },
              type: { type: 'string', enum: ['inteira', 'meia'], description: 'Inteira ou meia-entrada (padrao inteira).' },
              quantity: { type: 'integer', minimum: 1, maximum: 10, description: 'Quantidade desse ingresso.' },
            },
          },
        },
        addons: {
          type: 'array',
          maxItems: 10,
          description: 'Ids dos adicionais selecionados.',
          items: { type: 'string', minLength: 1, description: 'Id de um adicional do evento.' },
        },
      },
    },
    execute: ({ eventId, tickets, addons = [] }) => {
      const event = getEventById(eventId);
      if (!event) return toolError(ERROR_CODES.NOT_FOUND, `evento '${eventId}' nao encontrado`);

      const selection = {};
      for (const line of tickets) {
        const type = line.type || 'inteira';
        if (!event.tickets.some((t) => t.id === line.ticketId)) {
          return toolError(ERROR_CODES.NOT_FOUND, `ingresso '${line.ticketId}' nao existe em '${eventId}'`);
        }
        const key = `${line.ticketId}_${type}`;
        selection[key] = (selection[key] || 0) + line.quantity;
      }
      for (const addonId of addons) {
        if (!event.addons.some((a) => a.id === addonId)) {
          return toolError(ERROR_CODES.NOT_FOUND, `adicional '${addonId}' nao existe em '${eventId}'`);
        }
      }

      const quote = buildPurchaseQuote(event, selection, addons);
      return ok(
        {
          eventId,
          lines: quote.ticketLines,
          addonLines: quote.addonLines,
          ticketsTotal: quote.ticketsTotal,
          addonsTotal: quote.addonsTotal,
          serviceFee: quote.serviceFee,
          total: quote.total,
          currency: 'BRL',
        },
        `Total ${BRL(quote.total)} (ingressos ${BRL(quote.ticketsTotal)}, adicionais ${BRL(quote.addonsTotal)}, taxa ${BRL(quote.serviceFee)}).`
      );
    },
  },
];

export const TOOL_NAMES = TOOLS.map((t) => t.name);
