import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { registerWebMcpTools } from '../register.js';
import { HOST_KIND } from '../host.js';
import { createNativeHost, cleanScope, callEveryTool } from './helpers.js';

const collect = async (host) => {
  const tools = await host.getTools();
  const results = await callEveryTool(host);
  return { tools, results };
};

const runWith = async (setup) => {
  cleanScope();
  localStorage.clear();
  globalThis.location.hash = '';
  setup();
  const registration = await registerWebMcpTools();
  const snapshot = await collect(navigator.modelContext);
  return { registration, snapshot };
};

beforeEach(() => { cleanScope(); localStorage.clear(); });
afterEach(() => { cleanScope(); localStorage.clear(); });

describe('paridade entre API nativa e shim', () => {
  it('shim e API nativa expoem os mesmos descritores', async () => {
    const shim = await runWith(() => {});
    const native = await runWith(() => { navigator.modelContext = createNativeHost(); });

    expect(shim.registration.api).toBe(HOST_KIND.SHIM);
    expect(native.registration.api).toBe(HOST_KIND.NAVIGATOR);
    expect(JSON.stringify(native.snapshot.tools)).toBe(JSON.stringify(shim.snapshot.tools));
  });

  it('shim e API nativa produzem o mesmo resultado para as mesmas chamadas', async () => {
    const shim = await runWith(() => {});
    const native = await runWith(() => { navigator.modelContext = createNativeHost(); });
    expect(JSON.stringify(native.snapshot.results)).toBe(JSON.stringify(shim.snapshot.results));
  });

  it('shim e API nativa produzem o mesmo erro para a mesma chamada invalida', async () => {
    await runWith(() => {});
    const fromShim = await navigator.modelContext.executeTool('listEvents', { limit: -1 });

    await runWith(() => { navigator.modelContext = createNativeHost(); });
    const fromNative = await navigator.modelContext.executeTool('listEvents', { limit: -1 });

    expect(JSON.stringify(fromNative)).toBe(JSON.stringify(fromShim));
  });

  it('a validacao vive na ferramenta, portanto vale tambem no caminho nativo direto', async () => {
    const native = createNativeHost();
    navigator.modelContext = native;
    await registerWebMcpTools();

    const tool = native.registered.find((t) => t.name === 'getEventDetails');
    const direct = await tool.execute({ eventId: 42 });
    expect(direct.isError).toBe(true);
    expect(direct.structuredContent.error.code).toBe('INVALID_ARGUMENTS');
  });

  it('o shim nao e confundido com uma API nativa em um novo registro', async () => {
    await registerWebMcpTools();
    expect(globalThis.__webmcp.api).toBe(HOST_KIND.SHIM);

    const { resetWebMcpRegistration } = await import('../register.js');
    resetWebMcpRegistration();
    await registerWebMcpTools();
    expect(globalThis.__webmcp.api).toBe(HOST_KIND.SHIM);
    expect(globalThis.__webmcp.native).toBe(false);
  });
});
