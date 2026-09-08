// Validacao de argumentos contra o inputSchema declarado por cada ferramenta.
// Subconjunto de JSON Schema suficiente para os schemas usados aqui — nao e um
// validador generico e recusa qualquer construcao que nao saiba avaliar.

import { ERROR_CODES } from './result.js';

const fail = (path, message) => ({
  ok: false,
  code: ERROR_CODES.INVALID_ARGUMENTS,
  message: path ? `${path}: ${message}` : message,
});

function typeOf(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function checkType(schema, value, path) {
  const expected = schema.type;
  const actual = typeOf(value);

  if (expected === 'integer') {
    if (actual !== 'number' || !Number.isInteger(value)) {
      return fail(path, `esperado integer, recebido ${actual === 'number' ? 'number nao inteiro' : actual}`);
    }
    return null;
  }
  if (expected === 'number' && (actual !== 'number' || !Number.isFinite(value))) {
    return fail(path, `esperado number, recebido ${actual}`);
  }
  if (expected && expected !== 'integer' && expected !== 'number' && actual !== expected) {
    return fail(path, `esperado ${expected}, recebido ${actual}`);
  }
  return null;
}

function validateValue(schema, value, path) {
  const typeError = checkType(schema, value, path);
  if (typeError) return typeError;

  if (schema.enum && !schema.enum.includes(value)) {
    return fail(path, `valor nao permitido; use um de: ${schema.enum.join(', ')}`);
  }
  if (schema.type === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      return fail(path, `minimo de ${schema.minLength} caractere(s)`);
    }
    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      return fail(path, `maximo de ${schema.maxLength} caractere(s)`);
    }
  }
  if (schema.type === 'number' || schema.type === 'integer') {
    if (schema.minimum !== undefined && value < schema.minimum) {
      return fail(path, `valor minimo e ${schema.minimum}`);
    }
    if (schema.maximum !== undefined && value > schema.maximum) {
      return fail(path, `valor maximo e ${schema.maximum}`);
    }
  }
  if (schema.type === 'array') {
    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      return fail(path, `maximo de ${schema.maxItems} item(ns)`);
    }
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      return fail(path, `minimo de ${schema.minItems} item(ns)`);
    }
    if (schema.items) {
      for (let i = 0; i < value.length; i += 1) {
        const err = validateValue(schema.items, value[i], `${path}[${i}]`);
        if (err) return err;
      }
    }
  }
  if (schema.type === 'object') {
    return validateObject(schema, value, path);
  }
  return null;
}

function validateObject(schema, value, path) {
  const properties = schema.properties || {};
  const required = schema.required || [];

  for (const key of required) {
    if (value[key] === undefined) {
      return fail(path ? `${path}.${key}` : key, 'campo obrigatorio ausente');
    }
  }
  if (schema.additionalProperties === false) {
    for (const key of Object.keys(value)) {
      if (!(key in properties)) {
        return fail(path ? `${path}.${key}` : key, 'propriedade nao reconhecida');
      }
    }
  }
  for (const [key, propSchema] of Object.entries(properties)) {
    if (value[key] === undefined) continue;
    const err = validateValue(propSchema, value[key], path ? `${path}.${key}` : key);
    if (err) return err;
  }
  return null;
}

/**
 * @returns {{ok: true, value: object} | {ok: false, code: string, message: string}}
 */
export function validateArguments(inputSchema, args) {
  const value = args === undefined || args === null ? {} : args;
  if (typeOf(value) !== 'object') {
    return fail('', `argumentos devem ser um objeto, recebido ${typeOf(value)}`);
  }
  const err = validateObject(inputSchema, value, '');
  if (err) return err;
  return { ok: true, value };
}
