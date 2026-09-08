# Variante experimental — WebMCP

Documentação da branch `experiment/webmcp` do SUT ShowTickets, criada no **Step 4**
do projeto `test-agente-mcpweb`.

A única diferença experimental pretendida em relação à versão usada no baseline
black-box é a **disponibilidade de uma superfície WebMCP**.

---

## 1. Identificação

| | |
|---|---|
| Commit base | `12f82740fd8758b88c000749e2fed3023690ade4` (`12f8274`) |
| Mensagem | `chore: atualiza copyright do footer para 2026 QA TEST TEMPLATE` |
| Branch criada | `experiment/webmcp` |
| Baseline black-box comparável | `run-20260908T160333Z-5dwq59` (`https://caioandrian.github.io/webstore-test-template/`) |
| Commits nesta branch | **nenhum** — as alterações permanecem no working tree |
| SUT original | `main` permanece em `12f8274`, intacta |

O commit base foi confirmado assim: `main == origin/main == 12f8274`, working tree
limpo, e `.github/workflows/deploy.yml` publica `main` no GitHub Pages a cada push —
logo a URL usada no baseline serve exatamente esse commit.

---

## 2. Ferramentas WebMCP

Seis ferramentas, todas correspondentes a capacidades que o usuário já possui pela
interface. Definidas em [`src/webmcp/tools.js`](../src/webmcp/tools.js).

| Ferramenta | Capacidade equivalente na UI | `required` |
|---|---|---|
| `listEvents` | Página "Todos os Eventos" | — |
| `searchEvents` | Busca + chips de categoria + toggle de esgotados | — |
| `getEventDetails` | Detalhes do evento e tabela de ingressos/adicionais | `eventId` |
| `getStoreState` | Estado observável: rota, sessão ativa, nº de pedidos | — |
| `navigateTo` | Clicar num item do menu | `route` |
| `getPurchaseQuote` | Resumo do pedido na página de compra | `eventId`, `tickets` |

### Schemas

```jsonc
// listEvents
{ "type":"object", "additionalProperties":false, "properties":{
    "limit":  { "type":"integer", "minimum":1, "maximum":50 },
    "offset": { "type":"integer", "minimum":0 } } }

// searchEvents
{ "type":"object", "additionalProperties":false, "properties":{
    "query":          { "type":"string", "maxLength":100 },
    "category":       { "type":"string", "enum":["Todas","Rock","Sertanejo","Eletrônica","Pagode","Forró","MPB"] },
    "includeSoldOut": { "type":"boolean" } } }

// getEventDetails
{ "type":"object", "additionalProperties":false, "required":["eventId"],
  "properties":{ "eventId": { "type":"string", "minLength":1 } } }

// getStoreState
{ "type":"object", "additionalProperties":false, "properties":{} }

// navigateTo
{ "type":"object", "additionalProperties":false, "required":["route"], "properties":{
    "route":   { "type":"string", "enum":["/","/eventos","/comprar","/meus-ingressos","/contato","/login","/perfil","/automacao"] },
    "eventId": { "type":"string", "minLength":1 } } }

// getPurchaseQuote
{ "type":"object", "additionalProperties":false, "required":["eventId","tickets"], "properties":{
    "eventId": { "type":"string", "minLength":1 },
    "tickets": { "type":"array", "minItems":1, "maxItems":20, "items":{
        "type":"object", "additionalProperties":false, "required":["ticketId","quantity"], "properties":{
          "ticketId": { "type":"string", "minLength":1 },
          "type":     { "type":"string", "enum":["inteira","meia"] },
          "quantity": { "type":"integer", "minimum":1, "maximum":10 } } } },
    "addons":  { "type":"array", "maxItems":10, "items":{ "type":"string", "minLength":1 } } } }
```

### Formato de resposta

Sucesso — contrato MCP, `content` legível + `structuredContent` programático:

```jsonc
{ "content": [{ "type": "text", "text": "1 evento(s) encontrado(s)." }],
  "structuredContent": { "events": [ /* ... */ ], "total": 1, "appliedFilters": { /* ... */ } },
  "isError": false }
```

Erro — mesmo envelope, com código estável:

```jsonc
{ "content": [{ "type": "text", "text": "INVALID_ARGUMENTS: limit: valor minimo e 1" }],
  "structuredContent": { "error": { "code": "INVALID_ARGUMENTS", "message": "limit: valor minimo e 1" } },
  "isError": true }
```

Códigos: `INVALID_ARGUMENTS`, `NOT_FOUND`, `UNAVAILABLE`, `EXECUTION_FAILED`, `UNKNOWN_TOOL`.

### O que deliberadamente **não** existe

Nenhuma ferramenta genérica (`executeAnything`, `runCode`, `queryDatabase`,
`getSource`, leitura de arquivo), nenhum acesso ao `localStorage` bruto, a usuários
ou senhas, ao código-fonte ou ao Ground Truth. Uma exceção lançada dentro de uma
ferramenta é convertida em `EXECUTION_FAILED` **sem** propagar a mensagem original,
que poderia carregar caminho de arquivo ou detalhe interno.

---

## 3. API nativa vs shim

`resolveModelContextHost()` ([`src/webmcp/host.js`](../src/webmcp/host.js)) escolhe,
nesta ordem:

1. `navigator.modelContext` (Chrome 146+, Edge 147+)
2. `document.modelContext` (forma usada pelo explainer do W3C)
3. **shim local**, instalado nos dois pontos

### Por que o shim existe

O Chromium empacotado pelo Playwright — **o mesmo browser que o agente usa no
benchmark** — não implementa `navigator.modelContext`. Verificado nesta validação:
Chromium `153.0.8010.12`, API ausente antes do registro. Sem o shim a capacidade
WebMCP seria inalcançável e o Step 5 não teria o que medir.

O shim **não** cria uma segunda semântica: expõe `registerTool`, `unregisterTool`,
`getTools` e `executeTool` com o mesmo contrato, as mesmas ferramentas, a mesma
validação e o mesmo formato de retorno. A validação de argumentos vive na própria
ferramenta (`wrapTool`), portanto vale igualmente quando a API nativa executa
`execute` diretamente, sem passar por `executeTool` — isso é coberto por
`shim-parity.test.js`, que compara descritores, resultados e erros dos dois caminhos.

Quando a API nativa existe mas não oferece `getTools`/`executeTool`, esses dois
métodos são ligados a um registro local com as mesmas ferramentas (`bridged: true`).

### Como saber qual foi usado

`globalThis.__webmcp` traz apenas metadado de diagnóstico:

```json
{ "api": "shim", "native": false, "bridged": false,
  "tools": ["listEvents","searchEvents","getEventDetails","getStoreState","navigateTo","getPurchaseQuote"] }
```

**A execução de validação do Step 4 usou o shim** (`api: "shim"`, `native: false`).
`typeof navigator.modelContext` retorna `"object"` depois do registro justamente
porque o shim foi instalado ali — o sinal autoritativo é `__webmcp.api`.

---

## 4. Alterações inevitáveis em relação ao SUT original

Quatro, todas fora do comportamento observável da aplicação:

1. **`src/App.jsx`** — duas linhas: import e `<WebMcpProvider />`, um componente que
   não renderiza nada. É o ponto de integração único.
2. **`src/utils/pricing.js` (novo) + `src/pages/Purchase.jsx`** — a fórmula de cálculo
   de totais, que existia duplicada em `calcTotal` e em `OrderSummary`, foi extraída
   sem mudança de fórmula. Necessária para que `getPurchaseQuote` e a página de compra
   não possam divergir — se a lógica fosse duplicada, o teste de equivalência
   compararia duas cópias do mesmo código e não provaria nada. Coberto por
   `behavior-preserved.test.js`.
3. **`package.json` / `package-lock.json`** — devDependencies `vitest` e `jsdom`,
   scripts `test` e `test:watch`, e `vitest.config.js`. O SUT só tinha Cypress. Nada
   disso entra no bundle servido.
4. **`docs/`** — documentação e Ground Truth. Fora de `src/` e de `public/`, portanto
   fora de `dist/`.

Nenhuma página, texto, produto, dado, estilo, seletor `data-cy` ou defeito foi
alterado.

### Evidência de preservação visual

Screenshot da home em 1280×800, capturado pelo mesmo Chromium do agente:

| Alvo | SHA-256 (16 primeiros) |
|---|---|
| Variante (`localhost:4173`) | `08e618bbec910258` |
| Baseline (`caioandrian.github.io`) | `08e618bbec910258` |

Bytes idênticos.

---

## 5. Deployment / Experimental Confounders

### Publicação

A variante está publicada em:

**`https://caioandrian.github.io/webstore-test-template/webmcp/`**

O baseline permanece em `https://caioandrian.github.io/webstore-test-template/`,
**byte a byte inalterado**.

### Por que o workflow é assim

O Pages deste repositório usa a fonte *GitHub Actions* (`build_type: "workflow"`),
em que **cada deployment substitui o site inteiro** — não existe publicação parcial.
O artefato precisa portanto conter raiz + `webmcp/`.

Reconstruir a raiz não é opção: o workflow da `main` usa `npm install`, e as
dependências flutuaram desde julho/2026. Um rebuild de `12f8274` produz
`index-D2wYR4Yw.js`, enquanto o publicado é `index-CmyWbIII.js` — os bytes do
baseline mudariam.

Estratégia adotada em [`.github/workflows/deploy-webmcp.yml`](../.github/workflows/deploy-webmcp.yml):

1. **Snapshot verbatim do baseline, sem rebuild** — `favicon.svg`/`icons.svg` de
   `git show 12f8274:public/`; `index.html` e os dois assets hasheados baixados do
   site vivo.
2. **Build da variante** com `vite build --base=/webstore-test-template/webmcp/`.
   `vite.config.js` não é alterado — a base vem por flag.
3. **Publicação da união** como um artefato só.

`.github/workflows/deploy.yml` (o da `main`) não foi tocado.

### Metadados do deployment

| | |
|---|---|
| Branch publicada | `experiment/webmcp` |
| Commit publicado | ver `gh api repos/caioandrian/webstore-test-template/deployments --jq '.[0]'` |
| Workflow | `Deploy WebMCP variant` |
| Environment | `github-pages` (policy ampliada para aceitar `experiment/webmcp`) |

Nenhum arquivo de identificação (`COMMIT.txt` ou equivalente) foi adicionado à
superfície pública: a rastreabilidade vive nos metadados do Actions, fora da
aplicação.

### Fragilidade permanente

**Qualquer push na `main` dispara `deploy.yml`, cujo artefato contém somente a
raiz — e isso apaga `/webmcp/`.** Enquanto o benchmark estiver ativo, não publicar
a `main`. Se acontecer, basta re-executar `Deploy WebMCP variant`.

### Confundidores

- **Origem deixou de ser confundidor.** Os dois braços passam a ser servidos pelo
  mesmo host (`caioandrian.github.io`), pelo mesmo CDN, com o mesmo TLS. Restam
  diferenças de *path*, não de origem.
- **`localStorage` é compartilhado entre os dois braços** — mesma origem. O Step 5
  precisa limpar `showtickets_session`, `showtickets_users` e `showtickets_orders`
  entre execuções, ou um braço herda o estado do outro.
- **Toolchain de build difere entre os braços.** O baseline foi compilado em
  julho/2026 com as dependências daquele momento; a variante é compilada agora. As
  versões de runtime e build são idênticas (react 19.2.7, react-dom 19.2.7,
  react-router-dom 7.18.0, vite 8.1.0, tailwindcss 4.3.1, @vitejs/plugin-react
  6.0.3 — verificado no lockfile), e o screenshot renderizado é idêntico, mas os
  bundles não são byte a byte iguais.
- `BUG-010` (QR com `BASE_URL` de produção fixo) continua **fora do denominador**:
  na variante o QR aponta para a raiz do baseline, não para `/webmcp/`.

## 6. Ground Truth

Ver [`docs/ground-truth/GROUND-TRUTH.md`](ground-truth/GROUND-TRUTH.md) e
[`ground-truth.json`](ground-truth/ground-truth.json).

10 defeitos **pré-existentes** catalogados; nenhum foi introduzido. **8 entram no
denominador de recall**; `BUG-009` (código morto atrás de controle desabilitado) e
`BUG-010` (só observável fora da URL do baseline) ficam de fora, com justificativa
registrada.

### Proteção

- Vive em `docs/`, fora de `src/` e de `public/` — não entra em `dist/` e não é
  servido pela aplicação. Verificado sobre o `dist/` real.
- Nenhum módulo de `src/` referencia `ground-truth` (teste estrutural).
- Nenhuma resposta de ferramenta contém id, título ou qualquer marcador `BUG-\d`.
- Nenhum descritor de ferramenta menciona bug, defeito, ground truth ou benchmark.

### Critérios de descoberta

- **UI/Playwright** — navegação, clique, digitação, leitura do DOM, ou script na
  página (caso de `BUG-006`, via `localStorage`).
- **WebMCP** — alcançável por `getTools`/`executeTool`. `parcial` = a ferramenta
  fornece a evidência que confirma o defeito, mas a manifestação está na interface.

---

## 7. Testes

### Nova suíte — Vitest + jsdom (`src/webmcp/__tests__/`)

**87 testes, 8 arquivos, todos passando.**

| Arquivo | Testes | Cobre |
|---|---|---|
| `registration.test.js` | 9 | shim instalado, API nativa preferida, ponte `getTools`/`executeTool`, idempotência, `AbortSignal`, metadado de diagnóstico |
| `schemas.test.js` | 21 | nome/descrição/`inputSchema` presentes, tipos e descrições em toda propriedade, `required` coerente, nomes únicos, ausência de ferramenta genérica, `InvalidStateError` |
| `validation.test.js` | 19 | obrigatório ausente, tipo errado, propriedade extra, min/max, não-inteiro, enum, id inexistente, arrays aninhados, falha interna sem vazamento |
| `responses.test.js` | 10 | `content` + `structuredContent` em todas, paginação estável, filtros aplicados, projeção de campos, totais |
| `no-internal-exposure.test.js` | 8 | credenciais, dados pessoais, `localStorage` bruto, caminhos/código-fonte, descritores sem `execute`, fronteira de imports |
| `no-ground-truth-access.test.js` | 8 | ids, títulos, descritores, `src/`, `dist/`, justificativa dos não descobríveis |
| `behavior-preserved.test.js` | 7 | equivalência com a página de compra, ausência de escrita, catálogo imutável, globais preservados, defeitos ainda presentes |
| `shim-parity.test.js` | 5 | descritores, resultados e erros idênticos entre shim e API nativa |

### Suíte existente, sem alteração

- `npx cypress run` — **8/8 passando** (cadastro, login, compra em 5 etapas, histórico,
  detalhes do pedido, edição de perfil, troca de senha, relogin).
- `npm run lint` — 7 warnings, **os mesmos 7 do commit base** (2 pré-existentes em
  `Purchase.jsx`, 5 na spec Cypress). Nenhum warning novo.
- `npm run build` — sucesso, 45 módulos, 380 kB.

### Validação técnica no Chromium do agente

Executada com o Playwright do repositório do agente (**sem modificá-lo**), contra
`vite preview`:

| Verificação | Resultado |
|---|---|
| SUT inicia e responde | ✓ HTTP 200 |
| Aplicação continua funcionando | ✓ `#/eventos` renderiza 5 cards, "5 eventos encontrados", título `QA - Website para Automação de Teste` |
| WebMCP disponível | ✓ via shim (`api: "shim"`, `native: false`) |
| Ferramentas descobertas | ✓ as 6, com `inputSchema` |
| Chamada válida | ✓ `searchEvents({query:'rock'})` → 1 evento, resposta estruturada |
| Chamada com id inexistente | ✓ `NOT_FOUND`, erro controlado |
| Chamada com argumento inválido | ✓ `INVALID_ARGUMENTS: limit: valor minimo e 1` |
| Ferramenta desconhecida | ✓ `UNKNOWN_TOOL` |
| Nenhuma informação privilegiada | ✓ com sessão real ativa, varredura das 6 respostas por senha, e-mail, CPF, telefone, `showtickets_users`, `BUG-`, `ground-truth`, `/src/` → **nenhuma ocorrência** |

O benchmark oficial **não** foi executado e **nenhuma comparação** com o baseline foi
feita.

---

## 8. Limitações e riscos

- **O shim é o ponto mais delicado do experimento.** Se não for funcionalmente
  equivalente à API nativa, o Step 5 mede diferença entre implementações de browser em
  vez de benefício da capacidade WebMCP. Mitigado por `shim-parity.test.js`, mas a
  paridade é testada contra um host nativo *simulado*: nenhuma execução contra Chrome
  146+ real foi feita nesta máquina.
- **Confundidor de ambiente** (§5): baseline em gh-pages, validação em localhost.
- **Como as ferramentas chegam ao agente ainda não está decidido** — se viram novas
  `AgentAction` ou se são despachadas sob o mesmo `BrowserDriver`. Essa decisão é do
  Step 5 e afeta se o prompt do agente permanece idêntico entre os dois braços; se não
  permanecer, isso é em si uma variável confundidora.
- **`navigateTo` é a única ferramenta que altera estado** (a rota). É uma ação que o
  usuário também faz pelo menu, mas significa que o braço WebMCP pode navegar sem
  gastar ação de browser — o que afeta a contagem de `browserActions` na comparação.
- **O Ground Truth vive num repositório público.** Não é servido nem alcançável pelas
  ferramentas, mas o agente jamais deve receber acesso ao working tree do SUT durante
  uma execução de benchmark.
- **A cobertura do Ground Truth é de 10 itens**, obtida por auditoria de código.
  Defeitos não catalogados que o agente venha a encontrar contarão como falso positivo
  pelo matching determinístico — vale revisar o Ground Truth antes de concluir o Step 5.
- **Nenhum commit foi criado**; permanece a critério do usuário.
