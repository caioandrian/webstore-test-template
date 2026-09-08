import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { registerWebMcpTools } from '../register.js';
import { TOOL_NAMES } from '../tools.js';
import { HOST_KIND, resolveModelContextHost } from '../host.js';
import { createNativeHost, cleanScope } from './helpers.js';

describe('registro e disponibilidade das ferramentas', () => {
  beforeEach(cleanScope);
  afterEach(cleanScope);

  it('instala o shim quando o browser nao implementa a API', async () => {
    const registration = await registerWebMcpTools();
    expect(registration.api).toBe(HOST_KIND.SHIM);
    expect(registration.native).toBe(false);
    expect(navigator.modelContext).toBeDefined();
    expect(document.modelContext).toBe(navigator.modelContext);
  });

  it('registra exatamente as ferramentas declaradas', async () => {
    await registerWebMcpTools();
    const tools = await navigator.modelContext.getTools();
    expect(tools.map((t) => t.name).sort()).toEqual([...TOOL_NAMES].sort());
  });

  it('usa a API nativa quando ela existe, sem instalar shim sobre ela', async () => {
    const native = createNativeHost();
    navigator.modelContext = native;

    const registration = await registerWebMcpTools();
    expect(registration.api).toBe(HOST_KIND.NAVIGATOR);
    expect(registration.native).toBe(true);
    expect(native.registered.map((t) => t.name).sort()).toEqual([...TOOL_NAMES].sort());
  });

  it('prefere navigator.modelContext a document.modelContext', () => {
    navigator.modelContext = createNativeHost();
    document.modelContext = createNativeHost();
    expect(resolveModelContextHost().kind).toBe(HOST_KIND.NAVIGATOR);
  });

  it('usa document.modelContext quando so ele existe', () => {
    document.modelContext = createNativeHost();
    expect(resolveModelContextHost().kind).toBe(HOST_KIND.DOCUMENT);
  });

  it('liga getTools/executeTool quando a API nativa nao os oferece', async () => {
    navigator.modelContext = createNativeHost();
    const registration = await registerWebMcpTools();

    expect(registration.bridged).toBe(true);
    const tools = await navigator.modelContext.getTools();
    expect(tools.map((t) => t.name).sort()).toEqual([...TOOL_NAMES].sort());
    const result = await navigator.modelContext.executeTool('listEvents', {});
    expect(result.isError).toBe(false);
  });

  it('e idempotente: registrar duas vezes nao duplica ferramentas', async () => {
    const first = await registerWebMcpTools();
    const second = await registerWebMcpTools();
    expect(second).toBe(first);
    const tools = await navigator.modelContext.getTools();
    expect(tools).toHaveLength(TOOL_NAMES.length);
  });

  it('desregistra pelo AbortSignal', async () => {
    const registration = await registerWebMcpTools();
    const host = navigator.modelContext;
    registration.unregister();
    expect(await host.getTools()).toHaveLength(0);
  });

  it('expoe apenas metadado de diagnostico em __webmcp', async () => {
    await registerWebMcpTools();
    expect(Object.keys(globalThis.__webmcp).sort()).toEqual(['api', 'bridged', 'native', 'tools']);
    expect(globalThis.__webmcp.tools).toEqual(TOOL_NAMES);
  });
});
