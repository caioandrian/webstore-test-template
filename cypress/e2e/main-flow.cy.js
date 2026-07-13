/**
 * Teste E2E — Fluxo Principal do ShowTickets
 *
 * Cobre:
 *  1. Cadastro de novo usuário
 *  2. Login com o usuário criado
 *  3. Compra de ingresso (5 etapas)
 *  4. Histórico de compras (Meus Ingressos)
 *  5. Detalhes do pedido
 *  6. Edição de dados do perfil
 *  7. Troca de senha
 *  8. Logout e login com nova senha
 *
 * Todos os asserts de localStorage garantem que o estado persiste corretamente.
 */

const USER = {
  name: 'Teste E2E Cypress',
  email: `e2e.${Date.now()}@teste.com`,
  cpf: '123.456.789-09',
  rawCpf: '12345678909',
  phone: '(11) 98765-4321',
  rawPhone: '11987654321',
  birthdate: '1990-01-15',
  password: 'Senha123',
  newPassword: 'NovaSenha456',
}

const CARD = {
  number: '4111 1111 1111 1111',
  name: 'TESTE E2E',
  expiry: '12/28',
  cvv: '123',
}

const EVENT_TITLE = 'Rock Festival Brasil 2025'

let capturedOrderId = ''

describe('Fluxo principal do ShowTickets', { testIsolation: false }, () => {
  before(() => {
    cy.clearAppStorage()
    cy.visit('/')
  })

  it('1. Cadastra novo usuário', () => {
    cy.log('--- CADASTRO ---')
    cy.hashNavigate('/login?tab=register')
    cy.get('[data-cy="register-form"]').should('be.visible')

    cy.get('[data-cy="reg-name"]').type(USER.name)
    cy.get('[data-cy="reg-email"]').type(USER.email)
    cy.get('[data-cy="reg-cpf"]').type(USER.rawCpf)
    cy.get('[data-cy="reg-phone"]').type(USER.rawPhone)
    cy.get('[data-cy="reg-birthdate"]').type(USER.birthdate)
    cy.get('[data-cy="reg-password"]').type(USER.password)
    cy.get('[data-cy="reg-confirm-password"]').type(USER.password)
    cy.get('[data-cy="register-submit-btn"]').click()

    cy.url().should('not.include', '/login')

    cy.log('Verifica localStorage após cadastro')
    cy.getLocalStorage('showtickets_users').then((users) => {
      expect(users).to.have.length(1)
      expect(users[0].email).to.equal(USER.email)
      expect(users[0].name).to.equal(USER.name)
      expect(users[0].password).to.equal(USER.password)
    })
    cy.getLocalStorage('showtickets_session').then((session) => {
      expect(session).to.not.be.null
      expect(session.email).to.equal(USER.email)
      expect(session.name).to.equal(USER.name)
      expect(session).to.not.have.property('password')
    })
  })

  it('2. Logout e login com credenciais', () => {
    cy.log('--- LOGOUT ---')
    cy.hashNavigate('/perfil')
    cy.get('[data-cy="logout-btn"]').click()

    cy.getLocalStorage('showtickets_session').then((session) => {
      expect(session).to.be.null
    })

    cy.log('--- LOGIN ---')
    cy.hashNavigate('/login')
    cy.get('[data-cy="login-form"]').should('be.visible')
    cy.get('[data-cy="login-email"]').type(USER.email)
    cy.get('[data-cy="login-password"]').type(USER.password)
    cy.get('[data-cy="login-submit-btn"]').click()

    cy.url().should('not.include', '/login')

    cy.getLocalStorage('showtickets_session').then((session) => {
      expect(session).to.not.be.null
      expect(session.email).to.equal(USER.email)
    })
  })

  it('3. Compra um ingresso (5 etapas)', () => {
    cy.log('--- COMPRA: Step 1 — Ingressos ---')
    cy.hashNavigate('/comprar/rock-festival-2025')
    cy.get('[data-cy="purchase-page"]').should('be.visible')

    cy.get('[data-cy="qty-increase"]').eq(0).click()
    cy.get('[data-cy="qty-value"]').eq(0).should('have.text', '1')
    cy.get('[data-cy="next-btn"]').click()

    cy.log('--- COMPRA: Step 2 — Add-ons ---')
    cy.get('[data-cy="step-addons"]').should('be.visible')
    cy.get('[data-cy="next-btn"]').click()

    cy.log('--- COMPRA: Step 3 — Dados Pessoais ---')
    cy.get('[data-cy="step-user-data"]').should('be.visible')
    cy.get('[data-cy="field-name"]').clear().type(USER.name)
    cy.get('[data-cy="field-email"]').clear().type(USER.email)
    cy.get('[data-cy="field-confirmEmail"]').clear().type(USER.email)
    cy.get('[data-cy="field-cpf"]').clear().type(USER.rawCpf)
    cy.get('[data-cy="field-phone"]').clear().type(USER.rawPhone)
    cy.get('[data-cy="field-birthdate"]').clear().type(USER.birthdate)
    cy.get('[data-cy="next-btn"]').click()

    cy.log('--- COMPRA: Step 4 — Pagamento ---')
    cy.get('[data-cy="step-payment"]').should('be.visible')
    cy.get('[data-cy="payment-method-btn"][data-method="credit"]').click()
    cy.get('[data-cy="card-form"]').should('be.visible')
    cy.get('[data-cy="field-card-number"]').type(CARD.number)
    cy.get('[data-cy="field-card-name"]').type(CARD.name)
    cy.get('[data-cy="field-expiry"]').type(CARD.expiry)
    cy.get('[data-cy="field-cvv"]').type(CARD.cvv)
    cy.get('[data-cy="next-btn"]').click()

    cy.log('Aguarda processamento do pagamento')
    cy.get('[data-cy="payment-processing"]', { timeout: 1000 }).should('be.visible')
    cy.get('[data-cy="payment-processing"]', { timeout: 10000 }).should('not.exist')

    cy.log('--- COMPRA: Step 5 — Confirmação ---')
    cy.get('[data-cy="purchase-success"]', { timeout: 12000 }).should('be.visible')
    cy.get('[data-cy="order-confirmation-card"]').should('be.visible')
    cy.get('[data-cy="order-id"]').invoke('text').then((text) => { capturedOrderId = text.trim() })

    cy.log('Verifica localStorage após compra')
    cy.getLocalStorage('showtickets_orders').then((orders) => {
      expect(orders).to.have.length(1)
      expect(orders[0].status).to.equal('confirmed')
      expect(orders[0].event.title).to.equal(EVENT_TITLE)
    })
    cy.getLocalStorage('showtickets_session').then((session) => {
      cy.getLocalStorage('showtickets_orders').then((orders) => {
        expect(orders[0].userId).to.equal(session.id)
      })
    })
  })

  it('4. Acessa histórico de compras (Meus Ingressos)', () => {
    cy.log('--- MEUS INGRESSOS ---')
    cy.get('[data-cy="view-tickets-btn"]').click()

    cy.get('[data-cy="my-tickets-page"]').should('be.visible')
    cy.get('[data-cy="ticket-card"]').should('have.length', 1)
    cy.get('[data-cy="order-event-title"]').should('contain.text', EVENT_TITLE)
    cy.get('[data-cy="order-status"]').should('contain.text', 'Confirmado')

    cy.get('[data-cy="order-id-display"]').should('contain.text', capturedOrderId)
  })

  it('5. Expande e verifica detalhes do pedido', () => {
    cy.log('--- DETALHES DO PEDIDO ---')
    cy.get('[data-cy="expand-order-btn"]').click()
    cy.get('[data-cy="order-details"]').should('be.visible')
    cy.get('[data-cy="order-details"]').should('contain.text', 'pista')
  })

  it('6. Edita dados do perfil', () => {
    cy.log('--- EDIÇÃO DE PERFIL ---')
    cy.hashNavigate('/perfil')
    cy.get('[data-cy="profile-info-section"]').should('be.visible')

    const newName = 'Teste E2E Editado'
    const newRawPhone = '21912345678'

    cy.get('[data-cy="profile-name-field"]').clear().type(newName)
    cy.get('[data-cy="profile-phone-field"]').clear().type(newRawPhone)
    cy.get('[data-cy="save-profile-btn"]').click()

    cy.get('[data-cy="toast"]').should('contain.text', 'Dados atualizados com sucesso!')

    cy.log('Verifica localStorage após edição do perfil')
    cy.getLocalStorage('showtickets_session').then((session) => {
      expect(session.name).to.equal(newName)
    })
    cy.getLocalStorage('showtickets_users').then((users) => {
      expect(users[0].name).to.equal(newName)
    })
  })

  it('7. Altera a senha', () => {
    cy.log('--- TROCA DE SENHA ---')
    cy.get('[data-cy="profile-nav-security"]').click()
    cy.get('[data-cy="profile-security-section"]').should('be.visible')

    cy.get('[data-cy="field-current-password"]').type(USER.password)
    cy.get('[data-cy="field-new-password"]').type(USER.newPassword)
    cy.get('[data-cy="field-confirm-password"]').type(USER.newPassword)
    cy.get('[data-cy="save-password-btn"]').click()

    cy.get('[data-cy="toast"]').should('contain.text', 'Senha alterada com sucesso!')

    cy.log('Verifica localStorage após troca de senha')
    cy.getLocalStorage('showtickets_users').then((users) => {
      expect(users[0].password).to.equal(USER.newPassword)
      expect(users[0].password).to.not.equal(USER.password)
    })
  })

  it('8. Logout e login com nova senha', () => {
    cy.log('--- LOGOUT ---')
    cy.get('[data-cy="logout-btn"]').click()

    cy.getLocalStorage('showtickets_session').then((session) => {
      expect(session).to.be.null
    })

    cy.log('--- LOGIN COM NOVA SENHA ---')
    cy.hashNavigate('/login')
    cy.get('[data-cy="login-email"]').type(USER.email)
    cy.get('[data-cy="login-password"]').type(USER.newPassword)
    cy.get('[data-cy="login-submit-btn"]').click()

    cy.url().should('not.include', '/login')

    cy.getLocalStorage('showtickets_session').then((session) => {
      expect(session).to.not.be.null
      expect(session.email).to.equal(USER.email)
    })

    cy.log('Fluxo principal concluído com sucesso!')
  })
})
