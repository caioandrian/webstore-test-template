import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { registerWebMcpTools } from '../register.js';
import { cleanScope, callEveryTool } from './helpers.js';

const ROOT = resolve(process.cwd());
const GT_PATH = join(ROOT, 'docs', 'ground-truth', 'ground-truth.json');

const groundTruth = JSON.parse(readFileSync(GT_PATH, 'utf8'));

const walkFiles = (dir) => {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walkFiles(full));
    else out.push(full);
  }
  return out;
};

let host;

beforeEach(async () => {
  cleanScope();
  await registerWebMcpTools();
  host = navigator.modelContext;
});
afterEach(cleanScope);

describe('Ground Truth inacessivel pelas ferramentas', () => {
  it('o arquivo existe e tem entradas', () => {
    expect(groundTruth.entries.length).toBeGreaterThan(0);
    expect(groundTruth.baseCommit).toBe('12f82740fd8758b88c000749e2fed3023690ade4');
  });

  it('nenhum id do Ground Truth aparece em qualquer resposta', async () => {
    const dump = JSON.stringify(await callEveryTool(host));
    for (const entry of groundTruth.entries) {
      expect(dump, `vazou ${entry.id}`).not.toContain(entry.id);
    }
    expect(dump).not.toMatch(/BUG-\d/);
    expect(dump).not.toMatch(/ground.?truth/i);
  });

  it('nenhum titulo de defeito aparece em qualquer resposta', async () => {
    const dump = JSON.stringify(await callEveryTool(host)).toLowerCase();
    for (const entry of groundTruth.entries) {
      const marker = entry.title.toLowerCase().slice(0, 25);
      expect(dump, `vazou "${marker}"`).not.toContain(marker);
    }
  });

  it('nenhuma ferramenta declarada menciona defeitos', async () => {
    const dump = JSON.stringify(await host.getTools()).toLowerCase();
    for (const word of ['bug', 'defeito', 'ground truth', 'groundtruth', 'benchmark']) {
      expect(dump, `descritor menciona "${word}"`).not.toContain(word);
    }
  });

  it('nenhum modulo de src/ referencia o Ground Truth', () => {
    for (const file of walkFiles(join(ROOT, 'src'))) {
      if (file.includes('__tests__')) continue;
      const source = readFileSync(file, 'utf8');
      expect(source, `${file} referencia ground-truth`).not.toMatch(/ground-truth/i);
    }
  });

  it('o bundle publicado nao contem o Ground Truth', () => {
    const dist = join(ROOT, 'dist');
    if (!existsSync(dist)) {
      // Sem build no diretorio: a garantia estrutural (docs/ fora de src/ e de public/) ja vale.
      expect(existsSync(join(ROOT, 'public', 'ground-truth.json'))).toBe(false);
      return;
    }
    for (const file of walkFiles(dist)) {
      expect(file).not.toMatch(/ground-truth/i);
      if (/\.(js|html|css|json)$/.test(file)) {
        expect(readFileSync(file, 'utf8'), `${file} contem BUG-`).not.toMatch(/BUG-\d{3}/);
      }
    }
  });

  it('itens nao descobriveis estao explicitamente justificados', () => {
    for (const entry of groundTruth.entries) {
      if (entry.discoverable === false) {
        expect(entry.excludedReason, `${entry.id} sem justificativa`).toBeTruthy();
      }
    }
  });

  it('todo item tem os campos exigidos pelo benchmark', () => {
    for (const entry of groundTruth.entries) {
      expect(Object.keys(entry)).toEqual(expect.arrayContaining([
        'id', 'title', 'description', 'severity', 'feature',
        'discoverableByUi', 'discoverableByWebmcp', 'discoverable', 'evidence',
      ]));
      expect(['low', 'medium', 'high', 'critical']).toContain(entry.severity);
    }
  });
});
