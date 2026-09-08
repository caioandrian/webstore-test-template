// Superficie WebMCP: mesmo contrato publico da API padrao
// (registerTool / unregisterTool / getTools / executeTool).
//
// Usada de duas formas:
//  - como shim, quando o browser nao implementa `navigator.modelContext`
//    nem `document.modelContext` (caso do Chromium empacotado pelo Playwright);
//  - como camada de paridade, quando a API nativa existe mas nao expoe
//    `getTools` / `executeTool`.
//
// Nao acrescenta semantica: as mesmas ferramentas, a mesma validacao e o
// mesmo formato de retorno valem nos dois caminhos.

import { validateArguments } from './validate.js';
import { ERROR_CODES, toolError } from './result.js';

function invalidState(message) {
  const error = new Error(message);
  error.name = 'InvalidStateError';
  return error;
}

function assertDefinition(def) {
  if (!def || typeof def !== 'object') throw invalidState('definicao de ferramenta invalida');
  if (typeof def.name !== 'string' || def.name.trim() === '') {
    throw invalidState('`name` deve ser uma string nao vazia');
  }
  if (typeof def.description !== 'string' || def.description.trim() === '') {
    throw invalidState('`description` deve ser uma string nao vazia');
  }
  const schema = def.inputSchema;
  if (!schema || typeof schema !== 'object' || schema.type !== 'object') {
    throw invalidState('`inputSchema` deve ser um JSON Schema de tipo object');
  }
  if (typeof def.execute !== 'function') {
    throw invalidState('`execute` deve ser uma funcao');
  }
}

/** Envolve a ferramenta com validacao e normalizacao de erro. */
export function wrapTool(def) {
  assertDefinition(def);
  const { name, description, inputSchema, annotations } = def;

  const execute = async (args) => {
    const validation = validateArguments(inputSchema, args);
    if (!validation.ok) return toolError(validation.code, validation.message);
    try {
      const result = await def.execute(validation.value);
      if (!result || !Array.isArray(result.content)) {
        return toolError(ERROR_CODES.EXECUTION_FAILED, `ferramenta '${name}' devolveu resposta fora do contrato`);
      }
      return result;
    } catch {
      // A mensagem original nao e propagada: pode carregar detalhe interno.
      return toolError(ERROR_CODES.EXECUTION_FAILED, `falha ao executar '${name}'`);
    }
  };

  const tool = { name, description, inputSchema, execute };
  if (annotations) tool.annotations = annotations;
  return tool;
}

export function toolDescriptor(tool) {
  const descriptor = {
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
  };
  if (tool.annotations) descriptor.annotations = tool.annotations;
  return descriptor;
}

export class ModelContextSurface {
  // Marca que permite ao host distinguir esta superficie de uma API nativa.
  __webmcpShim = true;

  #tools = new Map();

  async registerTool(def, options = {}) {
    const tool = wrapTool(def);
    if (this.#tools.has(tool.name)) {
      throw invalidState(`ferramenta '${tool.name}' ja registrada`);
    }
    this.#tools.set(tool.name, tool);
    const signal = options && options.signal;
    if (signal) {
      if (signal.aborted) this.#tools.delete(tool.name);
      else signal.addEventListener('abort', () => this.#tools.delete(tool.name), { once: true });
    }
    return undefined;
  }

  unregisterTool(name) {
    return this.#tools.delete(name);
  }

  async getTools() {
    return [...this.#tools.values()].map(toolDescriptor);
  }

  async executeTool(tool, args) {
    const name = typeof tool === 'string' ? tool : tool && tool.name;
    const registered = this.#tools.get(name);
    if (!registered) {
      return toolError(ERROR_CODES.UNKNOWN_TOOL, `ferramenta '${name}' nao encontrada`);
    }
    return registered.execute(args);
  }
}
