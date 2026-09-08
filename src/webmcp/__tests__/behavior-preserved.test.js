import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { registerWebMcpTools } from '../register.js';
import { buildPurchaseQuote } from '../../utils/pricing.js';
import { getEventById } from '../../data/mockEvents.js';
import { cleanScope } from './helpers.js';

let host;

beforeEach(async () => {
  cleanScope();
  localStorage.clear();
  await registerWebMcpTools();
  host = navigator.modelContext;
});
afterEach(() => {
  localStorage.clear();
  cleanScope();
});

describe('comportamento funcional preservado', () => {
  it('getPurchaseQuote usa exatamente o calculo da pagina de compra', async () => {
    const event = getEventById('sertanejo-fest-2025');
    const ticketId = event.tickets[0].id;
    const addonId = event.addons[0]?.id;

    const selection = { [`${ticketId}_inteira`]: 3, [`${ticketId}_meia`]: 1 };
    const addons = addonId ? [addonId] : [];
    const fromPage = buildPurchaseQuote(event, selection, addons);

    const r = await host.executeTool('getPurchaseQuote', {
      eventId: event.id,
      tickets: [
        { ticketId, type: 'inteira', quantity: 3 },
        { ticketId, type: 'meia', quantity: 1 },
      ],
      addons,
    });

    expect(r.structuredContent.total).toBe(fromPage.total);
    expect(r.structuredContent.ticketsTotal).toBe(fromPage.ticketsTotal);
    expect(r.structuredContent.serviceFee).toBe(fromPage.serviceFee);
    expect(r.structuredContent.addonsTotal).toBe(fromPage.addonsTotal);
  });

  it('as ferramentas de leitura nao escrevem no localStorage', async () => {
    const before = JSON.stringify({ ...localStorage });
    await host.executeTool('listEvents', {});
    await host.executeTool('searchEvents', { query: 'rock' });
    await host.executeTool('getEventDetails', { eventId: 'rock-festival-2025' });
    await host.executeTool('getStoreState', {});
    await host.executeTool('getPurchaseQuote', { eventId: 'rock-festival-2025', tickets: [{ ticketId: 'pista', quantity: 1 }] });
    expect(JSON.stringify({ ...localStorage })).toBe(before);
  });

  it('nenhuma ferramenta cria pedido ou sessao', async () => {
    await host.executeTool('getPurchaseQuote', { eventId: 'rock-festival-2025', tickets: [{ ticketId: 'pista', quantity: 4 }] });
    expect(localStorage.getItem('showtickets_orders')).toBeNull();
    expect(localStorage.getItem('showtickets_session')).toBeNull();
  });

  it('o catalogo nao e mutado pelas respostas', async () => {
    const r = await host.executeTool('getEventDetails', { eventId: 'rock-festival-2025' });
    r.structuredContent.event.artists.push('Banda Inventada');
    r.structuredContent.event.tickets[0].price = 1;
    const again = await host.executeTool('getEventDetails', { eventId: 'rock-festival-2025' });
    expect(again.structuredContent.event.artists).not.toContain('Banda Inventada');
    expect(again.structuredContent.event.tickets[0].price).toBe(280);
  });

  it('o registro nao sobrescreve globais da aplicacao', () => {
    expect(globalThis.localStorage.getItem).toBeInstanceOf(Function);
    expect(globalThis.fetch === undefined || typeof globalThis.fetch === 'function').toBe(true);
    expect(Object.keys(globalThis).filter((k) => k.startsWith('__webmcp'))).toEqual(['__webmcp']);
  });

  it('o defeito BUG-001 continua presente: a regra de filtro funciona, a UI e que nao', async () => {
    // A ferramenta filtra corretamente. A pagina, nao — e esse contraste e a evidencia.
    const off = await host.executeTool('searchEvents', { includeSoldOut: false });
    expect(off.structuredContent.events.every((e) => !e.soldOut)).toBe(true);
  });

  it('o defeito BUG-004 continua presente: cotacao acima do estoque nao e barrada', async () => {
    const event = getEventById('rock-festival-2025');
    const camarote = event.tickets.find((t) => t.id === 'camarote');
    const r = await host.executeTool('getPurchaseQuote', {
      eventId: event.id,
      tickets: [{ ticketId: camarote.id, quantity: 10 }],
    });
    expect(r.isError).toBe(false);
    expect(r.structuredContent.total).toBeGreaterThan(0);
  });
});
