import { useEffect } from 'react';
import { registerWebMcpTools } from './register.js';

/**
 * Ponto de integracao unico entre a aplicacao e a superficie WebMCP.
 * Nao renderiza nada e nao altera nenhum comportamento existente.
 * O registro vale por todo o ciclo de vida da pagina — nao ha desregistro
 * no cleanup para nao ficar preso ao remount duplo do StrictMode.
 */
export default function WebMcpProvider() {
  useEffect(() => {
    registerWebMcpTools();
  }, []);
  return null;
}
