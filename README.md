# ShowTickets — Playground de Automação Web

Aplicação web institucional de venda de ingressos construída como **template de automação de testes**. Todos os elementos interativos possuem atributos `data-cy` e `id` padronizados, cenários de mock previsíveis e estado isolado via `localStorage` — sem dependência de backend real.

🌐 **Deploy:** [https://caioandrian.github.io/webstore-test-template/](https://caioandrian.github.io/webstore-test-template/)

🤖 **Playground de Automação:** [/automacao](https://caioandrian.github.io/webstore-test-template/#/automacao) — referência de seletores, cenários de mock e reset de estado

---

## Objetivo

Servir como ambiente de prática para **iniciantes em automação de testes web**, oferecendo:

- Fluxos reais de e-commerce (cadastro, login, compra, perfil, ingressos)
- Seletores `data-cy` e `id` em todos os elementos interativos
- Cenários de sucesso e falha documentados e previsíveis
- Estado resetável via localStorage sem necessidade de banco de dados
- Compatível com **Cypress**, **Playwright** e **Selenium**

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| UI | React 19 + Vite 8 |
| Estilos | Tailwind CSS v4 |
| Roteamento | React Router DOM v7 (HashRouter) |
| Persistência | localStorage (sem backend) |
| Deploy | GitHub Pages via GitHub Actions |

---

## Fluxos disponíveis para automação

| Fluxo | Rota | Descrição |
|-------|------|-----------|
| Home | `#/` | Hero, eventos em destaque, categorias |
| Eventos | `#/eventos` | Listagem com filtro por categoria |
| Compra | `#/comprar/:eventId` | Wizard 5 passos: ingressos → adicionais → dados → pagamento → confirmação |
| Login | `#/login` | Autenticação e cadastro com validações |
| Perfil | `#/perfil` | Edição de dados, troca de senha, histórico de compras |
| Meus Ingressos | `#/meus-ingressos` | QR code mockado, detalhes dos pedidos |
| Automação | `#/automacao` | Referência de seletores + reset de estado |

---

## Cenários de mock — Pagamento

| Cenário | Como disparar |
|---------|--------------|
| ✅ Pagamento aprovado | Qualquer CPF não terminado em `00` |
| ❌ CPF recusado | CPF terminando em `00` (ex: `123.456.789-00`) |
| ❌ Cartão recusado | Número do cartão iniciando com `5555` |
| ✅ PIX / Boleto | Sempre retornam sucesso |

---

## Seletores

Todos os elementos interativos seguem o padrão:

```html
<button id="login-submit-btn" data-cy="login-submit-btn">Entrar</button>
```

### Cypress
```js
cy.get('[data-cy="login-email"]').type('user@email.com')
cy.get('[data-cy="login-submit-btn"]').click()
```

### Playwright
```js
await page.locator('[data-cy="login-email"]').fill('user@email.com')
await page.locator('[data-cy="login-submit-btn"]').click()
```

### Selenium (Python)
```python
driver.find_element(By.CSS_SELECTOR, '[data-cy="login-email"]').send_keys('user@email.com')
```

> A referência completa de seletores está disponível na página [`#/automacao`](https://caioandrian.github.io/webstore-test-template/#/automacao).

---

## Reset de estado

Para limpar sessão, usuários e pedidos entre execuções de teste:

```js
// No próprio browser / cy.exec / beforeEach
localStorage.removeItem('showtickets_session')
localStorage.removeItem('showtickets_users')
localStorage.removeItem('showtickets_orders')
```

Ou acesse a página `/automacao` e clique em **"Limpar Estado Agora"**.

---

## Rodar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173/webstore-ingressos-sample/`

---

## Deploy

O deploy é feito automaticamente via **GitHub Actions** a cada push na branch `main`.

```
.github/workflows/deploy.yml
└── build → upload artifact → deploy GitHub Pages
```
