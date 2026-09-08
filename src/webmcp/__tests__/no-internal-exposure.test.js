import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { registerWebMcpTools } from '../register.js';
import { TOOLS } from '../tools.js';
import { cleanScope, callEveryTool } from './helpers.js';

const WEBMCP_DIR = resolve(process.cwd(), 'src', 'webmcp');

const SESSION_KEY = 'showtickets_session';
const USERS_KEY = 'showtickets_users';

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

const seedUser = () => {
  const user = {
    id: 'USR-1', name: 'Fulano', email: 'fulano@teste.com', cpf: '123.456.789-01',
    phone: '(11) 99999-0000', birthdate: '1990-01-01', password: 'SenhaSuperSecreta1',
  };
  localStorage.setItem(USERS_KEY, JSON.stringify([user]));
  const { password: _p, ...safe } = user;
  localStorage.setItem(SESSION_KEY, JSON.stringify(safe));
  return user;
};

describe('ausencia de exposicao de dados internos', () => {
  it('nenhuma resposta contem credenciais ou dados pessoais da sessao', async () => {
    seedUser();
    const results = await callEveryTool(host);
    const dump = JSON.stringify(results);
    for (const needle of ['SenhaSuperSecreta1', 'password', 'fulano@teste.com', '123.456.789-01', '(11) 99999-0000', '1990-01-01']) {
      expect(dump, `vazou: ${needle}`).not.toContain(needle);
    }
  });

  it('nenhuma resposta expoe o conteudo bruto do localStorage', async () => {
    seedUser();
    localStorage.setItem('showtickets_orders', JSON.stringify([{ id: 'ST-1', userId: 'USR-1', userData: { cpf: '123.456.789-01' }, total: 10 }]));
    const dump = JSON.stringify(await callEveryTool(host));
    expect(dump).not.toContain(USERS_KEY);
    expect(dump).not.toContain('showtickets_orders');
    expect(dump).not.toContain('userData');
  });

  it('getStoreState devolve so contagem, nunca o pedido em si', async () => {
    seedUser();
    localStorage.setItem('showtickets_orders', JSON.stringify([{ id: 'ST-42', userId: 'USR-1', total: 999 }]));
    const r = await host.executeTool('getStoreState', {});
    expect(r.structuredContent.orderCount).toBe(1);
    expect(JSON.stringify(r)).not.toContain('ST-42');
  });

  it('nenhuma resposta contem caminho de arquivo, import ou codigo-fonte', async () => {
    const dump = JSON.stringify(await callEveryTool(host));
    for (const pattern of [/\bimport\s/, /\.jsx?['"]/, /[A-Za-z]:\\\\/, /\/src\//, /function\s*\(/, /=>/]) {
      expect(dump, `padrao suspeito: ${pattern}`).not.toMatch(pattern);
    }
  });

  it('descritores de ferramenta nao carregam a implementacao', async () => {
    const tools = await host.getTools();
    for (const tool of tools) {
      expect(Object.keys(tool).sort()).toEqual(expect.arrayContaining(['description', 'inputSchema', 'name']));
      expect(tool.execute).toBeUndefined();
    }
  });

  it('nenhuma ferramenta le arquivo, processo ou storage bruto', () => {
    const source = readFileSync(join(WEBMCP_DIR, 'tools.js'), 'utf8');
    for (const forbidden of ['node:fs', 'require(', 'process.env', 'eval(', 'Function(', 'fetch(', 'localStorage.setItem', 'localStorage.removeItem']) {
      expect(source, `tools.js usa ${forbidden}`).not.toContain(forbidden);
    }
  });

  it('o modulo webmcp nao importa nada fora de src/data, src/utils e src/webmcp', () => {
    const files = readdirSync(WEBMCP_DIR).filter((f) => f.endsWith('.js') || f.endsWith('.jsx'));
    for (const file of files) {
      const source = readFileSync(join(WEBMCP_DIR, file), 'utf8');
      for (const match of source.matchAll(/from\s+'([^']+)'/g)) {
        const spec = match[1];
        if (!spec.startsWith('.')) continue;
        expect(spec, `${file} importa ${spec}`).toMatch(/^\.\/|^\.\.\/(data|utils)\//);
      }
    }
  });

  it('as ferramentas de leitura estao anotadas como readOnly', () => {
    const readOnly = TOOLS.filter((t) => t.name !== 'navigateTo');
    for (const tool of readOnly) expect(tool.annotations?.readOnlyHint, tool.name).toBe(true);
  });
});
