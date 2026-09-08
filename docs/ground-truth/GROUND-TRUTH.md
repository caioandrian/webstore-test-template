# Ground Truth — ShowTickets (variante `experiment/webmcp`)

Coleção controlada de defeitos **pré-existentes** do SUT, usada para avaliar
precision e recall de execuções autônomas de QA.

- **Commit base:** `12f82740fd8758b88c000749e2fed3023690ade4`
- **Variante:** `experiment/webmcp`
- **Formato consumível:** [`ground-truth.json`](ground-truth.json)

## Regras

1. **Nenhum defeito foi introduzido.** Todos existem no commit base e valem
   igualmente para a versão black-box e para esta variante.
2. **Independente do agente.** Vive fora de `src/`, não entra em `dist/`, não é
   servido pela aplicação e não é alcançável por nenhuma ferramenta WebMCP.
   Isso é verificado por teste (`no-ground-truth-access.test.js`).
3. **O agente nunca recebe este arquivo** durante uma execução de benchmark. Ele
   é consumido apenas pelo avaliador, depois da execução.
4. Itens com `discoverable: false` ficam **fora do denominador de recall**.

## Tabela

| ID | Defeito | Sev. | Funcionalidade | UI/Playwright | WebMCP | No denominador |
|---|---|---|---|---|---|---|
| BUG-001 | Toggle "Mostrar eventos esgotados" não altera a listagem (duplo toggle no `<label>`) | medium | Filtro de disponibilidade | sim | parcial | **sim** |
| BUG-002 | `?categoria=` na URL não reaplica o filtro se já se está em `/eventos` | medium | Filtro por categoria via URL | sim | não | **sim** |
| BUG-003 | Detalhes do pedido exibem ids (`pista-premium`, `kit-vip`) em vez de nomes | medium | Meus Ingressos | sim | parcial | **sim** |
| BUG-004 | Compra não valida `available` nem `remaining`; estoque nunca decrementa | high | Fluxo de compra | sim | sim | **sim** |
| BUG-005 | Categoria "MPB" no filtro sem nenhum evento | low | Filtro por categoria | sim | sim | **sim** |
| BUG-006 | Senhas em texto puro no `localStorage` | high | Autenticação | só via script | não | **sim** |
| BUG-007 | Cadastro aceita nascimento futuro e CPF sem dígitos válidos | medium | Cadastro | sim | não | **sim** |
| BUG-008 | Links institucionais do rodapé são inertes (`href="#"` + `preventDefault`) | low | Rodapé | sim | não | **sim** |
| BUG-009 | `EventCard` navega para `/eventos/:id`, rota inexistente | low | Card de evento | não | não | **não** |
| BUG-010 | QR Code usa URL de produção fixa no código | low | QR / deep link | não | não | **não** |

**Denominador de recall: 8 de 10.**

## Critérios de descoberta

- **UI/Playwright** — observável por navegação, clique, digitação e leitura do
  DOM, ou por script executado na página (caso do BUG-006, via `localStorage`).
- **WebMCP** — observável a partir de `getTools`/`executeTool` sobre as
  ferramentas declaradas em [`src/webmcp/tools.js`](../../src/webmcp/tools.js).
  `parcial` significa que a ferramenta fornece a evidência que confirma ou
  explica o defeito, mas a manifestação em si está na interface.
- **Fora do denominador** — BUG-009 é código morto atrás de um controle
  permanentemente desabilitado; BUG-010 não se manifesta na URL usada pelo
  baseline black-box. Nenhum dos dois é alcançável pelos meios disponíveis aos
  dois braços do experimento, então excluí-los evita penalizar o recall por algo
  que nenhum agente poderia encontrar.

## Evidência mínima por item

Registrada campo a campo em [`ground-truth.json`](ground-truth.json) (`evidence`).
Em geral: screenshot do estado antes/depois, URL exata e passos reproduzíveis.
