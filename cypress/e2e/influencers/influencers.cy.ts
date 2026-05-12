describe('Influencers & Services', () => {
  const baseUrl = 'http://localhost:3000'
  let authToken: string

  before(() => {
    cy.visit('/login')
    cy.get('input[type="email"]').type('trafficsolutionsmkt@gmail.com')
    cy.get('input[type="password"]').type('teste123')
    cy.contains('button', 'Entrar').click()
    cy.url({ timeout: 15000 }).should('include', '/painel')
    cy.window().then((win) => {
      authToken = win.localStorage.getItem('agenda-token') || ''
    })
  })

  describe('GET /api/influencers', () => {
    it('should return list of active influencers', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/influencers`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body).to.have.property('data')
        expect(res.body.data).to.be.an('array')
      })
    })

    it('should filter influencers by nicho', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/influencers?nicho=Moda`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body).to.have.property('data')
      })
    })

    it('should return data array with limit param', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/influencers?limit=2`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body).to.have.property('data')
        expect(res.body.data).to.be.an('array')
        expect(res.body.data.length).to.be.lte(2)
      })
    })
  })

  describe('GET /api/influencers/[slug]', () => {
    it('should return influencer by username', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/influencers/flavinhapaulinooficial`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body).to.have.property('influencer')
        expect(res.body.influencer).to.have.property('id')
        expect(res.body.influencer).to.have.property('username')
      })
    })

    it('should return 404 for non-existing influencer', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/influencers/usuario-que-nao-existe-xyz`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(404)
      })
    })
  })

  describe('Influencer Profile Page', () => {
    it('should load influencer public profile', () => {
      cy.visit('/flavinhapaulinooficial')
      cy.contains('Flavinha paulino', { timeout: 10000 }).should('be.visible')
      cy.contains('Entrar para Agendar').should('be.visible')
    })

    it('should show services on profile', () => {
      cy.visit('/flavinhapaulinooficial')
      cy.contains('Serviços disponíveis', { timeout: 10000 }).should('be.visible')
    })
  })

  describe('Services API', () => {
    it('GET /api/services should return 400 without influencer_id', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/services`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(400)
      })
    })

    it('GET /api/services should return influencer services', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/services?influencer_id=9cf0dc4e-f66d-49b7-b81b-d0a5cae86a06`,
        headers: { Authorization: `Bearer ${authToken}` },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body).to.have.property('data')
        expect(res.body.data).to.be.an('array')
      })
    })

    it('POST /api/services should return 401 without auth', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/services`,
        body: { tipo: 'reels', formato: 'online', preco: 500, max_por_dia: 2 },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401)
      })
    })

    it('POST /api/services should return 400 with invalid data', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/services`,
        headers: { Authorization: `Bearer ${authToken}` },
        body: { tipo: 'tipo-invalido', formato: 'online', preco: -10 },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(400)
      })
    })

    it('POST /api/services should create a service with valid data', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/services`,
        headers: { Authorization: `Bearer ${authToken}` },
        body: { tipo: 'stories', formato: 'online', preco: 150, max_por_dia: 3 },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(201)
        expect(res.body).to.have.property('data')
        expect(res.body.data).to.have.property('id')

        const serviceId = res.body.data.id

        cy.request({
          method: 'PATCH',
          url: `${baseUrl}/api/services/${serviceId}`,
          headers: { Authorization: `Bearer ${authToken}` },
          body: { preco: 200, descricao: 'Atualizado via E2E' },
          failOnStatusCode: false,
        }).then((patchRes) => {
          expect(patchRes.status).to.eq(200)
          expect(patchRes.body.data.preco).to.eq(200)
        })

        cy.request({
          method: 'DELETE',
          url: `${baseUrl}/api/services/${serviceId}`,
          headers: { Authorization: `Bearer ${authToken}` },
          failOnStatusCode: false,
        }).then((delRes) => {
          expect(delRes.status).to.eq(200)
          expect(delRes.body).to.have.property('deleted', true)
        })
      })
    })

    it('PATCH /api/services/[id] should return 401 without auth', () => {
      cy.request({
        method: 'PATCH',
        url: `${baseUrl}/api/services/00000000-0000-0000-0000-000000000000`,
        body: { preco: 100 },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401)
      })
    })

    it('PATCH /api/services/[id] should return 403 for service owned by another influencer', () => {
      cy.request({
        method: 'PATCH',
        url: `${baseUrl}/api/services/00000000-0000-0000-0000-000000000000`,
        headers: { Authorization: `Bearer ${authToken}` },
        body: { preco: 100 },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.be.oneOf([403, 404])
      })
    })

    it('DELETE /api/services/[id] should return 401 without auth', () => {
      cy.request({
        method: 'DELETE',
        url: `${baseUrl}/api/services/00000000-0000-0000-0000-000000000000`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401)
      })
    })
  })
})
