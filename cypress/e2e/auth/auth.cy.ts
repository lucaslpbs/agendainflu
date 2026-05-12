describe('Auth Endpoints', () => {
  const baseUrl = 'http://localhost:3000'

  describe('Login Flow', () => {
    it('should login as influencer and redirect to painel', () => {
      cy.visit('/login')
      cy.get('input[type="email"]').type('trafficsolutionsmkt@gmail.com')
      cy.get('input[type="password"]').type('teste123')
      cy.contains('button', 'Entrar').click()
      cy.url({ timeout: 10000 }).should('include', '/painel')
    })

    it('should login as admin and redirect to admin', () => {
      cy.visit('/login')
      cy.get('input[type="email"]').type('lucaspaulinobs@gmail.com')
      cy.get('input[type="password"]').type('teste123')
      cy.contains('button', 'Entrar').click()
      cy.url({ timeout: 10000 }).should('include', '/admin')
    })

    it('should login as client and redirect to cliente', () => {
      cy.visit('/login')
      cy.get('input[type="email"]').type('cliente@agendainflu.com')
      cy.get('input[type="password"]').type('teste123')
      cy.contains('button', 'Entrar').click()
      cy.url({ timeout: 10000 }).should('include', '/cliente')
    })

    it('should show error with invalid credentials', () => {
      cy.visit('/login')
      cy.get('input[type="email"]').type('invalido@teste.com')
      cy.get('input[type="password"]').type('senhaerrada')
      cy.contains('button', 'Entrar').click()
      cy.url().should('include', '/login')
    })
  })

  describe('Auth API', () => {
    it('GET /api/auth/me should return 401 without token', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/auth/me`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401)
      })
    })

    it('POST /api/auth/logout should return 200', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/auth/logout`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(200)
      })
    })

    it('POST /api/auth/exchange should return 400 with invalid body', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/auth/exchange`,
        body: { invalid: 'body' },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(400)
      })
    })

    it('POST /api/auth/exchange should return 401 with invalid token', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/auth/exchange`,
        body: { supabase_token: 'token-invalido' },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401)
      })
    })
  })

  describe('Protected Routes Redirect', () => {
    it('should redirect unauthenticated user from /painel to /login', () => {
      cy.clearCookies()
      cy.clearLocalStorage()
      cy.visit('/painel')
      cy.url({ timeout: 10000 }).should('include', '/login')
    })

    it('should redirect unauthenticated user from /admin to /login', () => {
      cy.clearCookies()
      cy.clearLocalStorage()
      cy.visit('/admin')
      cy.url({ timeout: 10000 }).should('include', '/login')
    })

    it('should redirect unauthenticated user from /cliente to /login', () => {
      cy.clearCookies()
      cy.clearLocalStorage()
      cy.visit('/cliente')
      cy.url({ timeout: 10000 }).should('include', '/login')
    })
  })

  describe('Influencer Registration', () => {
    it('POST /api/auth/register/influencer should return 400 with missing fields', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/auth/register/influencer`,
        body: { nome: 'Teste' },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(400)
      })
    })
  })
})
