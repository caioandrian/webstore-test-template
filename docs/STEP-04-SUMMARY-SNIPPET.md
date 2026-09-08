# Trecho para incorporação em `test-agente-mcpweb/STEP_SUMMARY.md`

> Este arquivo vive no SUT de propósito. Nenhum arquivo do repositório
> `test-agente-mcpweb` foi modificado no Step 4. Copie o bloco abaixo quando quiser
> incorporá-lo ao `STEP_SUMMARY.md`.

---

# Step 4 — Variante do SUT com WebMCP

## Escopo

Instrumentação de um SUT **separado** com WebMCP, em branch própria. Nenhum código do
agente foi alterado; nenhum benchmark foi executado; nenhuma comparação foi feita.

## Identificação

| | |
|---|---|
| SUT | `webstore-test-template` (ShowTickets), repositório externo |
| Commit base | `12f82740fd8758b88c000749e2fed3023690ade4` (`12f8274`) — o mesmo servido pelo GitHub Pages no baseline black-box |
| Branch criada | `experiment/webmcp` |
| `main` do SUT | intacta em `12f8274` |
| Commits criados | nenhum |
| URL publicada da variante | `https://caioandrian.github.io/webstore-test-template/webmcp/` |
| Documentação da variante | `docs/WEBMCP-VARIANT.md` na branch do SUT |

## Ferramentas WebMCP

Seis, todas correspondentes a capacidades já disponíveis pela interface:
`listEvents`, `searchEvents`, `getEventDetails`, `getStoreState`, `navigateTo`,
`getPurchaseQuote`. Cada uma com `inputSchema` explícito, validação de argumentos,
resposta `{content, structuredContent}` e erro previsível
(`INVALID_ARGUMENTS` / `NOT_FOUND` / `UNAVAILABLE` / `EXECUTION_FAILED` / `UNKNOWN_TOOL`).

Não existe ferramenta genérica de execução, consulta a banco, leitura de arquivo ou
acesso a código-fonte, e nenhuma alcança o Ground Truth.

## API nativa vs shim

O Chromium empacotado pelo Playwright (`153.0.8010.12`) **não** implementa
`navigator.modelContext`. A variante registra na API nativa quando ela existe
(`navigator.modelContext` → `document.modelContext`) e, quando não existe, instala um
shim com o mesmo contrato público (`registerTool`/`unregisterTool`/`getTools`/
`executeTool`), as mesmas ferramentas, a mesma validação e o mesmo formato de retorno.
A validação vive na própria ferramenta, portanto vale nos dois caminhos.

**A validação do Step 4 usou o shim** (`__webmcp.api === "shim"`, `native: false`).
`RunConfig.webmcpEnabled` deve ser `true` no Step 5, e vale registrar em
`BASELINE.md`/`EXPERIMENT.md` que o caminho foi o shim, não a API nativa.

## Ground Truth

`docs/ground-truth/ground-truth.json` + `GROUND-TRUTH.md` na branch do SUT. **10
defeitos pré-existentes**, nenhum introduzido. Campos por item: id, descrição,
severidade, funcionalidade, descobrível por UI/Playwright, descobrível por WebMCP,
evidência, motivo e `discoverable`.

**Denominador de recall: 8 de 10.** `BUG-009` (código morto atrás de controle
desabilitado) e `BUG-010` (só observável fora da URL do baseline) ficam explicitamente
fora, com justificativa registrada.

O arquivo não é servido pela aplicação (fora de `src/` e `public/`, ausente do `dist/`)
e não é alcançável por nenhuma ferramenta — verificado por teste, não por convenção.

## Testes

- **87 testes Vitest, 8 arquivos, todos passando** no SUT: registro, schemas,
  validação, respostas, ausência de exposição interna, inacessibilidade do Ground
  Truth, comportamento preservado, paridade shim↔nativo.
- **Suíte Cypress existente: 8/8 passando**, sem alteração.
- `npm run lint`: os mesmos 7 warnings do commit base, nenhum novo.
- Validação no Chromium do agente: descoberta das ferramentas, chamada válida, id
  inexistente, argumento inválido, ferramenta desconhecida, e varredura das respostas
  com sessão real ativa — nenhuma credencial, dado pessoal, caminho de arquivo ou
  marcador de Ground Truth.
- Screenshot da home 1280×800 **byte a byte idêntico** ao do baseline em produção
  (SHA-256 `08e618bbec910258` nos dois).

## Alterações inevitáveis no SUT

1. `src/App.jsx` — duas linhas para montar `<WebMcpProvider />` (não renderiza nada).
2. `src/utils/pricing.js` (novo) + `src/pages/Purchase.jsx` — extração, sem mudança de
   fórmula, do cálculo de totais que existia duplicado. Necessária para que
   `getPurchaseQuote` e a página de compra não possam divergir.
3. `package.json`/`package-lock.json`/`vitest.config.js` — devDependencies `vitest` e
   `jsdom` e scripts de teste. Fora do bundle.
4. `docs/` — documentação e Ground Truth, fora de `dist/`.

Nenhuma página, texto, produto, dado, seletor `data-cy`, estilo ou defeito foi alterado.

## Confundidores a controlar no Step 5

- **URL**: baseline em `https://caioandrian.github.io/webstore-test-template/`,
  variante em `https://caioandrian.github.io/webstore-test-template/webmcp/`. **Mesma
  origem** — a diferença de origem deixou de ser confundidor.
- **`localStorage` é compartilhado** entre os dois braços (mesma origem). O Step 5
  precisa limpar `showtickets_session`, `showtickets_users` e `showtickets_orders`
  entre execuções, ou um braço herda o estado do outro.
- **Fragilidade do deploy**: um push na `main` dispara `deploy.yml`, cujo artefato só
  tem a raiz, e isso apaga `/webmcp/`. Não publicar a `main` durante o benchmark.
- **Contrato de ações**: ainda não decidido se as ferramentas viram novas
  `AgentAction` ou são despachadas sob o mesmo `BrowserDriver`. Se `DECISION_SCHEMA` ou
  o prompt mudarem, o prompt deixa de ser idêntico entre os braços — confundidor.
- **`navigateTo`** altera a rota sem gastar ação de browser, o que afeta a comparação
  de `browserActions`.
- **Manter constantes**: instrução, limites (20/20/5 min), modelo, provider, seed,
  browser e versão do agente.

## Gate

Step 4 concluído. Step 5 e qualquer benchmark aguardam autorização explícita.
