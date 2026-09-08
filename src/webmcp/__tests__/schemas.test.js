import { describe, it, expect } from 'vitest';
import { TOOLS } from '../tools.js';
import { wrapTool } from '../shim.js';

const walk = (schema, visit, path = '') => {
  visit(schema, path);
  if (schema.properties) {
    for (const [key, sub] of Object.entries(schema.properties)) walk(sub, visit, `${path}.${key}`);
  }
  if (schema.items) walk(schema.items, visit, `${path}[]`);
};

describe('schemas das ferramentas', () => {
  it.each(TOOLS.map((t) => [t.name, t]))('%s tem nome, descricao e inputSchema explicitos', (name, tool) => {
    expect(tool.name).toMatch(/^[a-zA-Z][a-zA-Z0-9]*$/);
    expect(tool.description.length).toBeGreaterThan(20);
    expect(tool.inputSchema.type).toBe('object');
    expect(tool.inputSchema.additionalProperties).toBe(false);
    expect(typeof tool.execute).toBe('function');
  });

  it.each(TOOLS.map((t) => [t.name, t]))('%s descreve cada propriedade e tipo', (name, tool) => {
    walk(tool.inputSchema, (schema, path) => {
      expect(schema.type, `${name}${path}: type ausente`).toBeDefined();
      if (path !== '') {
        expect(schema.description ?? (schema.type === 'object' ? 'ok' : undefined), `${name}${path}: description ausente`)
          .toBeDefined();
      }
    });
  });

  it.each(TOOLS.map((t) => [t.name, t]))('%s declara required apenas sobre propriedades existentes', (name, tool) => {
    walk(tool.inputSchema, (schema, path) => {
      for (const key of schema.required || []) {
        expect(Object.keys(schema.properties || {}), `${name}${path}`).toContain(key);
      }
    });
  });

  it('nao expoe ferramenta generica de execucao', () => {
    const forbidden = /^(execute|run|eval|query|get)(Anything|Code|Sql|Database|Source|File|Storage)$/i;
    for (const tool of TOOLS) expect(tool.name).not.toMatch(forbidden);
  });

  it('nomes sao unicos', () => {
    const names = TOOLS.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('recusa definicao invalida com InvalidStateError', () => {
    const base = TOOLS[0];
    expect(() => wrapTool({ ...base, name: '' })).toThrowError(/name/);
    expect(() => wrapTool({ ...base, description: '' })).toThrowError(/description/);
    expect(() => wrapTool({ ...base, inputSchema: { type: 'string' } })).toThrowError(/inputSchema/);
    expect(() => wrapTool({ ...base, execute: undefined })).toThrowError(/execute/);
    try {
      wrapTool({ ...base, name: '' });
    } catch (error) {
      expect(error.name).toBe('InvalidStateError');
    }
  });
});
