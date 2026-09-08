// Resolucao do host WebMCP.
//
// Ordem de preferencia:
//   1. `navigator.modelContext` (Chrome 146+, Edge 147+)
//   2. `document.modelContext` (forma usada pelo explainer do W3C)
//   3. shim local, instalado em ambos os pontos
//
// O shim existe porque o Chromium empacotado pelo Playwright — o mesmo browser
// usado pelo agente no benchmark — nao implementa a API. Sem ele a capacidade
// WebMCP seria inalcancavel e o experimento ficaria inviavel. Ver
// docs/WEBMCP-VARIANT.md.

import { ModelContextSurface, toolDescriptor } from './shim.js';

export const HOST_KIND = {
  NAVIGATOR: 'navigator',
  DOCUMENT: 'document',
  SHIM: 'shim',
};

const isNativeHost = (candidate) =>
  !!candidate && typeof candidate.registerTool === 'function' && !candidate.__webmcpShim;

/**
 * @returns {{host: object, kind: string, bridged: boolean, parity: ModelContextSurface}}
 */
export function resolveModelContextHost(globalScope = globalThis) {
  const nav = globalScope.navigator;
  const doc = globalScope.document;
  const parity = new ModelContextSurface();

  let host = null;
  let kind = HOST_KIND.SHIM;

  if (isNativeHost(nav && nav.modelContext)) {
    host = nav.modelContext;
    kind = HOST_KIND.NAVIGATOR;
  } else if (isNativeHost(doc && doc.modelContext)) {
    host = doc.modelContext;
    kind = HOST_KIND.DOCUMENT;
  } else {
    host = parity;
    if (nav) nav.modelContext = parity;
    if (doc) doc.modelContext = parity;
  }

  // Paridade: `getTools` / `executeTool` precisam existir para que um cliente
  // consiga descobrir e chamar as ferramentas. Quando a API nativa nao os
  // oferece, sao ligados ao registro local — que executa exatamente as mesmas
  // ferramentas, com a mesma validacao e o mesmo formato de retorno.
  let bridged = false;
  if (host !== parity) {
    if (typeof host.getTools !== 'function') {
      host.getTools = () => parity.getTools();
      bridged = true;
    }
    if (typeof host.executeTool !== 'function') {
      host.executeTool = (tool, args) => parity.executeTool(tool, args);
      bridged = true;
    }
  }

  return { host, kind, bridged, parity };
}

export function describeHost({ kind, bridged }) {
  return { api: kind, native: kind !== HOST_KIND.SHIM, bridged };
}

export { toolDescriptor };
