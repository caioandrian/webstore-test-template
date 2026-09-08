// Registro das ferramentas WebMCP na superficie resolvida pelo host.
//
// Idempotente: uma segunda chamada devolve o mesmo registro. O desregistro
// acontece por AbortSignal, como no padrao.

import { resolveModelContextHost, describeHost } from './host.js';
import { wrapTool } from './shim.js';
import { TOOLS } from './tools.js';

let current = null;

export async function registerWebMcpTools(globalScope = globalThis) {
  if (current) return current;

  const resolved = resolveModelContextHost(globalScope);
  const controller = new AbortController();
  const registered = [];

  for (const tool of TOOLS) {
    try {
      // A ferramenta e registrada ja envolvida: validacao de argumentos e
      // formato de erro valem tambem quando a API nativa executa `execute`
      // diretamente, sem passar por executeTool.
      const wrapped = wrapTool(tool);
      await resolved.host.registerTool(wrapped, { signal: controller.signal });
      // A camada de paridade replica o registro para que getTools/executeTool
      // exponham exatamente as mesmas ferramentas quando a API nativa nao os oferece.
      if (resolved.host !== resolved.parity) {
        await resolved.parity.registerTool(wrapped, { signal: controller.signal });
      }
      registered.push(tool.name);
    } catch (error) {
      // Uma ferramenta que nao registra nao pode derrubar a aplicacao.
      if (globalScope.console) {
        globalScope.console.warn(`[webmcp] falha ao registrar '${tool.name}': ${error.name}`);
      }
    }
  }

  current = {
    ...describeHost(resolved),
    tools: registered,
    unregister: () => {
      controller.abort();
      current = null;
    },
  };

  // Metadado de diagnostico: diz apenas qual caminho de API foi usado.
  // Nao expoe estado da aplicacao nem permite executar nada.
  globalScope.__webmcp = {
    api: current.api,
    native: current.native,
    bridged: current.bridged,
    tools: [...registered],
  };

  return current;
}

export function resetWebMcpRegistration() {
  if (current) current.unregister();
  current = null;
}
