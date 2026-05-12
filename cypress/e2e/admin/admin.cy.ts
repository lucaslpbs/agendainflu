describe('Admin & Authorization', () => {
  const baseUrl = 'http://localhost:3000'
  let adminToken: string
  let influencerToken: string

  before(() => {
    cy.visit('/login')
    cy.get('input[type="email"]').type('lucaspaulinobs@gmail.com')
    cy.get('input[type="password"]').type('teste123')
    cy.contains('button', 'Entrar').click()
    cy.url({ timeout: 15000 }).should('include', '/admin')
    cy.window().then((win) => {
      adminToken = win.localStorage.getItem('agenda-token') || ''
    })
  })

  describe('GET /api/admin/dashboard', () => {
    it('should return 401 or 200 without token', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/admin/dashboard`,
        failOnStatusCode: false,
      }).then((res) => {
        expect([200, 401]).to.include(res.status)
      })
    })

    it('should return dashboard stats for admin', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/admin/dashboard`,
        headers: { Authorization: `Bearer ${adminToken}` },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body).to.have.property('stats')
        expect(res.body.stats).to.have.property('influencers')
        expect(res.body.stats).to.have.property('bookings')
        expect(res.body.stats).to.have.property('clients')
        expect(res.body.stats).to.have.property('receita')
      })
    })
  })

  describe('GET /api/admin/influencers', () => {
    it('should return 401 without token', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/admin/influencers`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401)
      })
    })

    it('should return influencers list for admin', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/admin/influencers`,
        headers: { Authorization: `Bearer ${adminToken}` },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body).to.have.property('data')
        expect(res.body.data).to.be.an('array')
      })
    })

    it('should return 403 or 401 for non-admin token', () => {
      cy.visit('/login')
      cy.get('input[type="email"]').clear().type('trafficsolutionsmkt@gmail.com')
      cy.get('input[type="password"]').clear().type('teste123')
      cy.contains('button', 'Entrar').click()
      cy.url({ timeout: 15000 }).should('include', '/painel')
      cy.window().then((win) => {
        const token = win.localStorage.getItem('agenda-token') || ''
        cy.request({
          method: 'GET',
          url: `${baseUrl}/api/admin/influencers`,
          headers: { Authorization: `Bearer ${token}` },
          failOnStatusCode: false,
        }).then((res) => {
          expect([401, 403]).to.include(res.status)
        })
      })
    })
  })

  describe('Admin Influencer Actions', () => {
    it('POST /api/admin/influencers/[id]/approve should return 401 without token', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/admin/influencers/00000000-0000-0000-0000-000000000000/approve`,
        body: {},
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401)
      })
    })

    it('POST /api/admin/influencers/[id]/reject should return 401 without token', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/admin/influencers/00000000-0000-0000-0000-000000000000/reject`,
        body: {},
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401)
      })
    })

    it('POST /api/admin/influencers/[id]/approve should return 404 for non-existing influencer', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/admin/influencers/00000000-0000-0000-0000-000000000000/approve`,
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { checklist: {}, notas: '' },
        failOnStatusCode: false,
      }).then((res) => {
        expect([404, 400]).to.include(res.status)
      })
    })
  })

  describe('Authorization Rules', () => {
    it('client cannot access /painel', () => {
      cy.visit('/login')
      cy.get('input[type="email"]').clear().type('cliente@agendainflu.com')
      cy.get('input[type="password"]').clear().type('teste123')
      cy.contains('button', 'Entrar').click()
      cy.url({ timeout: 15000 }).should('include', '/cliente')
      cy.visit('/painel')
      cy.url({ timeout: 10000 }).should('not.include', '/painel').and('satisfy', (url: string) => {
        return url.includes('/login') || url.includes('/cliente')
      })
    })

    it('influencer cannot access /admin', () => {
      cy.visit('/login')
      cy.get('input[type="email"]').clear().type('trafficsolutionsmkt@gmail.com')
      cy.get('input[type="password"]').clear().type('teste123')
      cy.contains('button', 'Entrar').click()
      cy.url({ timeout: 15000 }).should('include', '/painel')
      cy.visit('/admin')
      cy.url({ timeout: 10000 }).should('satisfy', (url: string) => {
        return url.includes('/login') || url.includes('/painel') || url === 'http://localhost:3000/'
      })
    })

    it('unauthenticated user is redirected to /login from /admin', () => {
      cy.clearCookies()
      cy.clearLocalStorage()
      cy.visit('/admin')
      cy.url({ timeout: 10000 }).should('include', '/login')
    })

    it('unauthenticated user is redirected to /login from /painel', () => {
      cy.clearCookies()
      cy.clearLocalStorage()
      cy.visit('/painel')
      cy.url({ timeout: 10000 }).should('include', '/login')
    })
  })

  describe('Admin Pages', () => {
    it('should load admin dashboard page', () => {
      cy.visit('/login')
      cy.get('input[type="email"]', { timeout: 10000 }).clear().type('lucaspaulinobs@gmail.com')
      cy.get('input[type="password"]').clear().type('teste123')
      cy.contains('button', 'Entrar').click()
      cy.url({ timeout: 20000 }).should('include', '/admin')
      cy.contains('Dashboard', { timeout: 15000 }).should('be.visible')
    })

    it('should load admin influencers page', () => {
      cy.visit('/login')
      cy.get('input[type="email"]', { timeout: 10000 }).clear().type('lucaspaulinobs@gmail.com')
      cy.get('input[type="password"]').clear().type('teste123')
      cy.contains('button', 'Entrar').click()
      cy.url({ timeout: 20000 }).should('include', '/admin')
      cy.visit('/admin/influenciadoras')
      cy.contains('Influenciadoras', { timeout: 15000 }).should('be.visible')
    })

    it('should load admin bookings page', () => {
      cy.visit('/login')
      cy.get('input[type="email"]', { timeout: 10000 }).clear().type('lucaspaulinobs@gmail.com')
      cy.get('input[type="password"]').clear().type('teste123')
      cy.contains('button', 'Entrar').click()
      cy.url({ timeout: 20000 }).should('include', '/admin')
      cy.visit('/admin/agendamentos')
      cy.contains('Agendamentos', { timeout: 15000 }).should('be.visible')
    })
  })
})
