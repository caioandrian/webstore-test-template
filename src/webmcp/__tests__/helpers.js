import { resetWebMcpRegistration } from '../register.js';

/** Host "nativo" minimo: so registerTool, como a API embarcada nos browsers. */
export function createNativeHost() {
  const registered = [];
  return {
    registered,
    registerTool(tool, options) {
      registered.push(tool);
      const signal = options && options.signal;
      if (signal) {
        signal.addEventListener('abort', () => {
          const i = registered.indexOf(tool);
          if (i >= 0) registered.splice(i, 1);
        }, { once: true });
      }
      return Promise.resolve();
    },
  };
}

export function cleanScope() {
  resetWebMcpRegistration();
  delete globalThis.navigator.modelContext;
  delete globalThis.document.modelContext;
  delete globalThis.__webmcp;
}

/** Colhe o resultado de todas as ferramentas com argumentos validos. */
export async function callEveryTool(host) {
  const cases = [
    ['listEvents', {}],
    ['searchEvents', { query: 'rock' }],
    ['getEventDetails', { eventId: 'rock-festival-2025' }],
    ['getStoreState', {}],
    ['getPurchaseQuote', { eventId: 'rock-festival-2025', tickets: [{ ticketId: 'pista', quantity: 2 }], addons: ['kit-vip'] }],
    ['navigateTo', { route: '/eventos' }],
  ];
  const results = [];
  for (const [name, args] of cases) {
    results.push({ name, result: await host.executeTool(name, args) });
  }
  return results;
}
