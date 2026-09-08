import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { registerWebMcpTools } from '../register.js';
import { events } from '../../data/mockEvents.js';
import { cleanScope, callEveryTool } from './helpers.js';

let host;

beforeEach(async () => {
  cleanScope();
  await registerWebMcpTools();
  host = navigator.modelContext;
});
afterEach(cleanScope);

describe('respostas estruturadas', () => {
  it('toda ferramenta devolve content textual e structuredContent', async () => {
    for (const { name, result } of await callEveryTool(host)) {
      expect(result.isError, name).toBe(false);
      expect(Array.isArray(result.content), name).toBe(true);
      expect(result.content[0].type, name).toBe('text');
      expect(typeof result.content[0].text, name).toBe('string');
      expect(typeof result.structuredContent, name).toBe('object');
    }
  });

  it('erros seguem o mesmo formato, com code e message', async () => {
    const r = await host.executeTool('getEventDetails', { eventId: 'x' });
    expect(r.content[0].type).toBe('text');
    expect(r.structuredContent.error).toMatchObject({ code: expect.any(String), message: expect.any(String) });
  });

  it('listEvents pagina de forma estavel', async () => {
    const all = await host.executeTool('listEvents', {});
    expect(all.structuredContent.total).toBe(events.length);

    const page = await host.executeTool('listEvents', { limit: 2, offset: 1 });
    expect(page.structuredContent.events).toHaveLength(2);
    expect(page.structuredContent.events[0].id).toBe(all.structuredContent.events[1].id);
    expect(page.structuredContent).toMatchObject({ limit: 2, offset: 1, total: events.length });
  });

  it('searchEvents devolve os filtros aplicados', async () => {
    const r = await host.executeTool('searchEvents', { query: 'fortaleza', includeSoldOut: true });
    expect(r.structuredContent.appliedFilters).toEqual({ query: 'fortaleza', category: 'Todas', includeSoldOut: true });
    expect(r.structuredContent.total).toBe(1);
  });

  it('searchEvents com includeSoldOut=false remove o evento esgotado', async () => {
    const withSoldOut = await host.executeTool('searchEvents', { includeSoldOut: true });
    const without = await host.executeTool('searchEvents', { includeSoldOut: false });
    expect(without.structuredContent.total).toBe(withSoldOut.structuredContent.total - 1);
    expect(without.structuredContent.events.some((e) => e.soldOut)).toBe(false);
  });

  it('getEventDetails devolve apenas os campos projetados', async () => {
    const r = await host.executeTool('getEventDetails', { eventId: 'rock-festival-2025' });
    expect(Object.keys(r.structuredContent.event).sort()).toEqual([
      'addons', 'address', 'artists', 'category', 'city', 'date', 'dateFormatted',
      'description', 'doors', 'featured', 'id', 'priceFrom', 'route', 'soldOut',
      'subtitle', 'tags', 'tickets', 'time', 'title', 'venue',
    ]);
  });

  it('getStoreState reflete sessao inativa por padrao', async () => {
    const r = await host.executeTool('getStoreState', {});
    expect(r.structuredContent).toMatchObject({ authenticated: false, orderCount: 0, eventCount: events.length });
  });

  it('navigateTo altera a rota da aplicacao', async () => {
    const r = await host.executeTool('navigateTo', { route: '/meus-ingressos' });
    expect(r.structuredContent.route).toBe('/meus-ingressos');
    expect(globalThis.location.hash).toBe('#/meus-ingressos');
  });

  it('navigateTo monta a rota de compra com o evento', async () => {
    const r = await host.executeTool('navigateTo', { route: '/comprar', eventId: 'pagode-carioca-2025' });
    expect(r.structuredContent.route).toBe('/comprar/pagode-carioca-2025');
  });

  it('getPurchaseQuote detalha as linhas e os totais', async () => {
    const r = await host.executeTool('getPurchaseQuote', {
      eventId: 'rock-festival-2025',
      tickets: [{ ticketId: 'pista', quantity: 2 }, { ticketId: 'cadeira', type: 'meia', quantity: 1 }],
      addons: ['kit-vip'],
    });
    const s = r.structuredContent;
    // 2x280 + 1x290 = 850; taxa 85; adicional 180
    expect(s.ticketsTotal).toBe(850);
    expect(s.serviceFee).toBe(85);
    expect(s.addonsTotal).toBe(180);
    expect(s.total).toBe(1115);
    expect(s.lines).toHaveLength(2);
    expect(s.currency).toBe('BRL');
  });
});
