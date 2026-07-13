Cypress.Commands.add('getLocalStorage', (key) => {
  return cy.window().then((win) => JSON.parse(win.localStorage.getItem(key)))
})

Cypress.Commands.add('clearAppStorage', () => {
  cy.clearLocalStorage('showtickets_users')
  cy.clearLocalStorage('showtickets_session')
  cy.clearLocalStorage('showtickets_orders')
  cy.clearLocalStorage('showtickets_cart')
})

// Navega via hash sem disparar um novo page load (necessário para HashRouter com testIsolation:false)
Cypress.Commands.add('hashNavigate', (path) => {
  cy.window().then((win) => {
    win.location.hash = path
  })
})
