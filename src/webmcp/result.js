// Formato de resposta e de erro compartilhado por todas as ferramentas WebMCP.
// Segue o contrato do MCP: `content` legivel + `structuredContent` para consumo programatico.

export const ERROR_CODES = {
  INVALID_ARGUMENTS: 'INVALID_ARGUMENTS',
  NOT_FOUND: 'NOT_FOUND',
  UNAVAILABLE: 'UNAVAILABLE',
  EXECUTION_FAILED: 'EXECUTION_FAILED',
  UNKNOWN_TOOL: 'UNKNOWN_TOOL',
};

export function ok(structuredContent, text) {
  return {
    content: [{ type: 'text', text }],
    structuredContent,
    isError: false,
  };
}

export function toolError(code, message, details = null) {
  const error = details ? { code, message, details } : { code, message };
  return {
    content: [{ type: 'text', text: `${code}: ${message}` }],
    structuredContent: { error },
    isError: true,
  };
}
