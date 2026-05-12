/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(role: 'admin' | 'influencer' | 'client'): Chainable<void>
    }
  }
}

const users = {
  admin: { email: 'lucaspaulinobs@gmail.com', password: 'teste123', redirectTo: '/admin' },
  influencer: { email: 'trafficsolutionsmkt@gmail.com', password: 'teste123', redirectTo: '/painel' },
  client: { email: 'cliente@agendainflu.com', password: 'teste123', redirectTo: '/cliente' },
}

Cypress.Commands.add('login', (role: 'admin' | 'influencer' | 'client') => {
  const user = users[role]
  cy.clearCookies()
  cy.clearLocalStorage()
  cy.visit('/login')
  cy.get('input[type="email"]', { timeout: 10000 }).should('be.visible').clear().type(user.email)
  cy.get('input[type="password"]').clear().type(user.password)
  cy.contains('button', 'Entrar').click()
  cy.url({ timeout: 20000 }).should('include', user.redirectTo)
})

export {}
