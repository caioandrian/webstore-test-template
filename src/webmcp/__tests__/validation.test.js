import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { registerWebMcpTools } from '../register.js';
import { ERROR_CODES } from '../result.js';
import { cleanScope } from './helpers.js';

let host;

beforeEach(async () => {
  cleanScope();
  await registerWebMcpTools();
  host = navigator.modelContext;
});
afterEach(cleanScope);

const call = (name, args) => host.executeTool(name, args);

describe('validacao de argumentos e erros previsiveis', () => {
  it('ferramenta desconhecida', async () => {
    const r = await call('queryDatabase', {});
    expect(r.isError).toBe(true);
    expect(r.structuredContent.error.code).toBe(ERROR_CODES.UNKNOWN_TOOL);
  });

  it('campo obrigatorio ausente', async () => {
    const r = await call('getEventDetails', {});
    expect(r.isError).toBe(true);
    expect(r.structuredContent.error.code).toBe(ERROR_CODES.INVALID_ARGUMENTS);
    expect(r.structuredContent.error.message).toMatch(/eventId/);
  });

  it('tipo errado', async () => {
    const r = await call('getEventDetails', { eventId: 42 });
    expect(r.structuredContent.error.code).toBe(ERROR_CODES.INVALID_ARGUMENTS);
    expect(r.structuredContent.error.message).toMatch(/esperado string/);
  });

  it('propriedade nao reconhecida', async () => {
    const r = await call('listEvents', { limite: 3 });
    expect(r.structuredContent.error.message).toMatch(/nao reconhecida/);
  });

  it('valor abaixo do minimo', async () => {
    const r = await call('listEvents', { limit: -1 });
    expect(r.structuredContent.error.message).toMatch(/minimo/);
  });

  it('valor acima do maximo', async () => {
    const r = await call('listEvents', { limit: 5000 });
    expect(r.structuredContent.error.message).toMatch(/maximo/);
  });

  it('number nao inteiro onde se espera integer', async () => {
    const r = await call('listEvents', { limit: 2.5 });
    expect(r.structuredContent.error.message).toMatch(/integer/);
  });

  it('enum invalido', async () => {
    const r = await call('searchEvents', { category: 'Jazz' });
    expect(r.structuredContent.error.message).toMatch(/nao permitido/);
  });

  it('rota invalida em navigateTo', async () => {
    const r = await call('navigateTo', { route: '/admin' });
    expect(r.structuredContent.error.code).toBe(ERROR_CODES.INVALID_ARGUMENTS);
  });

  it('argumentos que nao sao objeto', async () => {
    const r = await call('listEvents', 'tudo');
    expect(r.structuredContent.error.message).toMatch(/objeto/);
  });

  it('argumentos ausentes valem como objeto vazio', async () => {
    const r = await call('listEvents');
    expect(r.isError).toBe(false);
  });

  it('id inexistente devolve NOT_FOUND, nao excecao', async () => {
    const r = await call('getEventDetails', { eventId: 'nao-existe' });
    expect(r.structuredContent.error.code).toBe(ERROR_CODES.NOT_FOUND);
  });

  it('validacao dentro de arrays aninhados', async () => {
    const r = await call('getPurchaseQuote', {
      eventId: 'rock-festival-2025',
      tickets: [{ ticketId: 'pista', quantity: 0 }],
    });
    expect(r.structuredContent.error.message).toMatch(/tickets\[0\]\.quantity/);
  });

  it('array vazio onde minItems exige um item', async () => {
    const r = await call('getPurchaseQuote', { eventId: 'rock-festival-2025', tickets: [] });
    expect(r.structuredContent.error.message).toMatch(/minimo de 1/);
  });

  it('ingresso inexistente no evento', async () => {
    const r = await call('getPurchaseQuote', {
      eventId: 'rock-festival-2025',
      tickets: [{ ticketId: 'sofa', quantity: 1 }],
    });
    expect(r.structuredContent.error.code).toBe(ERROR_CODES.NOT_FOUND);
  });

  it('adicional inexistente no evento', async () => {
    const r = await call('getPurchaseQuote', {
      eventId: 'rock-festival-2025',
      tickets: [{ ticketId: 'pista', quantity: 1 }],
      addons: ['helicoptero'],
    });
    expect(r.structuredContent.error.code).toBe(ERROR_CODES.NOT_FOUND);
  });

  it('/comprar sem eventId', async () => {
    const r = await call('navigateTo', { route: '/comprar' });
    expect(r.structuredContent.error.code).toBe(ERROR_CODES.INVALID_ARGUMENTS);
  });

  it('eventId em rota que nao aceita', async () => {
    const r = await call('navigateTo', { route: '/eventos', eventId: 'rock-festival-2025' });
    expect(r.structuredContent.error.code).toBe(ERROR_CODES.INVALID_ARGUMENTS);
  });

  it('falha interna da ferramenta vira erro controlado, sem vazar a mensagem', async () => {
    const { ModelContextSurface } = await import('../shim.js');
    const surface = new ModelContextSurface();
    await surface.registerTool({
      name: 'boom',
      description: 'ferramenta que falha em tempo de execucao para teste',
      inputSchema: { type: 'object', additionalProperties: false, properties: {} },
      execute: () => { throw new Error('C:/segredo/interno.js linha 42'); },
    });
    const r = await surface.executeTool('boom', {});
    expect(r.isError).toBe(true);
    expect(r.structuredContent.error.code).toBe(ERROR_CODES.EXECUTION_FAILED);
    expect(JSON.stringify(r)).not.toMatch(/segredo/);
  });
});
